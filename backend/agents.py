import re
import json
import asyncio
from backend.mcp_client import get_market_price_from_mcp, get_supplier_rating_from_mcp

# Helper to normalize values
def parse_numeric(val_str: str) -> float:
    if not val_str:
        return 0.0
    # Extract numbers and decimal points
    cleaned = re.sub(r"[^\d.]", "", val_str)
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0

def parse_integer(val_str: str) -> int:
    if not val_str:
        return 1
    cleaned = re.sub(r"[^\d]", "", val_str)
    try:
        return int(cleaned) if cleaned else 1
    except ValueError:
        return 1

# AGENT 1: Quote Analyzer Agent (Local Regex & Heuristic-based Offline Extractor)
def agent_quote_analyzer(raw_text: str) -> dict:
    """
    Parses the supplier quote text to extract key entities and terms.
    Features heuristics to capture product names, vendors, prices, payment terms, and delivery times.
    """
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    
    # Initialize defaults
    product_name = "Unknown Product"
    vendor_name = "Unknown Vendor"
    price = 0.0
    quantity = 1
    unit = "unit"
    delivery_time = "7 days"
    payment_terms = "Net 30"
    
    # Simple keyword mappings
    import os
    import json
    base_dir = os.path.dirname(os.path.abspath(__file__))
    benchmarks_path = os.path.join(base_dir, "benchmarks.json")
    custom_keywords = []
    try:
        with open(benchmarks_path, "r") as f:
            benchmarks_data = json.load(f)
            custom_keywords = [k.lower() for k in benchmarks_data.keys()]
    except Exception:
        pass
        
    product_keywords = list(set(["laptop", "server", "office chair", "desk", "steel", "cloud", "consulting", "software", "hardware", "furniture", "chair"] + custom_keywords))
    vendor_keywords = ["apex solutions", "apex", "global tech", "global", "nova corp", "nova", "corp", "technologies", "suppliers"]
    
    text_lower = raw_text.lower()
    
    # 1. Product Name extraction
    # Look for common product keywords
    for keyword in product_keywords:
        if keyword in text_lower:
            product_name = keyword.capitalize()
            # Try to grab a more specific phrase if possible
            for line in lines:
                if keyword in line.lower():
                    # E.g. "Product: ThinkPad Laptops" -> "ThinkPad Laptops"
                    match = re.search(r"(?:product|item|description|quote\s*for)\s*[:\-]\s*(.*)", line, re.IGNORECASE)
                    if match:
                        product_name = match.group(1).strip()
                    else:
                        # Just clean up the line containing the keyword
                        clean_line = re.sub(r"(?:item|product|description|qty|quantity|price|\$)\s*[:\-]?\s*", "", line, flags=re.IGNORECASE)
                        if len(clean_line.strip()) > 3:
                            product_name = clean_line.strip()
                    break
            break
            
    # 2. Vendor Name extraction
    # Look for "from: vendor", "supplier: vendor", "vendor: name"
    vendor_match = re.search(r"(?:vendor|supplier|from|seller|company|quote\s*by)\s*[:\-]\s*(.*)", raw_text, re.IGNORECASE)
    if vendor_match:
        vendor_name = vendor_match.group(1).split("\n")[0].strip()
    else:
        # Check against known mock vendors first
        found = False
        for kw in vendor_keywords:
            if kw in text_lower:
                for line in lines:
                    if kw in line.lower() and not any(x in line.lower() for x in ["to:", "attention", "attn"]):
                        vendor_name = line.strip()
                        found = True
                        break
                if found:
                    break
        # If still unknown, check first line if it looks like a header
        if vendor_name == "Unknown Vendor" and len(lines) > 0:
            if not any(keyword in lines[0].lower() for keyword in ["quote", "proposal", "estimate", "date"]):
                vendor_name = lines[0]

    # Clean vendor name if too long
    if len(vendor_name) > 60:
        vendor_name = vendor_name[:60] + "..."

    # 3. Price extraction
    # Look for lines containing "total", "price", "amount", "cost" and numeric values
    price_found = False
    for line in lines:
        if any(w in line.lower() for w in ["total", "amount due", "grand total", "net price", "subtotal", "cost"]):
            # Find dollar amounts, e.g. $1,200.00 or 1500
            price_match = re.search(r"\$\s*([\d,]+(?:\.\d{2})?)", line)
            if price_match:
                price = parse_numeric(price_match.group(1))
                price_found = True
                break
            else:
                # Look for numbers
                numbers = re.findall(r"([\d,]+(?:\.\d{2})?)", line)
                if numbers:
                    # Grab the last number, usually the total
                    price = parse_numeric(numbers[-1])
                    price_found = True
                    break
                    
    if not price_found:
        # Fallback: scan whole text for dollar sign
        all_dollars = re.findall(r"\$\s*([\d,]+(?:\.\d{2})?)", raw_text)
        if all_dollars:
            price = max([parse_numeric(d) for d in all_dollars]) # assume highest is total

    # 4. Quantity extraction
    qty_match = re.search(r"(?:quantity|qty|units|pcs|items)\s*[:\-]?\s*(\d+)", raw_text, re.IGNORECASE)
    if qty_match:
        quantity = parse_integer(qty_match.group(1))
    else:
        # Check lines containing numbers and look for products
        for line in lines:
            if "qty" in line.lower() or "quantity" in line.lower():
                nums = re.findall(r"\b\d+\b", line)
                if nums:
                    quantity = int(nums[0])
                    break

    # 5. Delivery Time extraction
    delivery_match = re.search(r"(?:delivery|shipment|lead\s*time|shipping|delivery\s*time)\s*(?:takes|is|within|:|\-)?\s*(\d+\s*(?:days?|weeks?|months?|working\s*days))", raw_text, re.IGNORECASE)
    if delivery_match:
        delivery_time = delivery_match.group(1).strip()
    else:
        # Search for "days" in the text
        days_match = re.search(r"(\d+\s*(?:days?|weeks?))", raw_text, re.IGNORECASE)
        if days_match:
            delivery_time = days_match.group(1).strip()

    # 6. Payment Terms extraction
    payment_match = re.search(r"(?:payment|payment\s*terms?|terms?)\s*[:\-]\s*(.*)", raw_text, re.IGNORECASE)
    if payment_match:
        payment_terms = payment_match.group(1).split("\n")[0].strip()
    else:
        # Check common terms
        for term in ["net 30", "net 60", "net 90", "cod", "cash on delivery", "due on receipt", "advance payment", "immediate"]:
            if term in text_lower:
                payment_terms = term.upper()
                break

    # 7. Unit extraction
    if "month" in text_lower or "monthly" in text_lower:
        unit = "month"
    elif "hour" in text_lower or "hourly" in text_lower or "rate" in text_lower:
        unit = "hour"
    elif "ton" in text_lower or "metric ton" in text_lower:
        unit = "ton"
    
    return {
        "product_name": product_name,
        "vendor_name": vendor_name,
        "price": price,
        "quantity": quantity,
        "unit": unit,
        "delivery_time": delivery_time,
        "payment_terms": payment_terms
    }


