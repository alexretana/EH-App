// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Project entity
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'Planning Phase' | 'Active' | 'Completed' | 'Cancelled';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_validated: boolean;
  time_estimate_months?: number;
  time_estimation_validated: boolean;
  expansion_horizon?: '1 Week' | '2 Weeks' | '3 Weeks';
  milestone_granularity?: 'Monthly' | 'Quarterly' | 'Monthly&Quarterly';
}

// Goal entity
export interface Goal extends BaseEntity {
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  scope: 'Monthly' | 'Quarterly' | 'Weekly-Milestone';
  success_criteria?: string;
  due_date?: string;
  project_id: string;
  parent_goal_id?: string;
}

// Task entity
export interface Task extends BaseEntity {
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  task_type: 'Network' | 'Debug' | 'Review' | 'Develop' | 'Marketing' | 'Provision' | 'Research';
  priority: 'Low' | 'Medium' | 'High';
  effort_level: 'Small' | 'Medium' | 'Large';
  time_estimate_minutes: number;
  due_date?: string;
  date_completed?: string;
  week_start_date?: string;
  assignee?: string;
  goal_id: string;
  uniqueKey?: string; // Added for Framer Motion AnimatePresence to track reordering
}

// Task dependency entity
export interface TaskDependency extends BaseEntity {
  task_id: string;
  depends_on_task_id: string;
}

// Knowledge base entity
export interface KnowledgeBase extends BaseEntity {
  document_name: string;
  content?: string;
  ai_summary?: string;
  file_attachment?: string;
  link_citations?: string[];
  date_added: string;
}

// Knowledge base reference entity
export interface KnowledgeBaseReference extends BaseEntity {
  knowledge_base_id: string;
  entity_type: 'project' | 'goal' | 'task';
  entity_id: string;
}

// Enhanced view entities (matching PostgreSQL views)
export interface ProjectDashboard extends BaseEntity {
  name: string;
  status: Project['status'];
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_validated: boolean;
  time_estimate_months?: number;
  expansion_horizon?: Project['expansion_horizon'];
  milestone_granularity?: Project['milestone_granularity'];
  total_goals: number;
  completed_goals: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  task_progress_percentage: number;
  goal_progress_percentage: number;
  total_estimated_minutes: number;
  completed_estimated_minutes: number;
}

export interface TaskDetails extends BaseEntity {
  name: string;
  description?: string;
  status: Task['status'];
  task_type: Task['task_type'];
  priority: Task['priority'];
  effort_level: Task['effort_level'];
  time_estimate_minutes: number;
  due_date?: string;
  date_completed?: string;
  week_start_date?: string;
  assignee?: string;
  project_name: string;
  project_id: string;
  goal_name: string;
  goal_id: string;
  dependencies: string[];
  dependency_ids: string[];
  blocks_tasks: string[];
  blocked_task_ids: string[];
  is_overdue: boolean;
  days_until_due: number | null;
}

export interface GoalProgress extends BaseEntity {
  name: string;
  description?: string;
  status: Goal['status'];
  scope: Goal['scope'];
  success_criteria?: string;
  due_date?: string;
  project_name: string;
  project_id: string;
  parent_goal_name?: string;
  parent_goal_id?: string;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  progress_percentage: number;
  is_overdue: boolean;
  days_until_due: number | null;
}

export interface KnowledgeBaseWithReferences extends BaseEntity {
  document_name: string;
  ai_summary?: string;
  date_added: string;
  file_attachment?: string;
  link_citations?: string[];
  related_entities: string[];
  related_entity_ids: string[];
  entity_types: string[];
}

// Form types for creating/updating entities
export type CreateProject = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProject = Partial<CreateProject> & { id: string };

export type CreateGoal = Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
export type UpdateGoal = Partial<CreateGoal> & { id: string };

export type CreateTask = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type UpdateTask = Partial<CreateTask> & { id: string };

export type CreateKnowledgeBase = Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>;
export type UpdateKnowledgeBase = Partial<CreateKnowledgeBase> & { id: string };