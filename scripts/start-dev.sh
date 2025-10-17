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
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

echo ""
echo "Starting services in development mode..."
echo "This will:"
echo "  • Use hot-reload for frontend and backend"
echo "  • Enable debug logging"
echo "  • Seed database with mock data"
echo "  • Mount local directories for live code changes"
echo ""

# Start services in development mode
docker-compose \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up --build

echo ""
echo "=============================================="
echo "Development environment stopped"
echo "=============================================="