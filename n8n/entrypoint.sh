#!/bin/bash
# n8n entrypoint script
# Handles first-time setup of credentials and workflows before starting n8n

set -e

SETUP_MARKER="/data/.n8n_setup_complete"

echo "Starting n8n container entrypoint..."

# Check if setup has already been completed
if [ -f "$SETUP_MARKER" ]; then
    echo "n8n setup already completed. Starting n8n normally..."
    exec n8n start
fi

# First-time setup required
echo "Running first-time setup..."

# Step 1: Generate credentials file from template
echo "Step 1: Generating credentials from template..."
if [ -f "/data/workflow&creds/decrypt_creds.json.template" ]; then
    bash /scripts/generate-creds.sh
else
    echo "WARNING: Template file not found, skipping credential generation"
fi

# Step 2: Start n8n in the background for workflow import
echo "Step 2: Starting n8n temporarily for setup..."
n8n start &
N8N_PID=$!

# Give n8n time to fully start and initialize the database
sleep 5

# Step 3: Run first-time setup (if not already done)
echo "Step 3: Running first-time workflow setup..."
bash /scripts/setup-workflows.sh

# Step 4: Stop the temporary n8n instance gracefully
echo "Step 4: Stopping temporary n8n instance..."
kill -TERM $N8N_PID 2>/dev/null || true
# Wait up to 10 seconds for graceful shutdown
for i in {1..10}; do
    if ! kill -0 $N8N_PID 2>/dev/null; then
        break
    fi
    sleep 1
done
# Force kill if still running
kill -KILL $N8N_PID 2>/dev/null || true
wait $N8N_PID 2>/dev/null || true

# Wait a bit for database locks to clear
sleep 2

# Step 5: Start n8n normally
echo "Step 5: Starting n8n..."
exec n8n start
