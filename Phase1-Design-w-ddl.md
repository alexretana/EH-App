# Phase 1

This is to be a single page application, with 3 layouts: Project View and Knowledge Base View and Task View

For now, we skip auth and login pages, and just create a test user in the database, and associate all data with this test user. This is just for prototyping purposes.

I want you to create the supabase firestore database as specified by the ddl in this document, however, while developing, always start off by mocking the expected json format, and once the user requests it, implement the connection to the the supabase database

Throughout this implementation, make all the visual designs sleek and modern, with subtle gradients. Make sure to appropriately give elements smooth animations when it make sense to. Set these color variables and use them always

--bg-dark: oklch(0.1 0.03 310);
--bg: oklch(0.15 0.03 310);
--bg-light: oklch(0.2 0.03 310);
--text: oklch(0.96 0.06 310);
--text-muted: oklch(0.76 0.06 310);
--highlight: oklch(0.5 0.06 310);
--border: oklch(0.4 0.06 310);
--border-muted: oklch(0.3 0.06 310);
--primary: oklch(0.76 0.1 310);
--secondary: oklch(0.76 0.1 130);
--danger: oklch(0.7 0.06 30);
--warning: oklch(0.7 0.06 100);
--success: oklch(0.7 0.06 160);
--info: oklch(0.7 0.06 260);

## Project View

If there is no project, the page should be blank, and a centered large text should say 'Create Your First Project'

There should be a + button in the top right corner with round edges. This is the add Project Button

Creating a new project will open a Modal that will allow the user to input information for the project. Refer to the data model to know what columns to include and what columns are required. There should be a create and cancel button at the bottom.

Projects are listed on the project view as list with the Project name, it's status, it's time estimate, and two buttons at the end. The buttons at the end are and editing button for opening the project editing modal (which should be very similear to the create project modal) and the expand/collapse button, which will reveal the goals associated to this project.

When the expand button is pressed, it should reveal the goals underneath it with a small indentation to clarify the heirarchical relationship between projects and goals. The end of the goals list should always be an "add new goals" button. This means even if there's no goals for a project, pressing the expand button should at least reveal the 'add new goals' row of the list.

Goals will need similar things. The add new goals buttons should reveal a modal to create a goal. Reference the database to know what fields should be enterable here, what fields need to be required. Note: if the user chooses the make a weekly-milestone, they MUST pick a parent monthly/quarterly goal for it. The list elements themselves are similar to projects. If it's a weekly-milestone, it should always be listed under it's parent monthly/quarterly goal in a slightly different shade, before the next monthly goal/quarterly goal. each list element should show the name, the state, the time frame, and then the final 2 buttons again. Every goal will have the edit button, but for montly/quarterly goals, the second button is a + sign that lets you create a weekly-milestone linked to that goal(this means open up a creation modal), while for the weekly-milestone, they will insetad have the expand/colapse button. This time, the expanding button reveals tasks related to the weekly-milestone, and in a similar fashion is ended by a "add new tasks" list element, which upon click will open up the 'create task' modal. 

Finally the tasks cannot be furter expanded on. The tasks should have the name, the status, the time estimate, and have a couple buttons at the end. They should always have the edit button to open the task editing modal, but depending on their current status, there should be a button to easily update status. If 'Not Started' there should be one button to make it active. If 'Active', there should be 3 buttons (one to make 'not started', one to make it 'completed' and one to make it 'canceled'). If 'Completed' or 'Canceled' you should have a button to be able to make it 'Active' again.

This is the main way for the user to directly interact with the data in the postgresql database and be able to view everything tied to their account.

## Knowledge Base View

This is where the user can manage the Knowledge base documents. For this prototype, the user will only be able to create, view, and update knowledge documents (delete will be created later, but it should be rarely done, so we omit it for now).

Simliar to the add project button, there is an add document button in the same corner in this screen

The knowledge base view will be a gallery view with cards. Each card will show the knowledge document's name, an icon indicating there is an attachment. The day last updated. And then the content turncated since the card can't take up too much room. They will also show the project it's related to.

And finally a read and edit button at the bottom of each card. Both buttons open the same modal, but the modal will have 2 states: Read state and edit state. When the modal is open, there will be a button in the top right allows the user to switch between edit and read mode. When in read mode, .md gets rendered correctly, and none of the data can be edited in this state. When in edit mode, content can be edited, and markdown will appear as raw text instead.

