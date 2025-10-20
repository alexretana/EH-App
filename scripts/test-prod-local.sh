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

# Generate production secrets if needed
if [ ! -f .env.generated ]; then
    echo "🔧 Generating production secrets..."
    ./scripts/generate-production-secrets.sh
    echo ""
else
    echo "✓ Production secrets already exist"
    echo ""
fi

# Check if .env.generated exists, create it if it doesn't
if [ ! -f .env.generated ]; then
    echo "⚠️  .env.generated not found"
    echo "Generating production secrets..."
    ./scripts/generate-production-secrets.sh
    echo ""
    echo "⚠️  IMPORTANT: Update Discord bot credentials in .env.generated"
    echo ""
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
cat .env.infrastructure .env.production .env.credentials .env.third-party .env.generated > .env.merged.prod
echo "✓ Environment files merged to .env.merged.prod"

# Start services in production mode
docker compose \
    --env-file .env.merged.prod \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up --build

# Clean up merged environment file
rm .env.merged.prod

echo ""
echo "=============================================="
echo "Local production test stopped"
echo "=============================================="
echo ""
echo "To clean up:"
echo "  docker compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo ""