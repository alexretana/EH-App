# Mock Data Provisioning Troubleshooting Guide

## Problem Summary

The mock data generator didn't run during the development deployment, leaving the database with only basic projects but no goals, tasks, or knowledge base entries.

## Root Cause Analysis

1. **Missing Environment Variable**: The database initialization script (`database/init-db.sh`) requires `DATABASE_SEED_MOCK_DATA=true` to seed mock data, but this variable was not set in any environment file.

2. **Script Misalignment**: The development startup script (`scripts/start-dev.sh`) claims to "Seed database with mock data" but doesn't actually execute the mock data generator.

3. **Two Separate Mock Data Systems**:
   - SQL-based mock data in `database/postgresql-ddl/7-sample-data-ddl.sql`
   - Python-based mock data generator in `backend/scripts/generate_mock_data.py`

## Solutions Implemented

### Solution 1: Enable SQL-based Mock Data (Quick Fix)

Added `DATABASE_SEED_MOCK_DATA=true` to `.env.development`. This enables the SQL-based mock data that runs during database initialization.

**How to apply:**
```bash
# The change has already been applied to .env.development
# To rebuild the database with this setting:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Solution 2: Enhanced Development Startup Script

Created `scripts/start-dev-with-mock-data.sh` that:
1. Starts the services in detached mode
2. Waits for the backend to be healthy
3. Explicitly runs the mock data generator
4. Provides clear status messages

**How to use:**
```bash
./scripts/start-dev-with-mock-data.sh
```

### Solution 3: Smart Mock Data Health Check

Created `backend/scripts/check-and-generate-mock-data.sh` that:
1. Checks if mock data exists
2. Generates missing data only when needed
3. Handles edge cases gracefully

**How to use manually:**
```bash
docker exec eh-app-backend bash scripts/check-and-generate-mock-data.sh
```

## Manual Mock Data Generation

If the automated solutions don't work, you can manually generate mock data:

```bash
# Generate all mock data (replaces existing data)
docker exec eh-app-backend uv run python scripts/generate_mock_data.py

# Generate only missing mock data (preserves existing data)
docker exec eh-app-backend uv run python scripts/generate_missing_mock_data.py
```

## Verifying Mock Data

To check if mock data exists in your database:

```bash
docker exec eh-app-backend uv run python -c "
from database import db
print('Projects:', db.execute_query('SELECT COUNT(*) as count FROM projects')[0]['count'])
print('Goals:', db.execute_query('SELECT COUNT(*) as count FROM goals')[0]['count'])
print('Tasks:', db.execute_query('SELECT COUNT(*) as count FROM tasks')[0]['count'])
print('Knowledge Base:', db.execute_query('SELECT COUNT(*) as count FROM knowledge_base')[0]['count'])
"
```

## Recommended Workflow

1. **For new development environments**: Use Solution 1 by ensuring `DATABASE_SEED_MOCK_DATA=true` is set in `.env.development`.

2. **For existing environments**: Use Solution 2 with the enhanced startup script to ensure mock data is always generated.

3. **For automated deployments**: Consider implementing Solution 3 as a healthcheck or startup hook in the backend container.

## Future Improvements

1. **Unified Mock Data System**: Consider consolidating the SQL and Python mock data generators into a single system.

2. **Environment-Specific Configurations**: Create separate mock data configurations for development, testing, and staging environments.

3. **Automated Health Checks**: Integrate the mock data health check into the container startup process.

4. **Data Versioning**: Implement versioning for mock data to support database schema evolution.