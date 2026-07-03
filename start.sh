#!/bin/bash

# Terminate all background processes on shell exit
trap "exit" INT TERM ERR
trap "kill 0" EXIT

echo "=== Starting VECTOR: AI Procurement Negotiation Assistant ==="

# 1. Start local FastAPI backend (which runs the MCP client/server dynamically)
echo "Starting FastAPI backend on port 8000..."
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# 2. Navigate to frontend and start Next.js production server
echo "Starting Next.js frontend on port 3000..."
cd /app/frontend
npm run start -- -p 3000 &

# Wait for processes
wait -n
