import datetime
import json
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./vector_procurement.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class QuoteAnalysis(Base):
    __tablename__ = "quote_analyses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    filename = Column(String, default="Pasted Text")
    raw_text = Column(Text)
    
    # Agent 1 Extracted fields
    product_name = Column(String)
    vendor_name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    unit = Column(String)
    delivery_time = Column(String)
    payment_terms = Column(String)
    
    # Agent 2 Market data fields
    market_average = Column(Float)
    market_min = Column(Float)
    market_max = Column(Float)
    vendor_rating = Column(Float)
    vendor_risk = Column(String)
    savings_estimate = Column(Float)
    risk_score = Column(Float)  # 0 to 100
    
    # Agent 3 Negotiation outputs
    negotiation_strategy = Column(Text)  # JSON-encoded array of suggestions
    counteroffer_email = Column(Text)
    final_recommendation = Column(Text)

    def to_dict(self):
        # Helper to convert to dict easily
        try:
            strategy = json.loads(self.negotiation_strategy) if self.negotiation_strategy else []
        except Exception:
            strategy = [self.negotiation_strategy] if self.negotiation_strategy else []
            
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "filename": self.filename,
            "raw_text": self.raw_text,
            "extracted": {
                "product_name": self.product_name,
                "vendor_name": self.vendor_name,
                "price": self.price,
                "quantity": self.quantity,
                "unit": self.unit,
                "delivery_time": self.delivery_time,
                "payment_terms": self.payment_terms,
            },
            "market_comparison": {
                "market_average": self.market_average,
                "market_min": self.market_min,
                "market_max": self.market_max,
                "vendor_rating": self.vendor_rating,
                "vendor_risk": self.vendor_risk,
                "savings_estimate": self.savings_estimate,
                "risk_score": self.risk_score,
            },
            "negotiation": {
                "strategy": strategy,
                "counteroffer_email": self.counteroffer_email,
                "final_recommendation": self.final_recommendation,
            }
        }

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