# AGENT 2: Market Comparison Agent (Offline MCP Integrator & Risk Scorer)
async def agent_market_comparison(extracted: dict) -> dict:
    """
    Connects to the local MCP server to retrieve market benchmarks and vendor risks.
    Calculates savings estimate, compares unit prices, and computes a comprehensive risk score.
    """
    product = extracted["product_name"]
    vendor = extracted["vendor_name"]
    price = extracted["price"]
    qty = extracted["quantity"]
    
    # 1. Fetch benchmark details from MCP server
    market_data = await get_market_price_from_mcp(product)
    supplier_data = await get_supplier_rating_from_mcp(vendor)
    
    market_avg = market_data.get("average_price", 100.0)
    market_min = market_data.get("min_price", 80.0)
    market_max = market_data.get("max_price", 130.0)
    market_unit = market_data.get("unit", "unit")
    
    vendor_rating = supplier_data.get("rating", 4.0)
    vendor_risk = supplier_data.get("risk_level", "Medium")
    vendor_reliability = supplier_data.get("reliability_score", 0.90)
    vendor_delivery_avg = supplier_data.get("delivery_time_avg_days", 7)
    
    # 2. Comparison calculations
    unit_price = price / qty if qty > 0 else price
    
    # Savings: what it would cost at average vs what they quoted
    market_total = market_avg * qty
    savings = market_total - price
    if savings < 0:
        savings = 0.0 # No savings if overpriced
        
    price_variance_pct = ((unit_price - market_avg) / market_avg * 100) if market_avg > 0 else 0
    
    # 3. Calculate Risk Score (0 = Perfect, 100 = Extremely Risky)
    risk_score = 50.0 # Baseline
    
    # Price impact
    if unit_price > market_avg:
        # Overpriced -> increase risk
        diff_pct = (unit_price - market_avg) / market_avg
        risk_score += min(diff_pct * 50, 25)
    else:
        # Underpriced -> decrease risk (unless it is suspiciously low)
        diff_pct = (market_avg - unit_price) / market_avg
        if diff_pct > 0.5:
            # Suspiciously cheap (potential fraud or low quality) -> increase risk slightly
            risk_score += 10
        else:
            risk_score -= min(diff_pct * 30, 20)
            
    # Vendor rating impact
    risk_score += (5.0 - vendor_rating) * 12 # Lower rating -> higher risk
    
    # Vendor risk level
    if vendor_risk == "High":
        risk_score += 20
    elif vendor_risk == "Medium":
        risk_score += 5
    elif vendor_risk == "Low":
        risk_score -= 10
        
    # Delivery terms impact
    # Parse quote delivery days
    days_match = re.search(r"(\d+)", extracted["delivery_time"])
    quote_days = int(days_match.group(1)) if days_match else 7
    if quote_days > vendor_delivery_avg:
        risk_score += min((quote_days - vendor_delivery_avg) * 2, 10)
    else:
        risk_score -= 5
        
    # Payment terms impact
    pay_terms = extracted["payment_terms"].lower()
    if any(t in pay_terms for t in ["immediate", "due on receipt", "cod", "advance"]):
        risk_score += 10
    elif "net 60" in pay_terms or "net 90" in pay_terms:
        risk_score -= 5
        
    # Clamp risk score
    risk_score = max(0.0, min(100.0, round(risk_score, 1)))
    
    return {
        "market_average": market_avg,
        "market_min": market_min,
        "market_max": market_max,
        "vendor_rating": vendor_rating,
        "vendor_risk": vendor_risk,
        "savings_estimate": round(savings, 2),
        "price_variance_pct": round(price_variance_pct, 1),
        "risk_score": risk_score
    }


