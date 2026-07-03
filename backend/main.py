import io
import json
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import init_db, get_db, QuoteAnalysis
from backend.agents import run_negotiation_pipeline

# Initialize Database
init_db()

app = FastAPI(title="VECTOR: AI Procurement Negotiation Assistant")

# Configure CORS for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For hackathon setup, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional PDF parsing import
try:
    import pypdf
    PDF_PARSING_AVAILABLE = True
except ImportError:
    PDF_PARSING_AVAILABLE = False

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from a PDF file using pypdf."""
    if not PDF_PARSING_AVAILABLE:
        return "[Error: pypdf library not installed on backend, cannot parse PDF]"
        
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text
    except Exception as e:
        return f"[Error parsing PDF: {str(e)}]"

@app.post("/api/analyze")
async def analyze_quote(
    file: Optional[UploadFile] = File(None),
    pasted_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Accepts supplier quote via file upload (TXT/PDF) or pasted raw text,
    runs the offline multi-agent evaluation pipeline, saves result to SQLite,
    and returns the complete structured analysis.
    """
    raw_text = ""
    filename = "Pasted Text"
    
    if file:
        filename = file.filename
        file_bytes = await file.read()
        
        if file.filename.lower().endswith(".pdf"):
            if not PDF_PARSING_AVAILABLE:
                raise HTTPException(
                    status_code=400,
                    detail="PDF parsing is not enabled. Please make sure pypdf is installed in the python environment."
                )
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            # Assume text/csv file
            try:
                raw_text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                try:
                    raw_text = file_bytes.decode("latin-1")
                except Exception:
                    raise HTTPException(status_code=400, detail="Failed to decode text file. Ensure it is UTF-8 or ASCII encoded.")
    elif pasted_text:
        raw_text = pasted_text
    else:
        raise HTTPException(status_code=400, detail="Either a file upload or pasted text must be provided.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Quote text content is empty.")

    # Run the offline Multi-Agent system
    try:
        analysis_result = await run_negotiation_pipeline(raw_text, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multi-Agent pipeline failed: {str(e)}")

    # Persist the output into SQLite DB
    try:
        db_quote = QuoteAnalysis(
            filename=analysis_result["filename"],
            raw_text=analysis_result["raw_text"],
            product_name=analysis_result["extracted"]["product_name"],
            vendor_name=analysis_result["extracted"]["vendor_name"],
            price=analysis_result["extracted"]["price"],
            quantity=analysis_result["extracted"]["quantity"],
            unit=analysis_result["extracted"]["unit"],
            delivery_time=analysis_result["extracted"]["delivery_time"],
            payment_terms=analysis_result["extracted"]["payment_terms"],
            market_average=analysis_result["market_comparison"]["market_average"],
            market_min=analysis_result["market_comparison"]["market_min"],
            market_max=analysis_result["market_comparison"]["market_max"],
            vendor_rating=analysis_result["market_comparison"]["vendor_rating"],
            vendor_risk=analysis_result["market_comparison"]["vendor_risk"],
            savings_estimate=analysis_result["market_comparison"]["savings_estimate"],
            risk_score=analysis_result["market_comparison"]["risk_score"],
            negotiation_strategy=json.dumps(analysis_result["negotiation"]["strategy"]),
            counteroffer_email=analysis_result["negotiation"]["counteroffer_email"],
            final_recommendation=analysis_result["negotiation"]["final_recommendation"]
        )
        db.add(db_quote)
        db.commit()
        db.refresh(db_quote)
        
        return db_quote.to_dict()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database persistence failed: {str(e)}")

@app.get("/api/quotes")
async def list_quotes(db: Session = Depends(get_db)):
    """Retrieves all past supplier quote analyses ordered by date."""
    quotes = db.query(QuoteAnalysis).order_by(QuoteAnalysis.id.desc()).all()
    return [q.to_dict() for q in quotes]

@app.get("/api/quotes/{quote_id}")
async def get_quote_details(quote_id: int, db: Session = Depends(get_db)):
    """Retrieves details of a specific quote analysis."""
    quote = db.query(QuoteAnalysis).filter(QuoteAnalysis.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote analysis not found")
    return quote.to_dict()

@app.delete("/api/quotes/{quote_id}")
async def delete_quote(quote_id: int, db: Session = Depends(get_db)):
    """Deletes a specific quote analysis."""
    quote = db.query(QuoteAnalysis).filter(QuoteAnalysis.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote analysis not found")
    try:
        db.delete(quote)
        db.commit()
        return {"status": "success", "message": f"Quote {quote_id} deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")

import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BENCHMARKS_PATH = os.path.join(BASE_DIR, "benchmarks.json")

@app.get("/api/benchmarks")
async def get_benchmarks():
    """Retrieves all benchmarks from benchmarks.json."""
    try:
        with open(BENCHMARKS_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load benchmarks: {str(e)}")

@app.post("/api/benchmarks")
async def update_benchmarks(benchmarks: dict):
    """Saves new benchmarks to benchmarks.json."""
    try:
        with open(BENCHMARKS_PATH, "w") as f:
            json.dump(benchmarks, f, indent=2)
        return {"status": "success", "message": "Benchmarks updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update benchmarks: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
