#!/bin/bash
# =============================================================================
# MOCK DATA HEALTHCHECK SCRIPT
# =============================================================================
# This script checks if mock data exists and generates it if needed

set -e

# Check if we have any projects in the database
PROJECT_COUNT=$(uv run python -c "
from database import db
try:
    result = db.execute_query('SELECT COUNT(*) as count FROM projects')
    print(result[0]['count'])
except:
    print('0')
" 2>/dev/null || echo "0")

# Check if we have any goals in the database
GOAL_COUNT=$(uv run python -c "
from database import db
try:
    result = db.execute_query('SELECT COUNT(*) as count FROM goals')
    print(result[0]['count'])
except:
    print('0')
" 2>/dev/null || echo "0")

# If we have projects but no goals, generate missing mock data
if [ "$PROJECT_COUNT" -gt 0 ] && [ "$GOAL_COUNT" -eq 0 ]; then
    echo "Generating mock data (projects exist but no goals found)..."
    uv run python scripts/generate_missing_mock_data.py
    exit 0
fi

# If we have no data at all, this is likely a fresh database
# Let the init-db.sh script handle it based on DATABASE_SEED_MOCK_DATA
if [ "$PROJECT_COUNT" -eq 0 ]; then
    echo "No projects found - fresh database detected"
    exit 0
fi

# Data exists, no action needed
echo "Mock data already exists (Projects: $PROJECT_COUNT, Goals: $GOAL_COUNT)"
exit 0