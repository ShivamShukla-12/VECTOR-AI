import asyncio
import sys
import os
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """
    Spawns the local MCP server as a subprocess, initializes a session,
    calls the specified tool, retrieves the output, and shuts down cleanly.
    """
    # Use the active python executable (which will be in our venv)
    python_exe = sys.executable
    server_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "mcp_server.py"))
    
    server_params = StdioServerParameters(
        command=python_exe,
        args=[server_script],
        env=os.environ.copy()
    )
    
    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                # Initialize the session
                await session.initialize()
                
                # Call the tool
                response = await session.call_tool(tool_name, arguments)
                
                # Parse results
                result_text = ""
                if response and hasattr(response, "content") and response.content:
                    for item in response.content:
                        if hasattr(item, "text"):
                            result_text += item.text
                        elif isinstance(item, dict) and item.get("type") == "text":
                            result_text += item.get("text", "")
                
                try:
                    return json.loads(result_text)
                except Exception:
                    return {"raw_response": result_text, "status": "parse_error"}
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": f"Failed to connect or communicate with local MCP server at {server_script}"
        }

async def get_market_price_from_mcp(product_name: str) -> dict:
    """Helper to query get_market_price tool via MCP"""
    return await call_mcp_tool("get_market_price", {"product_name": product_name})

async def get_supplier_rating_from_mcp(vendor_name: str) -> dict:
    """Helper to query get_supplier_rating tool via MCP"""
    return await call_mcp_tool("get_supplier_rating", {"vendor_name": vendor_name})

# Simple self-test code
if __name__ == "__main__":
    async def main():
        print("Testing local MCP client integration...")
        price_res = await get_market_price_from_mcp("laptops")
        print("Market Price Result:")
        print(json.dumps(price_res, indent=2))
        
        rating_res = await get_supplier_rating_from_mcp("Apex Solutions")
        print("\nSupplier Rating Result:")
        print(json.dumps(rating_res, indent=2))
        
    asyncio.run(main())
