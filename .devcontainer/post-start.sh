#!/bin/bash

# Exit on error
set -e

echo "🔄 Post-start configuration for Event Horizon App..."

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

# Check if PostgreSQL is ready
print_status "Checking PostgreSQL connection..."
until docker-compose -f .devcontainer/docker-compose.yml exec -T postgres pg_isready -U event_horizon_user -d event_horizon; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 1
done

print_success "PostgreSQL is ready!"

# Initialize database if needed
print_status "Checking database initialization..."
cd /workspace/backend
source .venv/bin/activate

# Check if we need to run database initialization
python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('/workspace/backend/.env')

try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \'public\'')
    table_count = cursor.fetchone()[0]
    conn.close()
    
    if table_count == 0:
        print('Database is empty, needs initialization')
        exit(1)
    else:
        print('Database already initialized')
        exit(0)
except Exception as e:
    print(f'Error checking database: {e}')
    exit(2)
" || {
    print_status "Initializing database..."
    python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('/workspace/backend/.env')

# Connect to database
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cursor = conn.cursor()

# Read and execute DDL files
ddl_files = [
    '/workspace/database/postgresql-ddl/1-database-setup-ddl.sql',
    '/workspace/database/postgresql-ddl/2-core-tables-ddl.sql',
    '/workspace/database/postgresql-ddl/3-performance-indexes-ddl.sql',
    '/workspace/database/postgresql-ddl/4-essential-triggers-ddl.sql',
    '/workspace/database/postgresql-ddl/5-api-friendly-views-ddl.sql',
    '/workspace/database/postgresql-ddl/6-stored-procedures-ddl.sql'
]

for ddl_file in ddl_files:
    try:
        with open(ddl_file, 'r') as f:
            ddl_content = f.read()
        cursor.execute(ddl_content)
        conn.commit()
        print(f'Executed {ddl_file}')
    except Exception as e:
        print(f'Error executing {ddl_file}: {e}')
        conn.rollback()

conn.close()
print('Database initialization complete')
"
    
    print_success "Database initialized!"
}

# Generate mock data if needed
print_status "Checking if mock data is needed..."
python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('/workspace/backend/.env')

try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM projects')
    project_count = cursor.fetchone()[0]
    conn.close()
    
    if project_count == 0:
        print('No projects found, generating mock data')
        exit(1)
    else:
        print('Mock data already exists')
        exit(0)
except Exception as e:
    print(f'Error checking mock data: {e}')
    exit(2)
" || {
    print_status "Generating mock data..."
    python scripts/generate_mock_data.py
    print_success "Mock data generated!"
}

# Check if n8n is ready and configure if needed
print_status "Checking n8n configuration..."
if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
    print_success "n8n is ready!"
else
    print_status "n8n is not ready, will be available later at http://localhost:5678"
fi

# Display development information
print_success "🎉 Post-start configuration complete!"
echo ""
echo "🌐 Development servers are ready:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo "   Database: postgresql://event_horizon_user:eventhorizon@localhost:5432/event_horizon"
echo "   n8n: http://localhost:5678"
echo ""
echo "🔧 Useful commands:"
echo "   ./start-dev.sh - Start all development services"
echo "   ./generate-mock-data.sh - Generate fresh mock data"
echo "   ./run-tests.sh - Run all tests"
echo ""
echo "📊 Database connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: event_horizon"
echo "   User: event_horizon_user"
echo ""
echo "🎯 Happy coding! 🚀"