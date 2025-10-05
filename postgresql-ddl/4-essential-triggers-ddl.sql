-- Essential Triggers

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