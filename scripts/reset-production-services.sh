#!/bin/bash
# =============================================================================
# PRODUCTION SERVICES RESET SCRIPT
# =============================================================================
# This script provides options to reset production services
# USE WITH CAUTION - This will delete production data

set -e

echo "=============================================="
echo "PRODUCTION SERVICES RESET"
echo "=============================================="
echo ""

# Function to reset database
reset_database() {
    echo "=============================================="
    echo "DATABASE RESET - WARNING"
    echo "=============================================="
    echo "⚠️  This will DELETE all production database data!"
    echo "⚠️  This action cannot be undone!"
    echo ""

    read -p "Are you absolutely sure you want to continue? (type 'DELETE' to confirm): " CONFIRM

    if [ "$CONFIRM" != "DELETE" ]; then
        echo "❌ Database reset cancelled"
        return 1
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

    echo "✓ Production database reset complete!"
}

# Function to reset Redis
reset_redis() {
    echo "=============================================="
    echo "REDIS RESET - WARNING"
    echo "=============================================="
    echo "⚠️  This will DELETE all production Redis cache data!"
    echo "⚠️  This includes chat sessions, temporary data, and cached information!"
    echo "⚠️  This action cannot be undone!"
    echo ""

    read -p "Are you absolutely sure you want to continue? (type 'DELETE' to confirm): " CONFIRM

    if [ "$CONFIRM" != "DELETE" ]; then
        echo "❌ Redis reset cancelled"
        return 1
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

    echo "✓ Production Redis reset complete!"
}

# Function to reset all services
reset_all() {
    echo "=============================================="
    echo "ALL SERVICES RESET - CRITICAL WARNING"
    echo "=============================================="
    echo "⚠️  This will DELETE all production data!"
    echo "⚠️  Database, Redis cache, and all application data will be lost!"
    echo "⚠️  This action cannot be undone!"
    echo ""

    read -p "Are you absolutely sure you want to continue? (type 'DELETE_ALL' to confirm): " CONFIRM

    if [ "$CONFIRM" != "DELETE_ALL" ]; then
        echo "❌ All services reset cancelled"
        return 1
    fi

    echo ""
    echo "✓ Confirmation received. Proceeding with complete reset..."

    # Stop the services
    echo "Stopping services..."
    docker compose -f docker-compose.yml -f docker-compose.prod.yml down

    # Remove all production volumes
    echo "Removing all production volumes..."
    docker volume rm eh_app_postgres_prod eh_app_redis_prod eh_app_n8n_prod eh_app_n8n_setup_prod eh_app_caddy_prod eh_app_caddy_config_prod || {
        echo "⚠️  Some volumes not found or already removed"
    }

    # Remove all production containers
    echo "Removing all production containers..."
    docker container rm eh-app-postgres eh-app-redis eh-app-backend eh-app-frontend eh-app-caddy n8n discord-bot || {
        echo "⚠️  Some containers not found or already removed"
    }

    echo "✓ All production services reset complete!"
}

# Main menu
echo "Select what you want to reset:"
echo "1) Database only"
echo "2) Redis only"
echo "3) All services ( DATABASE + REDIS + N8N + CADDY )"
echo "4) Exit"
echo ""

read -p "Enter your choice (1-4): " CHOICE

case $CHOICE in
    1)
        reset_database
        ;;
    2)
        reset_redis
        ;;
    3)
        reset_all
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
echo "Reset Complete!"
echo "=============================================="
echo ""
echo "To redeploy production services:"
echo "  ./scripts/deploy-prod.sh"
echo ""
echo "To regenerate secrets (if needed):"
echo "  ./scripts/generate-production-secrets.sh"
echo ""