#!/bin/bash
# =============================================================================
# DEVELOPMENT ENVIRONMENT STARTUP SCRIPT
# =============================================================================
# This script starts the Event Horizon application in development mode
# with hot-reload, debug logging, and mock data

set -e

echo "=============================================="
echo "Starting Event Horizon in DEVELOPMENT mode"
echo "=============================================="
echo ""

# Check if .env.infrastructure exists
if [ ! -f .env.infrastructure ]; then
    echo "❌ Error: .env.infrastructure not found"
    echo "Please create it with infrastructure-specific settings"
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

# Check if .env.dev exists
if [ ! -f .env.dev ]; then
    echo "❌ Error: .env.dev not found"
    echo "Please create it with development-specific settings"
    exit 1
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
cat .env.infrastructure .env.credentials .env.dev > .env
echo "✓ Environment files merged to .env"

# Export all environment variables from the merged .env file
echo "Exporting environment variables..."
set -a
source .env
set +a
echo "✓ Environment variables exported"

# Start services in development mode
docker compose \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up --build

echo ""
echo "=============================================="
echo "Development environment stopped"
echo "=============================================="