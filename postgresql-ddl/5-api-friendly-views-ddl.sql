-- Enhanced API-Friendly Views

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