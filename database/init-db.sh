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
    # "7-sample-data-ddl.sql"
)

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

echo "Database initialization completed successfully!"