#!/bin/bash
# Script to import n8n credentials and workflows on first-time setup
# This script only runs if the setup hasn't been completed before

set -e

SETUP_MARKER="/data/.n8n_setup_complete"
CREDS_FILE="/data/workflow&creds/decrypt_creds.json"
WORKFLOWS_DIR="/data/workflow&creds/workflows"

# Check if setup has already been completed
if [ -f "$SETUP_MARKER" ]; then
    echo "n8n workflows already set up. Skipping import..."
    exit 0
fi

echo "Starting first-time n8n setup..."

# Wait for n8n to be ready
echo "Waiting for n8n to be ready..."
until curl -s -f http://localhost:5678/healthz > /dev/null 2>&1; do
    echo "n8n not ready yet, waiting..."
    sleep 5
done
echo "n8n is ready!"

# Check if credentials file exists
if [ ! -f "$CREDS_FILE" ]; then
    echo "ERROR: Credentials file not found at $CREDS_FILE"
    echo "Make sure generate-creds.sh has been run first"
    exit 1
fi

# Import credentials first (order matters because workflows reference credentials)
echo "Importing credentials..."
n8n import:credentials --input="$CREDS_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Credentials imported successfully"
else
    echo "ERROR: Failed to import credentials"
    exit 1
fi

# Import workflows one by one
echo "Importing workflows..."

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    if [ -f "$workflow_file" ]; then
        echo "  Importing $(basename "$workflow_file")..."
        n8n import:workflow --input="$workflow_file"
        
        if [ $? -eq 0 ]; then
            echo "  ✓ $(basename "$workflow_file") imported successfully"
        else
            echo "  ERROR: Failed to import $(basename "$workflow_file")"
            exit 1
        fi
    fi
done

# Activate all workflows
echo "Activating all workflows..."
n8n update:workflow --all --active=true

if [ $? -eq 0 ]; then
    echo "✓ All workflows activated successfully"
else
    echo "ERROR: Failed to activate workflows"
    exit 1
fi

# Create marker file to indicate setup is complete
touch "$SETUP_MARKER"
echo "✓ First-time n8n setup completed successfully!"
echo "  Marker file created at: $SETUP_MARKER"