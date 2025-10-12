#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Event Horizon App development environment..."

# Function to print status
print_status() {
    echo "📋 $1"
}

# Function to print success
print_success() {
    echo "✅ $1"
}

# Function to print error
print_error() {
    echo "❌ $1"
}

# Setup Python backend
print_status "Setting up Python backend environment..."
cd /workspace/backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    print_status "Creating Python virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment and install dependencies
print_status "Installing Python dependencies..."
source .venv/bin/activate
pip install uv
uv sync

print_success "Python backend setup complete"

# Setup Node.js frontend
print_status "Setting up Node.js frontend environment..."
cd /workspace/frontend

# Install dependencies
print_status "Installing Node.js dependencies..."
pnpm install

# Install Playwright browsers for testing
print_status "Installing Playwright browsers..."
npx playwright install

print_success "Node.js frontend setup complete"

# Setup git hooks if git is initialized
if [ -d "/workspace/.git" ]; then
    print_status "Setting up git hooks..."
    
    # Create pre-commit hook for Python formatting
    cat > /workspace/.git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Python formatting and linting
echo "🔍 Running Python formatting and linting..."

# Format Python files with black
cd backend && source .venv/bin/activate && black . --check || {
    echo "Python files need formatting. Run 'black .' in backend directory."
    exit 1
}

# Sort imports with isort
cd backend && source .venv/bin/activate && isort . --check-only || {
    echo "Python imports need sorting. Run 'isort .' in backend directory."
    exit 1
}

# Run flake8 linting
cd backend && source .venv/bin/activate && flake8 . || {
    echo "Python linting errors found. Run 'flake8 .' in backend directory."
    exit 1
}

echo "✅ Python formatting and linting passed!"
EOF

    # Make pre-commit hook executable
    chmod +x /workspace/.git/hooks/pre-commit
    
    print_success "Git hooks setup complete"
fi

# Create environment files if they don't exist
print_status "Setting up environment files..."

# Backend environment file
if [ ! -f "/workspace/backend/.env" ]; then
    print_status "Creating backend .env file..."
    cat > /workspace/backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://event_horizon_user:eventhorizon@localhost:5432/event_horizon

# Application Settings
DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:5173"]

# Mock Data Settings
GENERATE_MOCK_DATA=true
EOF
fi

# Frontend environment file
if [ ! -f "/workspace/frontend/.env" ]; then
    print_status "Creating frontend .env file..."
    cat > /workspace/frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Application Settings
VITE_APP_NAME=Event Horizon
VITE_APP_VERSION=0.1.0
VITE_DEBUG=true
EOF
fi

# Database environment file
if [ ! -f "/workspace/database/.env" ]; then
    print_status "Creating database .env file..."
    cat > /workspace/database/.env << 'EOF'
# PostgreSQL Configuration
POSTGRES_DB=event_horizon
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=eventhorizon
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
EOF
fi

# n8n environment file
if [ ! -f "/workspace/n8n/.env" ]; then
    print_status "Creating n8n .env file..."
    cat > /workspace/n8n/.env << 'EOF'
# n8n Configuration
GENERIC_TIMEZONE=America/New_York
TZ=America/New_York
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
NODE_FUNCTION_ALLOW_EXTERNAL=*
N8N_RUNNERS_ENABLED=true
N8N_PUBLIC_API_DISABLED=false
N8N_EDITOR_BASE_URL=http://localhost:5678
N8N_API_KEY=dev-api-key
N8N_BASE_URL=http://localhost:5678
EOF
fi

# Discord bot environment file
if [ ! -f "/workspace/discord-bot/.env" ]; then
    print_status "Creating discord-bot .env file..."
    cat > /workspace/discord-bot/.env << 'EOF'
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your-discord-bot-token-here
DISCORD_CHANNEL_ID=your-discord-channel-id-here
HTTP_PORT=54545
EOF
fi

print_success "Environment files setup complete"

# Setup VS Code settings
print_status "Setting up VS Code workspace settings..."
mkdir -p /workspace/.vscode

cat > /workspace/.vscode/settings.json << 'EOF'
{
    "python.defaultInterpreterPath": "/workspace/backend/.venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "typescript.preferences.importModuleSpecifier": "relative",
    "tailwindCSS.includeLanguages": {
        "typescript": "javascript",
        "typescriptreact": "javascript"
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        "**/node_modules": true,
        "**/.git": true,
        "**/.DS_Store": true,
        "**/Thumbs.db": true
    },
    "search.exclude": {
        "**/node_modules": true,
        "**/.venv": true,
        "**/__pycache__": true,
        "**/dist": true,
        "**/build": true
    }
}
EOF

print_success "VS Code settings setup complete"

# Create development scripts
print_status "Creating development convenience scripts..."

# Create a script to start all services
cat > /workspace/start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Event Horizon App development environment..."

# Start PostgreSQL (if not already running)
echo "📊 Starting PostgreSQL..."
docker-compose -f .devcontainer/docker-compose.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose -f .devcontainer/docker-compose.yml exec -T postgres pg_isready -U event_horizon_user -d event_horizon; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done

echo "✅ PostgreSQL is ready!"

# Start backend in background
echo "🔧 Starting backend server..."
cd /workspace/backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend in background
echo "🎨 Starting frontend server..."
cd /workspace/frontend
pnpm run dev --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# Start n8n in background
echo "⚙️ Starting n8n automation..."
docker-compose -f .devcontainer/docker-compose.yml up -d n8n

echo "✅ All services started!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📊 Database: postgresql://event_horizon_user:eventhorizon@localhost:5432/event_horizon"
echo "⚙️ n8n: http://localhost:5678"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt signal
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker-compose -f .devcontainer/docker-compose.yml down; exit" INT
wait
EOF

chmod +x /workspace/start-dev.sh

# Create a script to generate mock data
cat > /workspace/generate-mock-data.sh << 'EOF'
#!/bin/bash

echo "🎲 Generating mock data..."

cd /workspace/backend
source .venv/bin/activate
python scripts/generate_mock_data.py

echo "✅ Mock data generation complete!"
EOF

chmod +x /workspace/generate-mock-data.sh

# Create a script to run tests
cat > /workspace/run-tests.sh << 'EOF'
#!/bin/bash

echo "🧪 Running tests..."

# Run Python tests
echo "🐍 Running Python tests..."
cd /workspace/backend
source .venv/bin/activate
python -m pytest

# Run frontend tests
echo "🎨 Running frontend tests..."
cd /workspace/frontend
pnpm test

echo "✅ All tests completed!"
EOF

chmod +x /workspace/run-tests.sh

print_success "Development scripts created"

print_success "🎉 Event Horizon App development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Open the workspace in VS Code"
echo "2. Run './start-dev.sh' to start all services"
echo "3. Open http://localhost:5173 to view the frontend"
echo "4. Open http://localhost:8000/docs to view the API documentation"
echo "5. Open http://localhost:5678 to access n8n"
echo ""
echo "🔧 Useful commands:"
echo "- './start-dev.sh' - Start all development services"
echo "- './generate-mock-data.sh' - Generate mock data"
echo "- './run-tests.sh' - Run all tests"
echo "- 'cd backend && source .venv/bin/activate' - Activate Python environment"
echo "- 'cd frontend && pnpm run dev' - Start frontend only"
echo "- 'cd backend && source .venv/bin/activate && uvicorn main:app --reload' - Start backend only"