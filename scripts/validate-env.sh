#!/bin/bash
# Environment Variables Validation Script
# Validates that all required environment variables are set before starting services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}SUCCESS: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_info() {
    echo -e "$1"
}

# Function to check if a variable is set
check_var() {
    local var_name=$1
    local var_value="${!var_name}"
    local is_optional=$2
    
    if [ -z "$var_value" ]; then
        if [ "$is_optional" = "optional" ]; then
            print_warning "$var_name is not set (optional)"
            return 0
        else
            print_error "$var_name is not set"
            return 1
        fi
    else
        print_success "$var_name is set"
        return 0
    fi
}

# Function to check if .env file exists
check_env_file() {
    local env_file=$1
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file $env_file not found"
        echo "Please create $env_file from .env.example"
        return 1
    else
        print_success "Environment file $env_file exists"
        return 0
    fi
}

# Main validation
echo "================================================"
echo "Environment Variables Validation"
echo "================================================"
echo ""

# Check if .env.development exists
if ! check_env_file ".env.development"; then
    echo ""
    print_info "To create .env.development, run:"
    print_info "  cp .env.example .env.development"
    echo ""
    exit 1
fi

# Source the environment file
set -a
source .env.development
set +a

echo ""
echo "Validating required variables..."
echo ""

# Track validation status
VALIDATION_FAILED=0

# Database Configuration
echo "=== Database Configuration ==="
check_var "POSTGRES_DB" || VALIDATION_FAILED=1
check_var "POSTGRES_USER" || VALIDATION_FAILED=1
check_var "POSTGRES_PASSWORD" || VALIDATION_FAILED=1
check_var "POSTGRES_HOST" || VALIDATION_FAILED=1
check_var "POSTGRES_PORT" || VALIDATION_FAILED=1
check_var "DATABASE_URL" || VALIDATION_FAILED=1
echo ""

# Backend Configuration
echo "=== Backend Configuration ==="
check_var "BACKEND_PORT" || VALIDATION_FAILED=1
check_var "BACKEND_HOST" || VALIDATION_FAILED=1
echo ""

# Frontend Configuration
echo "=== Frontend Configuration ==="
check_var "FRONTEND_PORT" || VALIDATION_FAILED=1
check_var "FRONTEND_HOST" || VALIDATION_FAILED=1
check_var "DOCKER_ENV" || VALIDATION_FAILED=1
echo ""

# n8n Configuration
echo "=== n8n Configuration ==="
check_var "N8N_PORT" || VALIDATION_FAILED=1
check_var "N8N_INSTANCE_ID" || VALIDATION_FAILED=1
check_var "N8N_API_KEY" || VALIDATION_FAILED=1
check_var "N8N_BASE_URL" || VALIDATION_FAILED=1
echo ""

# Discord Bot Configuration
echo "=== Discord Bot Configuration ==="
check_var "DISCORD_BOT_TOKEN" || VALIDATION_FAILED=1
check_var "DISCORD_CHANNEL_ID" || VALIDATION_FAILED=1
check_var "DISCORD_BOT_PORT" || VALIDATION_FAILED=1
echo ""

# Optional n8n Credentials (warnings only)
echo "=== Optional n8n Credentials ==="
check_var "GOOGLE_CLIENT_ID" "optional"
check_var "OPENROUTER_API_KEY" "optional"
check_var "PERPLEXITY_API_KEY" "optional"
check_var "SMTP_HOST" "optional"
echo ""

# Final validation summary
echo "================================================"
if [ $VALIDATION_FAILED -eq 0 ]; then
    print_success "All required environment variables are set!"
    echo ""
    print_info "You can now start the services with:"
    print_info "  docker-compose up -d"
    echo ""
    exit 0
else
    print_error "Environment validation failed!"
    echo ""
    print_info "Please set the missing variables in .env.development"
    echo ""
    exit 1
fi