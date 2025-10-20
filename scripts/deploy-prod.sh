#!/bin/bash
# =============================================================================
# PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script deploys the Event Horizon application to production
# on a Digital Ocean droplet or similar Ubuntu VM

set -e

echo "=============================================="
echo "Deploying Event Horizon in PRODUCTION mode"
echo "=============================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production not found"
    echo "Please create it with production-specific settings"
    exit 1
fi

# Check if .env.credentials exists
if [ ! -f .env.credentials ]; then
    echo "❌ Error: .env.credentials not found"
    echo "Production requires actual credentials"
    exit 1
fi

# Check if .env.third-party exists
if [ ! -f .env.third-party ]; then
    echo "❌ Error: .env.third-party not found"
    echo "Production requires third-party API keys"
    exit 1
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

# Generate production secrets if needed
if [ ! -f .env.generated ]; then
    echo "🔧 Generating production secrets..."
    ./scripts/generate-production-secrets.sh
    echo ""
else
    echo "✓ Production secrets already exist"
fi

echo "✓ Configuration files verified"
echo ""

# Pull latest code (if in a git repository)
if [ -d .git ]; then
    echo "Pulling latest code..."
    git pull origin main || {
        echo "⚠️  Warning: git pull failed, continuing with current code"
    }
    echo ""
fi

# Backup current database (optional but recommended)
echo "Do you want to backup the current database? (y/n)"
read -r BACKUP_DB
if [ "$BACKUP_DB" = "y" ]; then
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    echo "Creating database backup..."
    docker-compose exec -T postgres pg_dump -U event_horizon_user event_horizon > "$BACKUP_DIR/database_backup.sql" || {
        echo "⚠️  Warning: Database backup failed"
    }
    echo "✓ Database backed up to $BACKUP_DIR"
    echo ""
fi

echo "Building and starting services in production mode..."
echo "This will:"
echo "  • Build optimized frontend with static files"
echo "  • Run backend with multiple workers"
echo "  • Enable HTTPS with Let's Encrypt"
echo "  • Use production database (no mock data)"
echo "  • Apply restrictive CORS policies"
echo ""

# Build and deploy with production configuration
docker-compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up -d --build

echo ""
echo "Waiting for services to start..."
sleep 10

# Show running services
echo ""
echo "=============================================="
echo "Running Services:"
echo "=============================================="
docker-compose ps

echo ""
echo "=============================================="
echo "Production deployment complete!"
echo "=============================================="
echo ""
echo "Services available at:"
echo "  • Frontend: https://event-horizon.retanatech.com"
echo "  • Backend API: https://event-horizon.retanatech.com/api"
echo "  • n8n: https://eh-n8n.retanatech.com"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "To stop all services:"
echo "  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down"
echo ""