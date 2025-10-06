-- Test Views and Stored Procedures
-- This file tests the database views and stored procedures to ensure they work correctly

-- Test 1: Create sample data for testing
BEGIN;
-- Create test project
INSERT INTO projects (name, description, status, is_active, time_estimate_months, expansion_horizon, milestone_granularity) 
VALUES ('Views Test Project', 'Project for testing views', 'Active', true, 3, '2 Weeks', 'Monthly') 
RETURNING id INTO project_id;

-- Create test goals
INSERT INTO goals (name, description, status, scope, project_id) 
VALUES 
('Test Goal 1', 'First test goal', 'Active', 'Monthly', project_id),
('Test Goal 2', 'Second test goal', 'Not started', 'Monthly', project_id)
RETURNING id INTO goal1_id, goal2_id;

-- Create test tasks
INSERT INTO tasks (name, description, status, priority, effort_level, time_estimate_minutes, goal_id, task_type) 
VALUES 
('Test Task 1', 'First test task', 'Done', 'High', 'Medium', 120, goal1_id, 'Develop'),
('Test Task 2', 'Second test task', 'Active', 'Medium', 'Small', 60, goal1_id, 'Debug'),
('Test Task 3', 'Third test task', 'Not started', 'Low', 'Large', 240, goal2_id, 'Research')
RETURNING id INTO task1_id, task2_id, task3_id;

-- Create task dependencies
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (task2_id, task1_id);

-- Create knowledge base entry
INSERT INTO knowledge_base (document_name, content, ai_summary) 
VALUES ('Test Document', 'This is a test document content', 'Test summary')
RETURNING id INTO kb_id;

-- Link knowledge base to project and goal
INSERT INTO knowledge_base_references (knowledge_base_id, entity_type, entity_id) VALUES 
(kb_id, 'project', project_id),
(kb_id, 'goal', goal1_id);
COMMIT;

-- Test 2: Test project_dashboard view
SELECT * FROM project_dashboard WHERE name = 'Views Test Project';

-- Test 3: Test task_details view
SELECT * FROM task_details WHERE project_name = 'Views Test Project';

-- Test 4: Test goal_progress view
SELECT * FROM goal_progress WHERE project_name = 'Views Test Project';

-- Test 5: Test knowledge_base_with_references view
SELECT * FROM knowledge_base_with_references WHERE document_name = 'Test Document';

-- Test 6: Test create_project stored procedure
SELECT create_project('Procedure Test Project', 'Testing stored procedure', '2025-01-01', '2025-12-31', 6);

-- Test 7: Test add_task_dependency stored procedure
BEGIN;
-- Create test project and goal for dependency testing
INSERT INTO projects (name, description, status) VALUES 
('Dependency Test', 'Testing dependency procedure', 'Planning Phase') RETURNING id INTO project_id;

INSERT INTO goals (name, description, project_id) VALUES 
('Dependency Test Goal', 'Goal for testing', project_id) RETURNING id INTO goal_id;

-- Create test tasks
INSERT INTO tasks (name, description, goal_id) VALUES 
('Dep Task 1', 'Test task 1', goal_id) RETURNING id INTO task1_id;

INSERT INTO tasks (name, description, goal_id) VALUES 
('Dep Task 2', 'Test task 2', goal_id) RETURNING id INTO task2_id;

-- Test valid dependency
SELECT add_task_dependency(task1_id, task2_id);

-- Test circular dependency (should return false)
SELECT add_task_dependency(task2_id, task1_id);
ROLLBACK;

-- Test 8: Test get_task_execution_order stored procedure
SELECT * FROM get_task_execution_order(project_id);

-- Test 9: Test calculate_project_progress stored procedure
SELECT * FROM calculate_project_progress(project_id);

-- Test 10: Test search_entities stored procedure
SELECT * FROM search_entities('test', 10);

-- Cleanup test data
DELETE FROM knowledge_base_references WHERE entity_id = project_id;
DELETE FROM knowledge_base WHERE id = kb_id;
DELETE FROM task_dependencies WHERE task_id IN (task1_id, task2_id, task3_id);
DELETE FROM tasks WHERE id IN (task1_id, task2_id, task3_id);
DELETE FROM goals WHERE id IN (goal1_id, goal2_id);
DELETE FROM projects WHERE name IN ('Views Test Project', 'Procedure Test Project', 'Dependency Test');