#!/bin/bash

echo "🔄 Rebuilding DevPod workspace with updated configuration..."

# Stop and delete existing workspace
echo "🛑 Stopping existing workspace..."
devpod stop eh-app-workspace 2>/dev/null || echo "No running workspace to stop"

echo "🗑️ Deleting existing workspace..."
devpod delete eh-app-workspace 2>/dev/null || echo "No existing workspace to delete"

# Create new workspace with updated configuration
echo "🚀 Creating new workspace with updated configuration..."
devpod up --ide vscode

echo "✅ DevPod workspace rebuilt successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Wait for the workspace to be ready"
echo "2. Open VS Code when prompted"
echo "3. Run './start-dev.sh' in the VS Code terminal to start your services"