## Tasks View

This view does not allow the user to update goals or projects. 

The purpose of this view is to have a lower level view of your project journey, and give you quick access to update your tasks, promoting an organized yet flexible workflow.

This view has two sub-views: Checklist and Kanban.

The checklist view has the list of all the tasks tied to the current active project. This view has the tasks listed out with the task name, the status, the project it's tied to, it's time estimate, and a series of buttons. Use the same logic for the buttons as in the project view. This should make it convinent for the user to update the status of their tasks.

Then there should be 3 radio buttons above the list (require select one) that picks show all tasks in active projects, show only in active goals, or show only in active weekly-milestone.

There should also be a sort button that lets you sort by dependency order, or sort by status (which really means order the tasks by active, then not started, then completed, then canceld, and within those groups, sorted by most recent first).

The Kanban view is a standard kanban view. (I haven't fully elaborated this, so just make what is 'default' kanban view, and I'll suggest updates after if need be)


## Navigations

The naviagtion will be a drawer on the left. The order will be - Projects
- Knowledge Base
- Tasks

Make the nav bar hideable


---

Postgresql DDL

## Complete DDL Scripts

### 1. Database Setup and Extensions

```sql
-- Event Horizon Database Setup
-- Run these commands as PostgreSQL superuser

-- Create database (if not exists)
-- CREATE DATABASE event_horizon;

-- Connect to the database and enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types for better data integrity
CREATE TYPE project_status AS ENUM ('Planning Phase', 'Active', 'Completed', 'Cancelled');
CREATE TYPE goal_status AS ENUM ('Not started', 'Active', 'Done', 'Cancelled');
CREATE TYPE task_status AS ENUM ('Not started', 'Active', 'Done', 'Cancelled');
CREATE TYPE priority_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE effort_level AS ENUM ('Small', 'Medium', 'Large');
CREATE TYPE expansion_horizon AS ENUM ('1 Week', '2 Weeks', '3 Weeks');
CREATE TYPE milestone_granularity AS ENUM ('Monthly', 'Quarterly', 'Monthly&Quarterly');
CREATE TYPE goal_scope AS ENUM ('Monthly', 'Quarterly', 'Weekly-Milestone');
CREATE TYPE task_type AS ENUM ('Network', 'Debug', 'Review', 'Develop', 'Marketing', 'Provision', 'Research');
```

### 2. Core Tables with Enhanced Constraints

```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'Planning Phase',
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    is_validated BOOLEAN DEFAULT false,
    time_estimate_months INTEGER CHECK (time_estimate_months > 0),
    time_estimation_validated BOOLEAN DEFAULT false,
    expansion_horizon expansion_horizon,
    milestone_granularity milestone_granularity,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT unique_active_project_name UNIQUE (name) DEFERRABLE INITIALLY DEFERRED
);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status goal_status NOT NULL DEFAULT 'Not started',
    scope goal_scope,
    success_criteria TEXT,
    due_date DATE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_reference CHECK (id != parent_goal_id)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'Not started',
    task_type task_type,
    priority priority_level,
    effort_level effort_level,
    time_estimate_minutes INTEGER CHECK (time_estimate_minutes > 0),
    due_date DATE,
    date_completed DATE,
    week_start_date DATE,
    assignee VARCHAR(255),
    goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT completed_date_logic CHECK (
        (status = 'Done' AND date_completed IS NOT NULL) OR
        (status != 'Done')
    )
);

-- Task dependencies table
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

-- Knowledge base table
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_name VARCHAR(255) NOT NULL,
    content TEXT,
    ai_summary TEXT,
    file_attachment BYTEA,
    link_citations TEXT[],
    date_added DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT non_empty_document_name CHECK (LENGTH(TRIM(document_name)) > 0)
);

-- Knowledge base references table
CREATE TABLE knowledge_base_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_base_id UUID NOT NULL REFERENCES knowledge_base(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('project', 'goal', 'task')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(knowledge_base_id, entity_type, entity_id)
);
```

### 3. Performance Indexes

