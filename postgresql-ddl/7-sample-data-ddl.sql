-- Sample Data for Testing

-- Insert sample projects
INSERT INTO projects (name, description, status, is_active, expansion_horizon, milestone_granularity) VALUES
('Event Horizon Database Migration', 'Migrate from Notion to PostgreSQL for better performance and n8n integration', 'Active', true, '2 Weeks', 'Monthly'),
('n8n Workflow Optimization', 'Optimize existing n8n workflows for better performance', 'Planning Phase', false, '3 Weeks', 'Quarterly'),
('API Documentation Update', 'Update all API documentation to reflect new database schema', 'Planning Phase', false, '1 Week', 'Monthly&Quarterly');

-- Sample goals and tasks with proper hierarchical structure
-- First, get project IDs, then create goals, then create tasks linked to goals

-- Example of proper hierarchical insertion:
/*
-- Step 1: Get project ID
SELECT id FROM projects WHERE name = 'Event Horizon Database Migration';

-- Step 2: Insert goals for the project
INSERT INTO goals (name, description, status, project_id, scope, success_criteria) VALUES
('Database Schema Implementation', 'Design and implement PostgreSQL schema', 'Active', 'project-id-here', 'Monthly', 'Schema supports all Notion functionality with better performance');

-- Step 3: Get goal ID
SELECT id FROM goals WHERE name = 'Database Schema Implementation';

-- Step 4: Insert tasks for the goal
INSERT INTO tasks (name, description, status, priority, effort_level, goal_id, task_type) VALUES
('Create DDL scripts', 'Write complete DDL for all tables, indexes, and constraints', 'Done', 'High', 'Medium', 'goal-id-here', 'Develop'),
('Test database connection', 'Verify n8n can connect to PostgreSQL', 'Active', 'High', 'Small', 'goal-id-here', 'Debug');
*/