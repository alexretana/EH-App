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

# Create new .env.generated file
cat > .env.generated << EOF
# =============================================================================
# AUTO-GENERATED PRODUCTION SECRETS
# =============================================================================
# This file contains auto-generated secrets for production
# DO NOT commit to version control
# Generated on: $(date)

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
POSTGRES_PASSWORD=$(generate_password)

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_PASSWORD=$(generate_password)

# =============================================================================
# N8N CONFIGURATION
# =============================================================================
N8N_API_KEY=$(generate_password)

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=$(generate_hex)

# =============================================================================
# DISCORD BOT CONFIGURATION
# =============================================================================
# NOTE: Discord configuration should be set manually from .env.development
# These are not randomly generated as they need to match your actual Discord bot
DISCORD_BOT_TOKEN=USE_VALUE_FROM_ENV_DEVELOPMENT
DISCORD_CHANNEL_ID=USE_VALUE_FROM_ENV_DEVELOPMENT
EOF

echo "✓ Generated new .env.generated file"
echo ""
echo "⚠️  IMPORTANT:"
echo "   • Update Discord bot credentials in .env.generated"
echo "   • Ensure .env.generated is added to .gitignore"
echo "   • Distribute .env.generated securely to production servers"
echo ""

# Check if .env.generated is in .gitignore
if ! grep -q "^\.env\.generated$" .gitignore; then
    echo "Adding .env.generated to .gitignore..."
    echo "" >> .gitignore
    echo "# Auto-generated production secrets" >> .gitignore
    echo ".env.generated" >> .gitignore
    echo ".env.generated.backup" >> .gitignore
    echo "✓ Added to .gitignore"
fi

echo ""
echo "=============================================="
echo "Production secrets generation complete!"
echo "=============================================="