import asyncio
import json
from backend.agents import run_negotiation_pipeline

sample_quote = """
QUOTE PROPOSAL
=========================
Supplier: Apex Solutions Inc
Date: 2026-06-25

We are pleased to offer you the following proposal:
Item: Premium Stainless Steel Pipes
Quantity: 100 meters
Unit Price: $2,100.00
Total Quoted Price: $210,000.00

Delivery Time: 12 working days from purchase order.
Payment terms: Immediate Payment (Advance)

Thank you for choosing Apex Solutions!
=========================
"""

async def main():
    print("=== TESTING OFFLINE VECTOR MULTI-AGENT PIPELINE ===")
    print("Feeding mock quote text to Agent 1 (Quote Analyzer)...")
    
    result = await run_negotiation_pipeline(sample_quote, "apex_quote_test.txt")
    
    print("\nResult Extracted:")
    print(json.dumps(result["extracted"], indent=2))
    
    print("\nMarket Comparison Calculations (using local MCP):")
    print(json.dumps(result["market_comparison"], indent=2))
    
    print("\nNegotiation Strategy and Email (Agent 3):")
    print("Strategy Recommendations:")
    for step in result["negotiation"]["strategy"]:
        print(f" - {step}")
    print("\nFinal Recommended Deal:")
    print(f" > {result['negotiation']['final_recommendation']}")
    print("\nDraft Counteroffer Email:")
    print(result["negotiation"]["counteroffer_email"])

if __name__ == "__main__":
    asyncio.run(main())