```sql
-- Primary relationship indexes
CREATE INDEX idx_goals_project_id ON goals(project_id);
CREATE INDEX idx_goals_parent_goal_id ON goals(parent_goal_id);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Status and date indexes for filtering
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = true;
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_due_date ON goals(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_priority ON tasks(priority) WHERE priority IS NOT NULL;
CREATE INDEX idx_tasks_assignee ON tasks(assignee) WHERE assignee IS NOT NULL;

-- Knowledge base search indexes
CREATE INDEX idx_knowledge_base_references_entity ON knowledge_base_references(entity_type, entity_id);
CREATE INDEX idx_knowledge_base_date_added ON knowledge_base(date_added);

-- Full-text search indexes
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_goals_search ON goals USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(success_criteria, '')));
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_knowledge_base_search ON knowledge_base USING gin(to_tsvector('english', document_name || ' ' || COALESCE(content, '') || ' ' || COALESCE(ai_summary, '')));

-- Composite indexes for common queries
CREATE INDEX idx_goals_project_status ON goals(project_id, status);
CREATE INDEX idx_tasks_goal_status ON tasks(goal_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee, status) WHERE assignee IS NOT NULL;
```

### 4. Essential Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all main tables
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to prevent dependency cycles
CREATE OR REPLACE FUNCTION prevent_dependency_cycles()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for cycles using recursive CTE
    IF EXISTS (
        WITH RECURSIVE dependency_path AS (
            SELECT NEW.task_id as task_id, NEW.depends_on_task_id as depends_on_task_id, 1 as depth
            UNION ALL
            SELECT dp.task_id, td.depends_on_task_id, dp.depth + 1
            FROM dependency_path dp
            JOIN task_dependencies td ON dp.depends_on_task_id = td.task_id
            WHERE dp.depth < 100 -- Prevent infinite recursion
        )
        SELECT 1 FROM dependency_path WHERE task_id = depends_on_task_id
    ) THEN
        RAISE EXCEPTION 'Task dependency would create a cycle';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply cycle prevention trigger
CREATE TRIGGER prevent_task_dependency_cycles 
    BEFORE INSERT OR UPDATE ON task_dependencies 
    FOR EACH ROW EXECUTE FUNCTION prevent_dependency_cycles();

-- Function to auto-complete tasks when date_completed is set
CREATE OR REPLACE FUNCTION auto_complete_task()
RETURNS TRIGGER AS $$
BEGIN
    -- If date_completed is set and status is not 'Done', update status
    IF NEW.date_completed IS NOT NULL AND NEW.status != 'Done' THEN
        NEW.status = 'Done';
    END IF;
    
    -- If status is set to 'Done' and date_completed is null, set it to today
    IF NEW.status = 'Done' AND NEW.date_completed IS NULL THEN
        NEW.date_completed = CURRENT_DATE;
    END IF;
    
    -- If status is changed from 'Done' to something else, clear date_completed (only on UPDATE)
    IF TG_OP = 'UPDATE' AND OLD.status = 'Done' AND NEW.status != 'Done' THEN
        NEW.date_completed = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply auto-completion trigger for both INSERT and UPDATE
CREATE TRIGGER auto_complete_task_trigger
    BEFORE INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION auto_complete_task();
```

### 5. Enhanced API-Friendly Views

```sql
-- Project dashboard view with comprehensive metrics
CREATE VIEW project_dashboard AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.start_date,
    p.end_date,
    p.is_active,
    p.is_validated,
    p.time_estimate_months,
    p.expansion_horizon,
    p.milestone_granularity,
    COUNT(DISTINCT g.id) as total_goals,
    COUNT(DISTINCT CASE WHEN g.status = 'Done' THEN g.id END) as completed_goals,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN t.id END) as overdue_tasks,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT t.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) * 100.0 / COUNT(DISTINCT t.id))
            ELSE 0 
        END, 2
    ) as task_progress_percentage,
    ROUND(
        CASE 
            WHEN COUNT(DISTINCT g.id) > 0 
            THEN (COUNT(DISTINCT CASE WHEN g.status = 'Done' THEN g.id END) * 100.0 / COUNT(DISTINCT g.id))
            ELSE 0 
        END, 2
    ) as goal_progress_percentage,
    SUM(COALESCE(t.time_estimate_minutes, 0)) as total_estimated_minutes,
    SUM(CASE WHEN t.status = 'Done' THEN COALESCE(t.time_estimate_minutes, 0) ELSE 0 END) as completed_estimated_minutes,
    p.created_at,
    p.updated_at
