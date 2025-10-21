#!/bin/bash
# =============================================================================
# PRODUCTION REDIS RESET SCRIPT
# =============================================================================
# This script should only be used when necessary to reset the production Redis cache
# USE WITH CAUTION - This will clear all Redis cache data

set -e

echo "=============================================="
echo "PRODUCTION REDIS RESET - WARNING"
echo "=============================================="
echo "⚠️  This will DELETE all production Redis cache data!"
echo "⚠️  This includes chat sessions, temporary data, and cached information!"
echo "⚠️  This action cannot be undone!"
echo ""

read -p "Are you absolutely sure you want to continue? (type 'DELETE' to confirm): " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo "❌ Redis reset cancelled"
    exit 1
fi

echo ""
echo "✓ Confirmation received. Proceeding with Redis reset..."

# Stop the services
echo "Stopping services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove the production Redis volume
echo "Removing production Redis volume..."
docker volume rm eh_app_redis_prod || {
    echo "⚠️  Volume eh_app_redis_prod not found or already removed"
}

# Remove the production Redis container
echo "Removing production Redis container..."
docker container rm eh-app-redis || {
    echo "⚠️  Container eh-app-redis not found or already removed"
}

echo ""
echo "✓ Production Redis reset complete!"
echo ""
echo "To redeploy with fresh Redis:"
echo "  1. Run: ./scripts/deploy-prod.sh"
echo "  2. Redis will be recreated with fresh credentials"
echo ""
echo "Note: This will not affect the main database, only cache data"
echo ""