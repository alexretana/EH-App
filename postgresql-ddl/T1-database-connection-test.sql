-- Database Connection Testing
-- Run these queries to verify your database connection and basic setup

-- Test basic table creation
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Test views
SELECT * FROM project_dashboard LIMIT 5;

-- Test stored procedures
SELECT create_project('Test Project', 'A test project for validation');

-- Test full-text search
SELECT * FROM search_entities('database') LIMIT 10;