FROM projects p
LEFT JOIN goals g ON p.id = g.project_id
LEFT JOIN tasks t ON g.id = t.goal_id
GROUP BY p.id, p.name, p.status, p.start_date, p.end_date, p.is_active, p.is_validated, 
         p.time_estimate_months, p.expansion_horizon, p.milestone_granularity, p.created_at, p.updated_at;

-- Task details view with comprehensive relationships
CREATE VIEW task_details AS
SELECT 
    t.id,
    t.name,
    t.description,
    t.status,
    t.task_type,
    t.priority,
    t.effort_level,
    t.time_estimate_minutes,
    t.due_date,
    t.date_completed,
    t.week_start_date,
    t.assignee,
    p.name as project_name,
    p.id as project_id,
    g.name as goal_name,
    g.id as goal_id,
    array_agg(DISTINCT dep_tasks.name) FILTER (WHERE dep_tasks.name IS NOT NULL) as dependencies,
    array_agg(DISTINCT dep_tasks.id) FILTER (WHERE dep_tasks.id IS NOT NULL) as dependency_ids,
    array_agg(DISTINCT blocked_tasks.name) FILTER (WHERE blocked_tasks.name IS NOT NULL) as blocks_tasks,
    array_agg(DISTINCT blocked_tasks.id) FILTER (WHERE blocked_tasks.id IS NOT NULL) as blocked_task_ids,
    CASE 
        WHEN t.due_date IS NOT NULL AND t.due_date < CURRENT_DATE AND t.status != 'Done' 
        THEN true 
        ELSE false 
    END as is_overdue,
    CASE 
        WHEN t.due_date IS NOT NULL 
        THEN t.due_date - CURRENT_DATE 
        ELSE NULL 
    END as days_until_due,
    t.created_at,
    t.updated_at
FROM tasks t
JOIN goals g ON t.goal_id = g.id
JOIN projects p ON g.project_id = p.id
LEFT JOIN task_dependencies td ON t.id = td.task_id
LEFT JOIN tasks dep_tasks ON td.depends_on_task_id = dep_tasks.id
LEFT JOIN task_dependencies td2 ON t.id = td2.depends_on_task_id
LEFT JOIN tasks blocked_tasks ON td2.task_id = blocked_tasks.id
GROUP BY t.id, t.name, t.description, t.status, t.task_type, t.priority, t.effort_level, 
         t.time_estimate_minutes, t.due_date, t.date_completed, t.week_start_date, t.assignee,
         p.name, p.id, g.name, g.id, t.created_at, t.updated_at;

-- Goal progress view with task metrics
CREATE VIEW goal_progress AS
SELECT 
    g.id,
    g.name,
    g.description,
    g.status,
    g.scope,
    g.success_criteria,
    g.due_date,
    p.name as project_name,
    p.id as project_id,
    parent_g.name as parent_goal_name,
    parent_g.id as parent_goal_id,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'Done' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN 1 END) as overdue_tasks,
    ROUND(
        CASE 
            WHEN COUNT(t.id) > 0 
            THEN (COUNT(CASE WHEN t.status = 'Done' THEN 1 END) * 100.0 / COUNT(t.id))
            ELSE 0 
        END, 2
    ) as progress_percentage,
    CASE 
        WHEN g.due_date IS NOT NULL AND g.due_date < CURRENT_DATE AND g.status != 'Done' 
        THEN true 
        ELSE false 
    END as is_overdue,
    CASE 
        WHEN g.due_date IS NOT NULL 
        THEN g.due_date - CURRENT_DATE 
        ELSE NULL 
    END as days_until_due,
    g.created_at,
    g.updated_at
FROM goals g
LEFT JOIN projects p ON g.project_id = p.id
LEFT JOIN goals parent_g ON g.parent_goal_id = parent_g.id
LEFT JOIN tasks t ON g.id = t.goal_id
GROUP BY g.id, g.name, g.description, g.status, g.scope, g.success_criteria, g.due_date,
         p.name, p.id, parent_g.name, parent_g.id, g.created_at, g.updated_at;

