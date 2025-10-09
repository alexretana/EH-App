#!/bin/bash

# Script to rebuild the database with the updated schema (without assignee field)

echo "Stopping Docker containers..."
docker-compose down

echo "Removing database volume..."
docker volume rm eh-app_postgres_data

echo "Starting Docker containers with new database..."
docker-compose up -d

echo "Waiting for database to be ready..."
sleep 10

echo "Running database initialization scripts..."
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/1-types-enums-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/2-core-tables-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/3-performance-indexes-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/4-essential-triggers-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/5-api-friendly-views-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/6-stored-procedures-ddl.sql
docker-compose exec postgres psql -U postgres -d event_horizon -f /docker-entrypoint-initdb.d/7-sample-data-ddl.sql

echo "Database rebuild complete!"
