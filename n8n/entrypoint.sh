#!/bin/bash
# n8n entrypoint script
# Handles first-time setup of credentials and workflows before starting n8n

set -e

echo "Starting n8n container entrypoint..."

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

# Step 3: Run first-time setup (if not already done)
echo "Step 3: Running first-time workflow setup..."
bash /scripts/setup-workflows.sh

# Step 4: Stop the temporary n8n instance
echo "Step 4: Stopping temporary n8n instance..."
kill $N8N_PID
wait $N8N_PID 2>/dev/null || true

# Step 5: Start n8n normally
echo "Step 5: Starting n8n..."
exec n8n start
