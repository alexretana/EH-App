-- Performance Indexes

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