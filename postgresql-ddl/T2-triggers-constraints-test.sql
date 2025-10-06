-- Test Triggers and Constraints
-- This file tests the database triggers and constraints to ensure they work correctly

-- Test 1: updated_at trigger
-- Create a test project and verify the updated_at timestamp changes
BEGIN;
INSERT INTO projects (name, description, status) VALUES 
('Trigger Test Project', 'Testing updated_at trigger', 'Planning Phase');

-- Get the initial updated_at value
SELECT updated_at FROM projects WHERE name = 'Trigger Test Project';

-- Wait a second (in psql you might use: SELECT pg_sleep(1);)
-- Update the project
UPDATE projects SET description = 'Updated description' WHERE name = 'Trigger Test Project';

-- Verify updated_at has changed
SELECT updated_at FROM projects WHERE name = 'Trigger Test Project';
ROLLBACK;

-- Test 2: Task auto-completion trigger
BEGIN;
-- Create test project and goal
INSERT INTO projects (name, description, status) VALUES 
('Auto Complete Test', 'Testing auto-completion', 'Planning Phase') RETURNING id INTO project_id;

INSERT INTO goals (name, description, project_id) VALUES 
('Test Goal', 'Goal for testing', project_id) RETURNING id INTO goal_id;

-- Test 2a: Setting date_completed should auto-set status to 'Done'
INSERT INTO tasks (name, description, goal_id, date_completed) VALUES 
('Auto Complete Test 1', 'Test auto-completion', goal_id, CURRENT_DATE);

SELECT status, date_completed FROM tasks WHERE name = 'Auto Complete Test 1';

-- Test 2b: Setting status to 'Done' should auto-set date_completed
INSERT INTO tasks (name, description, goal_id, status) VALUES 
('Auto Complete Test 2', 'Test auto-completion', goal_id, 'Done'::task_status);

SELECT status, date_completed FROM tasks WHERE name = 'Auto Complete Test 2';

-- Test 2c: Changing status from 'Done' should clear date_completed
UPDATE tasks SET status = 'Active'::task_status WHERE name = 'Auto Complete Test 2';
SELECT status, date_completed FROM tasks WHERE name = 'Auto Complete Test 2';
ROLLBACK;

-- Test 3: Task dependency cycle prevention
BEGIN;
-- Create test project and goal
INSERT INTO projects (name, description, status) VALUES 
('Cycle Test', 'Testing cycle prevention', 'Planning Phase') RETURNING id INTO project_id;

INSERT INTO goals (name, description, project_id) VALUES 
('Cycle Test Goal', 'Goal for testing', project_id) RETURNING id INTO goal_id;

-- Create test tasks
INSERT INTO tasks (name, description, goal_id) VALUES 
('Cycle Test Task 1', 'Test task 1', goal_id) RETURNING id INTO task1_id;

INSERT INTO tasks (name, description, goal_id) VALUES 
('Cycle Test Task 2', 'Test task 2', goal_id) RETURNING id INTO task2_id;

-- Test 3a: Valid dependency should work
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (task1_id, task2_id);

-- Test 3b: Circular dependency should fail
-- This should raise an exception
INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (task2_id, task1_id);
ROLLBACK;

-- Test 4: Project date range constraint
BEGIN;
-- This should fail - end date before start date
INSERT INTO projects (name, description, start_date, end_date, status) VALUES 
('Invalid Date Range', 'Testing date constraint', '2025-01-01', '2024-12-31', 'Planning Phase');
ROLLBACK;

-- Test 5: Goal self-reference constraint
BEGIN;
-- Create test project
INSERT INTO projects (name, description, status) VALUES 
('Self Reference Test', 'Testing self-reference', 'Planning Phase') RETURNING id INTO project_id;

-- This should fail - goal referencing itself
INSERT INTO goals (name, description, project_id, parent_goal_id) VALUES 
('Self Reference Goal', 'Testing self-reference', project_id, 'same-goal-id');
ROLLBACK;