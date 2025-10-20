#!/bin/bash
# =============================================================================
# DEVELOPMENT ENVIRONMENT STARTUP SCRIPT WITH MOCK DATA
# =============================================================================
# This script starts the Event Horizon application in development mode
# with hot-reload, debug logging, and ensures mock data is generated

set -e

echo "=============================================="
echo "Starting Event Horizon in DEVELOPMENT mode"
echo "=============================================="
echo ""

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development not found"
    echo "Please create it from the template or copy .env.development from the repository"
    exit 1
fi

# Check if .env.credentials exists
if [ ! -f .env.credentials ]; then
    echo "⚠️  Warning: .env.credentials not found"
    echo "Creating from example template..."
    if [ -f .env.credentials.example ]; then
        cp .env.credentials.example .env.credentials
        echo "✓ Created .env.credentials from example"
        echo "⚠️  Please update .env.credentials with your actual credentials"
    else
        echo "❌ Error: .env.credentials.example not found"
        exit 1
    fi
fi

# Check if .env.third-party exists
if [ ! -f .env.third-party ]; then
    echo "⚠️  Warning: .env.third-party not found"
    echo "Creating from example template..."
    if [ -f .env.third-party.example ]; then
        cp .env.third-party.example .env.third-party
        echo "✓ Created .env.third-party from example"
        echo "⚠️  Please update .env.third-party with your actual API keys"
    else
        echo "❌ Error: .env.third-party.example not found"
        exit 1
    fi
fi

echo ""
echo "Configuration files ready"
echo ""

# Stop any running containers
echo "Stopping any running containers..."
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

echo ""
echo "Starting services in development mode..."
echo "This will:"
echo "  • Use hot-reload for frontend and backend"
echo "  • Enable debug logging"
echo "  • Seed database with mock data"
echo "  • Mount local directories for live code changes"
echo ""

# Create merged environment file for Docker Compose interpolation
echo "Merging environment files for Docker Compose..."
cat .env.development .env.infrastructure .env.credentials .env.third-party > .env.merged.dev
echo "✓ Environment files merged to .env.merged.dev"

# Start services in development mode (detached)
docker compose \
    --env-file .env.merged.dev \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up --build -d

# Clean up merged environment file
rm .env.merged.dev

echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if backend is healthy
echo "Checking backend health..."
until curl -f http://localhost:8000/health > /dev/null 2>&1; do
    echo "Waiting for backend to be healthy..."
    sleep 5
done

echo "Backend is healthy!"

# Generate mock data
echo ""
echo "Generating mock data..."
docker exec eh-app-backend uv run python scripts/generate_missing_mock_data.py

echo ""
echo "=============================================="
echo "Development environment started successfully!"
echo "=============================================="
echo ""
echo "Services are running:"
echo "  • Frontend: http://localhost:5173"
echo "  • Backend:  http://localhost:8000"
echo "  • API Docs: http://localhost:8000/docs"
echo ""
echo "To stop the environment, run:"
echo "  docker compose -f docker-compose.yml -f docker-compose.dev.yml down"