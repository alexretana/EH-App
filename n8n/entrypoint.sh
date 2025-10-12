#!/bin/bash

# Entrypoint script for n8n with automated setup
# This script starts n8n, then runs the setup script to configure credentials and workflows

set -e

echo "🚀 Starting n8n with automated setup..."

# Function to check if n8n is ready
check_n8n_ready() {
    curl -f http://localhost:5678/healthz > /dev/null 2>&1
}

# Start n8n in the background
echo "📦 Starting n8n in background..."
exec /docker-entrypoint.sh n8n start &
N8N_PID=$!

# Wait for n8n to be ready
echo "⏳ Waiting for n8n to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if check_n8n_ready; then
        echo "✅ n8n is ready!"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS..."
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ n8n did not become ready after ${MAX_ATTEMPTS} attempts"
    exit 1
fi

# Check if setup has already been done
if [ -f "/tmp/.n8n_setup_complete" ]; then
    echo "✅ n8n setup already completed, skipping automation"
else
    # Run the setup script
    echo "🔧 Running automated setup script..."
    cd /tmp
    python3 setup_n8n.py
    
    # Mark setup as complete
    touch /tmp/.n8n_setup_complete
    echo "✅ Automated setup completed!"
fi

echo "🎉 n8n is now fully configured and running!"

# Keep the script running and forward n8n output
wait $N8N_PID