-- Knowledge base with comprehensive references
CREATE VIEW knowledge_base_with_references AS
SELECT 
    kb.id,
    kb.document_name,
    kb.ai_summary,
    kb.date_added,
    kb.file_attachment,
    kb.link_citations,
    array_agg(DISTINCT 
        CASE 
            WHEN kbr.entity_type = 'project' THEN p.name
            WHEN kbr.entity_type = 'goal' THEN g.name  
            WHEN kbr.entity_type = 'task' THEN t.name
        END
    ) FILTER (WHERE kbr.entity_type IS NOT NULL) as related_entities,
    array_agg(DISTINCT 
        CASE 
            WHEN kbr.entity_type = 'project' THEN p.id
            WHEN kbr.entity_type = 'goal' THEN g.id  
            WHEN kbr.entity_type = 'task' THEN t.id
        END
    ) FILTER (WHERE kbr.entity_type IS NOT NULL) as related_entity_ids,
    array_agg(DISTINCT kbr.entity_type) FILTER (WHERE kbr.entity_type IS NOT NULL) as entity_types,
    kb.created_at,
    kb.updated_at
FROM knowledge_base kb
LEFT JOIN knowledge_base_references kbr ON kb.id = kbr.knowledge_base_id
LEFT JOIN projects p ON kbr.entity_type = 'project' AND kbr.entity_id = p.id
LEFT JOIN goals g ON kbr.entity_type = 'goal' AND kbr.entity_id = g.id
LEFT JOIN tasks t ON kbr.entity_type = 'task' AND kbr.entity_id = t.id
GROUP BY kb.id, kb.document_name, kb.ai_summary, kb.date_added, kb.file_attachment, 
         kb.link_citations, kb.created_at, kb.updated_at;
```

### 6. Essential Stored Procedures

```sql
-- Create project with validation
CREATE OR REPLACE FUNCTION create_project(
    p_name VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_time_estimate_months INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
BEGIN
    -- Validate date range
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL AND p_end_date < p_start_date THEN
        RAISE EXCEPTION 'End date cannot be before start date';
    END IF;
    
    -- Insert new project
    INSERT INTO projects (name, description, start_date, end_date, time_estimate_months)
    VALUES (p_name, p_description, p_start_date, p_end_date, p_time_estimate_months)
    RETURNING id INTO new_project_id;
    
    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;

-- Add task dependency with cycle detection
CREATE OR REPLACE FUNCTION add_task_dependency(
    p_task_id UUID,
    p_depends_on_task_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- The cycle detection is handled by the trigger
    INSERT INTO task_dependencies (task_id, depends_on_task_id)
    VALUES (p_task_id, p_depends_on_task_id);
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Get task execution order using topological sort
CREATE OR REPLACE FUNCTION get_task_execution_order(
    p_project_id UUID DEFAULT NULL
) RETURNS TABLE(task_id UUID, task_name VARCHAR(255), execution_order INTEGER) AS $$
WITH RECURSIVE task_order AS (
    -- Start with tasks that have no dependencies
    SELECT
        t.id as task_id,
        t.name as task_name,
        1 as execution_order
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    LEFT JOIN task_dependencies td ON t.id = td.task_id
    WHERE td.task_id IS NULL
    AND (p_project_id IS NULL OR g.project_id = p_project_id)
    
    UNION ALL
    
    -- Add tasks whose dependencies are already ordered
    SELECT
        t.id as task_id,
        t.name as task_name,
        to_order.execution_order + 1
    FROM tasks t
    JOIN goals g ON t.goal_id = g.id
    JOIN task_dependencies td ON t.id = td.task_id
    JOIN task_order to_order ON td.depends_on_task_id = to_order.task_id
    WHERE (p_project_id IS NULL OR g.project_id = p_project_id)
)
SELECT DISTINCT ON (task_order.task_id)
    task_order.task_id,
    task_order.task_name,
    task_order.execution_order
FROM task_order
ORDER BY task_order.task_id, task_order.execution_order DESC;
$$ LANGUAGE sql;

-- Calculate comprehensive project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(
    p_project_id UUID
) RETURNS TABLE(
    total_goals INTEGER,
    completed_goals INTEGER,
    total_tasks INTEGER,
    completed_tasks INTEGER,
    overdue_tasks INTEGER,
    goal_progress_percentage DECIMAL(5,2),
    task_progress_percentage DECIMAL(5,2),
    total_estimated_hours DECIMAL(8,2),
    completed_estimated_hours DECIMAL(8,2),
    estimated_completion_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT g.id)::INTEGER as total_goals,
        COUNT(DISTINCT CASE WHEN g.status = 'Done' THEN g.id END)::INTEGER as completed_goals,
        COUNT(DISTINCT t.id)::INTEGER as total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END)::INTEGER as completed_tasks,
        COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'Done' THEN t.id END)::INTEGER as overdue_tasks,
        ROUND(
            CASE 
                WHEN COUNT(DISTINCT g.id) > 0 
                THEN (COUNT(DISTINCT CASE WHEN g.status = 'Done' THEN g.id END) * 100.0 / COUNT(DISTINCT g.id))
                ELSE 0 
            END, 2
        ) as goal_progress_percentage,
        ROUND(
            CASE 
                WHEN COUNT(DISTINCT t.id) > 0 
                THEN (COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) * 100.0 / COUNT(DISTINCT t.id))
                ELSE 0 
            END, 2
        ) as task_progress_percentage,
        ROUND(SUM(COALESCE(t.time_estimate_minutes, 0)) / 60.0, 2) as total_estimated_hours,
        ROUND(SUM(CASE WHEN t.status = 'Done' THEN COALESCE(t.time_estimate_minutes, 0) ELSE 0 END) / 60.0, 2) as completed_estimated_hours,
        -- Simple estimation based on current progress rate
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END) > 0 
            THEN CURRENT_DATE + INTERVAL '1 day' * (
                COUNT(DISTINCT CASE WHEN t.status != 'Done' THEN t.id END) * 
                EXTRACT(days FROM (CURRENT_DATE - MIN(t.date_completed))) / 
                COUNT(DISTINCT CASE WHEN t.status = 'Done' THEN t.id END)
            )
            ELSE NULL
        END::DATE as estimated_completion_date
    FROM projects p
    LEFT JOIN goals g ON p.id = g.project_id
    LEFT JOIN tasks t ON g.id = t.goal_id
    WHERE p.id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- Search across all entities
