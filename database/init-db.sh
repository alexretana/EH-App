#!/bin/bash
set -e

# Event Horizon Database Initialization Script
# This script runs all DDL files in the correct order

echo "Starting Event Horizon database initialization..."

# Define the DDL directory
DDL_DIR="/docker-entrypoint-initdb.d/postgresql-ddl"

# Array of DDL files in execution order
DDL_FILES=(
    "1-database-setup-ddl.sql"
    "2-core-tables-ddl.sql"
    "3-performance-indexes-ddl.sql"
    "4-essential-triggers-ddl.sql"
    "5-api-friendly-views-ddl.sql"
    "6-stored-procedures-ddl.sql"
)

# Sample data file - only executed on first-time build in development
SAMPLE_DATA_FILE="7-sample-data-ddl.sql"

# Execute each DDL file in order
for ddl_file in "${DDL_FILES[@]}"; do
    echo "Executing: $ddl_file"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$DDL_DIR/$ddl_file"
    if [ $? -eq 0 ]; then
        echo "✓ Successfully executed: $ddl_file"
    else
        echo "✗ Failed to execute: $ddl_file"
        exit 1
    fi
done

# Check if this is a first-time build in development and run sample data
if [ "$ENVIRONMENT" = "development" ] || [ "$DOCKER_ENV" = "true" ]; then
    # Check if the projects table exists and has data
    table_exists=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects')")
    
    if [ "$table_exists" = "t" ]; then
        project_count=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT COUNT(*) FROM projects")
        
        if [ "$project_count" = "0" ]; then
            echo "First-time development build detected. Loading sample data..."
            echo "Executing: $SAMPLE_DATA_FILE"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$DDL_DIR/$SAMPLE_DATA_FILE"
            if [ $? -eq 0 ]; then
                echo "✓ Successfully executed: $SAMPLE_DATA_FILE"
            else
                echo "✗ Failed to execute: $SAMPLE_DATA_FILE"
                exit 1
            fi
        else
            echo "Projects table already contains data. Skipping sample data loading."
        fi
    else
        echo "Projects table does not exist. Skipping sample data loading."
    fi
else
    echo "Not a development environment. Skipping sample data loading."
fi

echo "Database initialization completed successfully!"