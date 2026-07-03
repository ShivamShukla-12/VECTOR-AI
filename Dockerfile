# Base image combining Python and Node.js
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV HOST=0.0.0.0
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Install dependencies and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Install frontend Node dependencies
COPY frontend/package*.json /app/frontend/
WORKDIR /app/frontend
RUN npm ci

# Copy full project codebase
COPY . /app

# Build Next.js frontend for production
WORKDIR /app/frontend
RUN npm run build

# Make start script executable
RUN chmod +x /app/start.sh

# Expose backend (8000) and frontend (3000)
EXPOSE 8000 3000

# Run the startup script
WORKDIR /app
CMD ["/app/start.sh"]