CREATE OR REPLACE FUNCTION search_entities(
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE(
    entity_type VARCHAR(20),
    entity_id UUID,
    entity_name VARCHAR(255),
    entity_description TEXT,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    (
        SELECT 
            'project'::VARCHAR(20) as entity_type,
            p.id as entity_id,
            p.name as entity_name,
            p.description as entity_description,
            ts_rank(to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')), plainto_tsquery('english', p_search_term)) as relevance_score
        FROM projects p
        WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', p_search_term)
        
        UNION ALL
        
        SELECT 
            'goal'::VARCHAR(20) as entity_type,
            g.id as entity_id,
            g.name as entity_name,
            g.description as entity_description,
            ts_rank(to_tsvector('english', g.name || ' ' || COALESCE(g.description, '') || ' ' || COALESCE(g.success_criteria, '')), plainto_tsquery('english', p_search_term)) as relevance_score
        FROM goals g
        WHERE to_tsvector('english', g.name || ' ' || COALESCE(g.description, '') || ' ' || COALESCE(g.success_criteria, '')) @@ plainto_tsquery('english', p_search_term)
        
        UNION ALL
        
        SELECT 
            'task'::VARCHAR(20) as entity_type,
            t.id as entity_id,
            t.name as entity_name,
            t.description as entity_description,
            ts_rank(to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')), plainto_tsquery('english', p_search_term)) as relevance_score
        FROM tasks t
        WHERE to_tsvector('english', t.name || ' ' || COALESCE(t.description, '')) @@ plainto_tsquery('english', p_search_term)
        
        UNION ALL
        
        SELECT 
            'knowledge'::VARCHAR(20) as entity_type,
            kb.id as entity_id,
            kb.document_name as entity_name,
            kb.ai_summary as entity_description,
            ts_rank(to_tsvector('english', kb.document_name || ' ' || COALESCE(kb.content, '') || ' ' || COALESCE(kb.ai_summary, '')), plainto_tsquery('english', p_search_term)) as relevance_score
        FROM knowledge_base kb
        WHERE to_tsvector('english', kb.document_name || ' ' || COALESCE(kb.content, '') || ' ' || COALESCE(kb.ai_summary, '')) @@ plainto_tsquery('english', p_search_term)
    )
    ORDER BY relevance_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### 7. Sample Data for Testing

```sql
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
```

## Database Connection Testing

Once you have the PostgreSQL connection working, you can test the schema with these queries:

```sql
-- Test basic table creation
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Test views
SELECT * FROM project_dashboard LIMIT 5;

-- Test stored procedures
SELECT create_project('Test Project', 'A test project for validation');

-- Test full-text search
SELECT * FROM search_entities('database') LIMIT 10;
```