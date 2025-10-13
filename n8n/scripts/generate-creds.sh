#!/bin/bash
# Script to generate decrypt_creds.json from template using environment variables
# This script substitutes environment variables in the template file

set -e

TEMPLATE_FILE="/data/workflow&creds/decrypt_creds.json.template"
OUTPUT_FILE="/data/workflow&creds/decrypt_creds.json"

echo "Generating decrypt_creds.json from template..."

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "ERROR: Template file not found at $TEMPLATE_FILE"
    exit 1
fi

# Substitute environment variables in the template
envsubst < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
    echo "Successfully generated decrypt_creds.json"
else
    echo "ERROR: Failed to generate decrypt_creds.json"
    exit 1
fi