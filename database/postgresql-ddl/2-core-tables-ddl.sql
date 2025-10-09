-- Core Tables with Enhanced Constraints

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