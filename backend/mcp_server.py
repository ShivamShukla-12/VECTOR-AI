import json
import sys
import os
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP Server
mcp = FastMCP("Vector-Procurement")

# Load benchmarks dynamically from local benchmarks.json file
base_dir = os.path.dirname(os.path.abspath(__file__))
benchmarks_path = os.path.join(base_dir, "benchmarks.json")

# Vendor-to-product classification map to associate vendor metrics with user dataset
VENDOR_PRODUCT_MAP = {
    "apex": "Stainless Steel Pipes",
    "global": "Plastic Granules",
    "nova": "Microcontrollers"
}

def load_benchmarks() -> dict:
    """Helper to read benchmarks.json dynamically from disk."""
    try:
        with open(benchmarks_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading benchmarks.json: {e}", file=sys.stderr)
        # Return fallback dataset
        return {
            "Stainless Steel Pipes": {"market_price": 1950, "supplier_rating": 72},
            "Plastic Granules": {"market_price": 118, "supplier_rating": 89},
            "Microcontrollers": {"market_price": 3900, "supplier_rating": 54}
        }

@mcp.tool()
def get_market_price(product_name: str) -> str:
    """
    Get the current average market price, minimum price, maximum price, and unit of pricing for a given product or service.
    
    Args:
        product_name: The name of the product or service (e.g., 'Stainless Steel Pipes', 'Plastic Granules', 'Microcontrollers').
    """
    benchmarks = load_benchmarks()
    prod_lower = product_name.lower()
    
    # Match product name against JSON keys
    matched_key = None
    for key in benchmarks:
        if key.lower() in prod_lower or prod_lower in key.lower():
            matched_key = key
            break
            
    if matched_key:
        data = benchmarks[matched_key]
        market_price = data["market_price"]
        
        # Apply standard units based on product categories
        unit = "unit"
        if "pipes" in matched_key.lower():
            unit = "meter"
        elif "granules" in matched_key.lower():
            unit = "ton"
            
        return json.dumps({
            "product_name": product_name,
            "matched_category": matched_key,
            "average_price": float(market_price),
            "min_price": float(round(market_price * 0.85, 2)),
            "max_price": float(round(market_price * 1.15, 2)),
            "unit": unit,
            "status": "success"
        })
    else:
        return json.dumps({
            "product_name": product_name,
            "matched_category": "generic",
            "average_price": 100.0,
            "min_price": 80.0,
            "max_price": 120.0,
            "unit": "unit",
            "status": "not_found_default_applied"
        })

@mcp.tool()
def get_supplier_rating(vendor_name: str) -> str:
    """
    Get the supplier rating, risk level, reliability score, and average delivery time for a vendor.
    
    Args:
        vendor_name: The name of the supplier or vendor (e.g., 'Apex Solutions', 'Global Tech', 'Nova Corp').
    """
    benchmarks = load_benchmarks()
    vendor_lower = vendor_name.lower()
    
    # Associate vendor name with their product portfolio
    matched_product = None
    for vk, pk in VENDOR_PRODUCT_MAP.items():
        if vk in vendor_lower:
            matched_product = pk
            break
            
    if matched_product and matched_product in benchmarks:
        score = benchmarks[matched_product]["supplier_rating"]
        # Convert 100-point scale to a 5.0-scale
        star_rating = round(score / 20.0, 1)
        
        # Map ratings to logical risk scores and reliability profiles
        if score >= 85:
            risk_level = "Low"
            reliability = 0.96
            delivery_avg = 5
        elif score >= 70:
            risk_level = "Medium"
            reliability = 0.85
            delivery_avg = 10
        else:
            risk_level = "High"
            reliability = 0.60
            delivery_avg = 20
            
        return json.dumps({
            "vendor_name": vendor_name,
            "matched_category": matched_product,
            "rating": star_rating,
            "rating_score_100": score,
            "risk_level": risk_level,
            "reliability_score": reliability,
            "delivery_time_avg_days": delivery_avg,
            "notes": f"Verified supplier of {matched_product}. Quality benchmark rating: {score}/100.",
            "status": "success"
        })
    else:
        return json.dumps({
            "vendor_name": vendor_name,
            "matched_category": "generic",
            "rating": 3.8,
            "rating_score_100": 76,
            "risk_level": "Medium",
            "reliability_score": 0.88,
            "delivery_time_avg_days": 8,
            "notes": "Vendor not in local index. Displaying regional baseline stats.",
            "status": "not_found_default_applied"
        })

if __name__ == "__main__":
    mcp.run()