# AGENT 3: Negotiation Agent (Offline Strategy & Counteroffer Generator)
def agent_negotiator(extracted: dict, comparison: dict) -> dict:
    """
    Generates tailored negotiation recommendations and writes a professional counteroffer email.
    Uses market statistics to construct logical leverage points.
    """
    product = extracted["product_name"]
    vendor = extracted["vendor_name"]
    qty = extracted["quantity"]
    unit = extracted["unit"]
    price = extracted["price"]
    unit_price = price / qty if qty > 0 else price
    
    market_avg = comparison["market_average"]
    market_min = comparison["market_min"]
    vendor_risk = comparison["vendor_risk"]
    vendor_rating = comparison["vendor_rating"]
    
    # 1. Determine target counteroffer price
    # Aim for a competitive price near the market minimum, but realistic.
    # If the quote is already below average, try for a small volume discount (5% off).
    # If the quote is above average, counter at the market average or 5% below average.
    if unit_price <= market_avg:
        target_unit_price = max(market_min, unit_price * 0.93)
    else:
        target_unit_price = market_avg * 0.95
        
    target_unit_price = round(target_unit_price, 2)
    target_total_price = round(target_unit_price * qty, 2)
    suggested_savings = round(price - target_total_price, 2)
    
    # 2. Formulate Strategy Points
    strategy = []
    
    # Price point leverage
    if unit_price > market_avg:
        variance = comparison["price_variance_pct"]
        strategy.append(f"Negotiate Price: The quoted price of ${unit_price:.2f}/{unit} is {variance}% above the market average of ${market_avg:.2f}. Propose a counteroffer of ${target_unit_price:.2f}/{unit} matching market benchmarks.")
    else:
        strategy.append(f"Volume Discount: Although the quote of ${unit_price:.2f}/{unit} is below the market average, request a bulk volume incentive discount of 7%, bringing the price to ${target_unit_price:.2f}/{unit} due to the quantity of {qty}.")
        
    # Delivery terms leverage
    days_match = re.search(r"(\d+)", extracted["delivery_time"])
    quote_days = int(days_match.group(1)) if days_match else 7
    if quote_days > 10:
        strategy.append(f"Shorten Lead Time: The quoted delivery time of {extracted['delivery_time']} is slower than industry norms. Request expedited shipping or reduce delivery terms to 7 days.")
    else:
        strategy.append("Confirm Delivery: Confirm that the quoted delivery window of " + extracted['delivery_time'] + " is guaranteed under contract with SLA penalty clauses.")
        
    # Payment terms leverage
    pay_terms = extracted["payment_terms"].lower()
    if any(t in pay_terms for t in ["immediate", "due on receipt", "cod", "advance"]):
        strategy.append("Negotiate Payment terms: Quoted payment terms require immediate funding. Ask for Net 30 terms to preserve business working capital.")
    else:
        strategy.append(f"Extend Payment Window: Quoted terms are {extracted['payment_terms']}. Suggest extending this to Net 60 or negotiating a 2% early payment discount (2/10 Net 30).")
        
    # Risk-based strategies
    if vendor_rating < 3.5:
        strategy.append("Supplier Quality Clause: Given the supplier's moderate historical reliability score, require an inspection/acceptance period of 10 business days before payment triggers.")
        
    # 3. Create counteroffer email draft
    email_draft = f"""Subject: Counteroffer & Negotiation - Quote for {product}s - {vendor}

Dear {vendor} Sales Team,

Thank you for providing the quote for the {product}s (Quantity: {qty} {unit}s) dated recently. We appreciate the opportunity to collaborate.

Our procurement committee has reviewed the terms. While we are keen on moving forward with {vendor}, we have completed a market analysis for {product} procurement and found that the quoted unit rate of ${unit_price:.2f} lies above our target thresholds. 

To align this transaction with current market benchmarks and our internal budgeting, we would like to propose the following counter-terms:

1. Target Pricing: A revised unit rate of ${target_unit_price:.2f} per {unit}, bringing the total quote to ${target_total_price:.2f} (excluding taxes/shipping). This aligns closely with market averages for this volume.
2. Delivery Lead Time: A committed delivery frame of {min(quote_days, 7)} business days from order placement.
3. Payment Terms: Net 30 days invoice settlement (revised from {extracted['payment_terms']}).

We believe this represents a fair, competitive agreement that supports a long-term commercial partnership. Please let us know if you can accommodate these terms so we can draft the purchase order.

We look forward to hearing from you.

Best regards,

Procurement Team
Vector Operations Ltd.
"""

    final_rec = f"Secure the order at ${target_unit_price:.2f}/{unit} (${target_total_price:.2f} total) with Net 30 payment terms and 7 days delivery guarantee."

    return {
        "strategy": strategy,
        "counteroffer_email": email_draft.strip(),
        "final_recommendation": final_rec
    }


# MAIN MULTI-AGENT COORDINATION WORKFLOW
async def run_negotiation_pipeline(raw_text: str, filename: str = "Pasted Text") -> dict:
    """
    Orchestrates the offline multi-agent quote analysis workflow.
    """
    # Step 1: Agent 1 (Quote Analyzer) - extracts structured terms
    extracted_data = agent_quote_analyzer(raw_text)
    
    # Step 2: Agent 2 (Market Comparison) - makes local MCP calls, calculates benchmarks and risk
    comparison_data = await agent_market_comparison(extracted_data)
    
    # Step 3: Agent 3 (Negotiator) - suggests strategy and counteroffer email
    negotiation_data = agent_negotiator(extracted_data, comparison_data)
    
    return {
        "filename": filename,
        "raw_text": raw_text,
        "extracted": extracted_data,
        "market_comparison": comparison_data,
        "negotiation": negotiation_data
    }
