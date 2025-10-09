-- Sample Data for Testing

-- Insert sample projects
INSERT INTO projects (name, description, status, is_active, expansion_horizon, milestone_granularity) VALUES
('Event Horizon Database Migration', 'Migrate from Notion to PostgreSQL for better performance and n8n integration', 'Active', true, '2 Weeks', 'Monthly'),
('n8n Workflow Optimization', 'Optimize existing n8n workflows for better performance', 'Planning Phase', false, '3 Weeks', 'Quarterly'),
('API Documentation Update', 'Update all API documentation to reflect new database schema', 'Planning Phase', false, '1 Week', 'Monthly&Quarterly');

-- Insert sample knowledge base items with file attachments
INSERT INTO knowledge_base (document_name, content, ai_summary, link_citations, file_attachment, filename, content_type) VALUES
('PostgreSQL Best Practices', 'This document contains best practices for PostgreSQL database design.', 'A comprehensive guide to PostgreSQL optimization and design patterns.', ARRAY['https://postgresql.org/docs'], 
decode('54686973206973206120746573742066696c6520636f6e74656e742e', 'hex'), 
 'test-document.txt', 
 'text/plain'),
('Database Schema Documentation', 'Complete documentation of the Event Horizon database schema.', 'Technical documentation covering all tables, views, and relationships.', ARRAY['https://github.com/event-horizon'], NULL, NULL, NULL),
('n8n Integration Guide', 'Step-by-step guide for integrating n8n with PostgreSQL.', 'Integration patterns and workflows for connecting n8n to PostgreSQL databases.', ARRAY['https://n8n.io/docs'], NULL, NULL, NULL);

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