#!/bin/bash
# =============================================================================
# PRODUCTION SECRETS GENERATION SCRIPT
# =============================================================================
# This script generates random passwords and secrets for production use
# and stores them in .env.generated file

set -e

echo "=============================================="
echo "Generating Production Secrets"
echo "=============================================="
echo ""

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to generate random hex string
generate_hex() {
    openssl rand -hex 32
}

# Check if .env.generated exists
if [ -f .env.generated ]; then
    echo "⚠️  .env.generated already exists"
    echo "   • Backing up to .env.generated.backup"
    cp .env.generated .env.generated.backup
fi

echo "Generating secure random passwords and secrets..."
echo ""

# Generate all values first to ensure they're consistent
POSTGRES_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_hex)

# Create new .env.generated file
cat > .env.generated << EOF
# =============================================================================
# AUTO-GENERATED PRODUCTION SECRETS TEMPLATE
# =============================================================================
# This file contains auto-generated secrets for production
# DO NOT commit the actual .env.generated file to version control
# Generated on: $(date)

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=event_horizon_prod
DATABASE_URL=postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@\${POSTGRES_HOST}:\${POSTGRES_PORT}/\${POSTGRES_DB}

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_PASSWORD=${REDIS_PASSWORD}
QUEUE_BULL_REDIS_PASSWORD=${REDIS_PASSWORD}


# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=${JWT_SECRET}
EOF

echo "✓ Generated new .env.generated file"
echo ""

echo ""
echo "=============================================="
echo "Production secrets generation complete!"
echo "=============================================="