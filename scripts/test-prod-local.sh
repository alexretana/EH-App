#!/bin/bash
# =============================================================================
# LOCAL PRODUCTION TEST SCRIPT
# =============================================================================
# This script tests the production build locally before deploying
# Useful for validating production configuration without affecting live services

set -e

echo "=============================================="
echo "Testing PRODUCTION mode locally"
echo "=============================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create it with production-specific settings"
    exit 1
fi

echo "⚠️  This will run production builds locally"
echo "   • Frontend will be built as static files"
echo "   • Backend will run with multiple workers"
echo "   • Database will NOT seed mock data"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Stop any running containers
echo ""
echo "Stopping any running containers..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

echo ""
echo "Building and starting services in production mode (locally)..."
echo ""

# Start services in production mode
docker-compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up --build

echo ""
echo "=============================================="
echo "Local production test stopped"
echo "=============================================="
echo ""
echo "To clean up:"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo ""