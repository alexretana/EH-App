#!/bin/bash
# =============================================================================
# PRODUCTION DATABASE RESET SCRIPT
# =============================================================================
# This script should only be used when necessary to reset the production database
# USE WITH CAUTION - This will delete all production data

set -e

echo "=============================================="
echo "PRODUCTION DATABASE RESET - WARNING"
echo "=============================================="
echo "⚠️  This will DELETE all production database data!"
echo "⚠️  This action cannot be undone!"
echo ""

read -p "Are you absolutely sure you want to continue? (type 'DELETE' to confirm): " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "❌ Database reset cancelled"
    exit 1
fi

echo ""
echo "✓ Confirmation received. Proceeding with database reset..."

# Stop the services
echo "Stopping services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove the production database volume
echo "Removing production database volume..."
docker volume rm eh_app_postgres_prod || {
    echo "⚠️  Volume eh_app_postgres_prod not found or already removed"
}

# Remove the production database container
echo "Removing production database container..."
docker container rm eh-app-postgres || {
    echo "⚠️  Container eh-app-postgres not found or already removed"
}

echo ""
echo "✓ Production database reset complete!"
echo ""
echo "To redeploy with fresh database:"
echo "  1. Run: ./scripts/deploy-prod.sh"
echo "  2. The database will be recreated with fresh credentials"
echo ""