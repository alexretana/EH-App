#!/bin/bash

# Script to rebuild the database with the updated schema and sample data

echo "Stopping Docker containers..."
docker compose down

echo "Removing database volume..."
docker volume rm eh-app-workspace_postgres_data

echo "Starting Docker containers with new database..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 15

echo "Running database initialization scripts..."
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/1-database-setup-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/2-core-tables-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/3-performance-indexes-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/4-essential-triggers-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/5-api-friendly-views-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/6-stored-procedures-ddl.sql
docker compose exec postgres psql -U event_horizon_user -d event_horizon -f /docker-entrypoint-initdb.d/postgresql-ddl/7-sample-data-ddl.sql

echo "Database rebuild complete!"
