-- Essential Stored Procedures

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