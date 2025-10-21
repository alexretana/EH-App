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

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ Error: .env.prod not found"
    echo "Please create it with production-specific settings"
    exit 1
fi

# Generate production secrets if needed
if [ ! -f .env.generated ]; then
    echo "🔧 Generating production secrets..."
    ./scripts/generate-production-secrets.sh
    echo ""
else
    echo "✓ Production secrets already exist"
    echo ""
fi

echo ""
echo "Configuration files ready"
echo ""

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
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

echo ""
echo "Building and starting services in production mode (locally)..."
echo ""

# Create merged environment file for Docker Compose interpolation
echo "Merging environment files for Docker Compose..."
cat .env.infrastructure .env.credentials .env.prod .env.generated > .env
echo "✓ Environment files merged to .env"

# Export all environment variables from the merged .env file
echo "Exporting environment variables..."
set -a
source .env
set +a
echo "✓ Environment variables exported"

# Start services in production mode
docker compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up --build

echo ""
echo "=============================================="
echo "Local production test stopped"
echo "=============================================="
echo ""
echo "To clean up:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo ""