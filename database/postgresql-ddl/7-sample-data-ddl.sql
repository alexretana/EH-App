-- Comprehensive Sample Data for Testing
-- This script creates test data covering all enum values, optional fields, and relationships

-- Clear existing data to start fresh
TRUNCATE TABLE knowledge_base_references, task_dependencies, tasks, goals, projects, knowledge_base RESTART IDENTITY CASCADE;

-- Insert sample projects covering all enum values and optional field combinations
INSERT INTO projects (name, description, status, start_date, end_date, is_active, is_validated, time_estimate_months, time_estimation_validated, expansion_horizon, milestone_granularity) VALUES
-- Project with all fields populated (Planning Phase)
('Event Horizon Database Migration', 'Migrate from Notion to PostgreSQL for better performance and n8n integration', 'Planning Phase', '2025-01-01', '2025-03-31', true, true, 3, true, '2 Weeks', 'Monthly'),

-- Project with minimal fields (Active)
('n8n Workflow Optimization', 'Optimize existing n8n workflows for better performance', 'Active', NULL, NULL, false, false, NULL, false, NULL, NULL),

-- Project with some optional fields (Completed)
('API Documentation Update', 'Update all API documentation to reflect new database schema', 'Completed', '2025-02-01', '2025-02-28', true, false, 1, true, '1 Week', 'Monthly&Quarterly'),

-- Project with different expansion horizon (Cancelled)
('Frontend Redesign', 'Complete UI/UX overhaul using modern design patterns', 'Cancelled', '2025-03-01', '2025-06-30', false, true, 4, false, '3 Weeks', 'Quarterly'),

-- Project with quarterly granularity
('Performance Testing Suite', 'Comprehensive testing framework for performance metrics', 'Planning Phase', '2025-04-01', NULL, true, false, 2, true, '2 Weeks', 'Quarterly');

-- Insert sample knowledge base items with file attachments and various combinations
INSERT INTO knowledge_base (document_name, content, ai_summary, link_citations, file_attachment, filename, content_type, date_added) VALUES
-- Knowledge base with file attachment
('PostgreSQL Best Practices', 'This document contains best practices for PostgreSQL database design including indexing strategies, query optimization, and security considerations.', 'A comprehensive guide to PostgreSQL optimization and design patterns.', ARRAY['https://postgresql.org/docs', 'https://www.postgresqltutorial.com/'],
decode('54686973206973206120746573742066696c6520636f6e74656e742e', 'hex'),
 'postgresql-best-practices.txt',
 'text/plain',
 '2025-01-15'),

-- Knowledge base without file attachment but with links
('Database Schema Documentation', 'Complete documentation of the Event Horizon database schema including all tables, views, relationships, and constraints.', 'Technical documentation covering all tables, views, and relationships.', ARRAY['https://github.com/event-horizon', 'https://dbdiagram.io'], NULL, NULL, NULL, '2025-01-20'),

-- Knowledge base with minimal data
('n8n Integration Guide', 'Step-by-step guide for integrating n8n with PostgreSQL.', 'Integration patterns and workflows for connecting n8n to PostgreSQL databases.', ARRAY['https://n8n.io/docs'], NULL, NULL, NULL, '2025-02-01'),

-- Knowledge base with PDF attachment
('Security Guidelines', 'Comprehensive security guidelines for application development and deployment.', 'Security best practices including authentication, authorization, and data protection.', ARRAY['https://owasp.org'],
decode('2550442d312e340a25c3a4c3b6c3b40a0a312030206f626a', 'hex'),
 'security-guidelines.pdf',
 'application/pdf',
 '2025-02-10'),

-- Knowledge base with image attachment
('UI Design Mockups', 'Visual design mockups for the new interface design.', 'Collection of UI mockups and design specifications.', ARRAY[]::TEXT[],
decode('89504e470d0a1a0a0000000d49484452', 'hex'),
 'design-mockup.png',
 'image/png',
 '2025-02-15');

-- Get project IDs for reference
-- Project 1: Event Horizon Database Migration (Planning Phase)
-- Project 2: n8n Workflow Optimization (Active)
-- Project 3: API Documentation Update (Completed)
-- Project 4: Frontend Redesign (Cancelled)
-- Project 5: Performance Testing Suite (Planning Phase)

-- Insert sample goals covering all enum values and hierarchical relationships
INSERT INTO goals (name, description, status, scope, success_criteria, due_date, project_id, parent_goal_id) VALUES
-- Goals for Project 1 (Event Horizon Database Migration)
-- Parent goal
('Database Schema Design', 'Design comprehensive PostgreSQL schema to replace Notion database', 'Active', 'Monthly', 'All tables designed with proper relationships and constraints', '2025-01-31', 
 (SELECT id FROM projects WHERE name = 'Event Horizon Database Migration'), NULL),

-- Child goal
('Create Core Tables', 'Implement all core database tables with proper constraints', 'Not started', 'Weekly-Milestone', 'All DDL scripts written and tested', '2025-02-15',
 (SELECT id FROM projects WHERE name = 'Event Horizon Database Migration'), 
 (SELECT id FROM goals WHERE name = 'Database Schema Design' AND project_id = (SELECT id FROM projects WHERE name = 'Event Horizon Database Migration'))),

-- Goals for Project 2 (n8n Workflow Optimization)
('Workflow Analysis', 'Analyze existing n8n workflows for optimization opportunities', 'Active', 'Quarterly', 'Performance analysis completed with optimization recommendations', '2025-03-15',
 (SELECT id FROM projects WHERE name = 'n8n Workflow Optimization'), NULL),

('Implement Optimizations', 'Apply identified optimizations to workflows', 'Not started', 'Monthly', 'All workflows optimized and tested', '2025-04-01',
 (SELECT id FROM projects WHERE name = 'n8n Workflow Optimization'), NULL),

-- Goals for Project 3 (API Documentation Update)
('API Review', 'Review all existing API endpoints', 'Done', 'Weekly-Milestone', 'All endpoints documented and reviewed', '2025-02-15',
 (SELECT id FROM projects WHERE name = 'API Documentation Update'), NULL),

-- Goals for Project 4 (Frontend Redesign) - Cancelled project
('Design Mockups', 'Create UI/UX design mockups', 'Cancelled', 'Monthly', 'All mockups approved by stakeholders', '2025-05-01',
 (SELECT id FROM projects WHERE name = 'Frontend Redesign'), NULL),

-- Goals for Project 5 (Performance Testing Suite)
('Test Framework Setup', 'Set up comprehensive testing framework', 'Active', 'Quarterly', 'Testing framework operational with baseline metrics', '2025-04-30',
 (SELECT id FROM projects WHERE name = 'Performance Testing Suite'), NULL);

-- Insert sample tasks covering all enum values and optional fields
INSERT INTO tasks (name, description, status, task_type, priority, effort_level, time_estimate_minutes, due_date, date_completed, week_start_date, assignee, goal_id) VALUES
-- Tasks for Goal: Database Schema Design (Project 1)
('Write DDL Scripts', 'Create complete DDL for all tables, indexes, and constraints', 'Done', 'Develop', 'High', 'Medium', 240, '2025-01-25', '2025-01-24', '2025-01-20', 'alice.smith@example.com',
 (SELECT id FROM goals WHERE name = 'Database Schema Design')),

('Review Schema Design', 'Technical review of database schema design', 'Active', 'Review', 'High', 'Small', 60, '2025-01-30', NULL, '2025-01-27', 'bob.johnson@example.com',
 (SELECT id FROM goals WHERE name = 'Database Schema Design')),

-- Tasks for Goal: Create Core Tables (Project 1)
('Create Projects Table', 'Implement the projects table with all constraints', 'Active', 'Develop', 'Medium', 'Medium', 120, '2025-02-10', NULL, '2025-02-05', 'alice.smith@example.com',
 (SELECT id FROM goals WHERE name = 'Create Core Tables')),

('Create Tasks Table', 'Implement the tasks table with proper relationships', 'Not started', 'Develop', 'Medium', 'Large', 180, '2025-02-12', NULL, '2025-02-05', 'charlie.brown@example.com',
 (SELECT id FROM goals WHERE name = 'Create Core Tables')),

-- Tasks for Goal: Workflow Analysis (Project 2)
('Analyze Workflow Performance', 'Measure current workflow execution times', 'Active', 'Research', 'Medium', 'Medium', 150, '2025-03-01', NULL, '2025-02-24', 'diana.prince@example.com',
 (SELECT id FROM goals WHERE name = 'Workflow Analysis')),

('Identify Bottlenecks', 'Find performance bottlenecks in workflows', 'Not started', 'Debug', 'High', 'Small', 90, '2025-03-05', NULL, '2025-03-01', 'eve.wilson@example.com',
 (SELECT id FROM goals WHERE name = 'Workflow Analysis')),

-- Tasks for Goal: API Review (Project 3) - Completed
('Document Endpoints', 'Document all existing API endpoints', 'Done', 'Develop', 'Medium', 'Large', 300, '2025-02-10', '2025-02-09', '2025-02-05', 'frank.miller@example.com',
 (SELECT id FROM goals WHERE name = 'API Review')),

('Test Documentation', 'Verify all documentation is accurate', 'Done', 'Review', 'Low', 'Small', 45, '2025-02-12', '2025-02-11', '2025-02-08', 'grace.kelly@example.com',
 (SELECT id FROM goals WHERE name = 'API Review')),

-- Tasks for Goal: Design Mockups (Project 4) - Cancelled
('Create Wireframes', 'Design initial wireframes for new interface', 'Cancelled', 'Develop', 'Medium', 'Medium', 180, '2025-05-15', NULL, '2025-05-10', 'henry.ford@example.com',
 (SELECT id FROM goals WHERE name = 'Design Mockups')),

-- Tasks for Goal: Test Framework Setup (Project 5)
('Select Testing Tools', 'Research and select appropriate testing tools', 'Active', 'Research', 'Medium', 'Medium', 120, '2025-04-15', NULL, '2025-04-10', 'iris.west@example.com',
 (SELECT id FROM goals WHERE name = 'Test Framework Setup')),

('Configure CI/CD', 'Set up continuous integration with testing pipeline', 'Not started', 'Provision', 'High', 'Large', 240, '2025-04-25', NULL, '2025-04-20', 'jack.bauer@example.com',
 (SELECT id FROM goals WHERE name = 'Test Framework Setup')),

-- Tasks with different types and priorities
('Network Configuration', 'Configure network settings for deployment', 'Active', 'Network', 'High', 'Small', 60, '2025-03-20', NULL, '2025-03-15', 'kate.kane@example.com',
 (SELECT id FROM goals WHERE name = 'Implement Optimizations')),

('Marketing Materials', 'Prepare marketing materials for project launch', 'Not started', 'Marketing', 'Low', 'Small', 90, '2025-05-01', NULL, '2025-04-20', 'luke.cage@example.com',
 (SELECT id FROM goals WHERE name = 'Implement Optimizations'));

-- Insert task dependencies to demonstrate relationships
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES
-- Dependency: Create Tasks Table depends on Create Projects Table
((SELECT id FROM tasks WHERE name = 'Create Tasks Table'), 
 (SELECT id FROM tasks WHERE name = 'Create Projects Table')),

-- Dependency: Review Schema Design depends on Write DDL Scripts
((SELECT id FROM tasks WHERE name = 'Review Schema Design'), 
 (SELECT id FROM tasks WHERE name = 'Write DDL Scripts')),

-- Dependency: Identify Bottlenecks depends on Analyze Workflow Performance
((SELECT id FROM tasks WHERE name = 'Identify Bottlenecks'), 
 (SELECT id FROM tasks WHERE name = 'Analyze Workflow Performance')),

-- Dependency: Test Documentation depends on Document Endpoints
((SELECT id FROM tasks WHERE name = 'Test Documentation'), 
 (SELECT id FROM tasks WHERE name = 'Document Endpoints')),

-- Dependency: Configure CI/CD depends on Select Testing Tools
((SELECT id FROM tasks WHERE name = 'Configure CI/CD'), 
 (SELECT id FROM tasks WHERE name = 'Select Testing Tools'));

-- Insert knowledge base references to demonstrate relationships
INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id) VALUES
-- Reference PostgreSQL Best Practices to database-related tasks
((SELECT id FROM knowledge_base WHERE document_name = 'PostgreSQL Best Practices'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Write DDL Scripts')),

((SELECT id FROM knowledge_base WHERE document_name = 'PostgreSQL Best Practices'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Create Projects Table')),

-- Reference Database Schema Documentation to database project
((SELECT id FROM knowledge_base WHERE document_name = 'Database Schema Documentation'), 'project', 
 (SELECT id FROM projects WHERE name = 'Event Horizon Database Migration')),

-- Reference n8n Integration Guide to n8n project
((SELECT id FROM knowledge_base WHERE document_name = 'n8n Integration Guide'), 'project', 
 (SELECT id FROM projects WHERE name = 'n8n Workflow Optimization')),

-- Reference Security Guidelines to multiple entities
((SELECT id FROM knowledge_base WHERE document_name = 'Security Guidelines'), 'goal', 
 (SELECT id FROM goals WHERE name = 'Test Framework Setup')),

((SELECT id FROM knowledge_base WHERE document_name = 'Security Guidelines'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Configure CI/CD')),

-- Reference UI Design Mockups to design task
((SELECT id FROM knowledge_base WHERE document_name = 'UI Design Mockups'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Create Wireframes')),

-- Reference n8n Integration Guide to workflow tasks
((SELECT id FROM knowledge_base WHERE document_name = 'n8n Integration Guide'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Analyze Workflow Performance')),

((SELECT id FROM knowledge_base WHERE document_name = 'n8n Integration Guide'), 'task', 
 (SELECT id FROM tasks WHERE name = 'Identify Bottlenecks'));

-- Display summary of inserted data
DO $$
DECLARE
    project_count INTEGER;
    goal_count INTEGER;
    task_count INTEGER;
    kb_count INTEGER;
    dep_count INTEGER;
    ref_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO project_count FROM projects;
    SELECT COUNT(*) INTO goal_count FROM goals;
    SELECT COUNT(*) INTO task_count FROM tasks;
    SELECT COUNT(*) INTO kb_count FROM knowledge_base;
    SELECT COUNT(*) INTO dep_count FROM task_dependencies;
    SELECT COUNT(*) INTO ref_count FROM knowledge_base_references;
    
    RAISE NOTICE 'Sample Data Insertion Summary:';
    RAISE NOTICE 'Projects: %', project_count;
    RAISE NOTICE 'Goals: %', goal_count;
    RAISE NOTICE 'Tasks: %', task_count;
    RAISE NOTICE 'Knowledge Base Items: %', kb_count;
    RAISE NOTICE 'Task Dependencies: %', dep_count;
    RAISE NOTICE 'Knowledge Base References: %', ref_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Enum Values Covered:';
    RAISE NOTICE 'Project Status: %', ARRAY(SELECT DISTINCT status FROM projects);
    RAISE NOTICE 'Goal Status: %', ARRAY(SELECT DISTINCT status FROM goals);
    RAISE NOTICE 'Task Status: %', ARRAY(SELECT DISTINCT status FROM tasks);
    RAISE NOTICE 'Task Type: %', ARRAY(SELECT DISTINCT task_type FROM tasks WHERE task_type IS NOT NULL);
    RAISE NOTICE 'Priority: %', ARRAY(SELECT DISTINCT priority FROM tasks WHERE priority IS NOT NULL);
    RAISE NOTICE 'Effort Level: %', ARRAY(SELECT DISTINCT effort_level FROM tasks WHERE effort_level IS NOT NULL);
    RAISE NOTICE 'Goal Scope: %', ARRAY(SELECT DISTINCT scope FROM goals WHERE scope IS NOT NULL);
    RAISE NOTICE 'Expansion Horizon: %', ARRAY(SELECT DISTINCT expansion_horizon FROM projects WHERE expansion_horizon IS NOT NULL);
    RAISE NOTICE 'Milestone Granularity: %', ARRAY(SELECT DISTINCT milestone_granularity FROM projects WHERE milestone_granularity IS NOT NULL);
END $$;