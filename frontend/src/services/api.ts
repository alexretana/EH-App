import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for our data models
export interface Project {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  status?: 'Planning Phase' | 'Active' | 'Completed' | 'Cancelled';
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_validated?: boolean;
  time_estimate_months?: number;
  time_estimation_validated?: boolean;
  expansion_horizon?: '1 Week' | '2 Weeks' | '3 Weeks';
  milestone_granularity?: 'Monthly' | 'Quarterly' | 'Monthly&Quarterly';
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  scope?: 'Monthly' | 'Quarterly' | 'Weekly-Milestone';
  success_criteria?: string;
  due_date?: string;
  project_id: string;
  parent_goal_id?: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  completed_tasks?: number;
}

export interface GoalCreate {
  name: string;
  description?: string;
  status?: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  scope?: 'Monthly' | 'Quarterly' | 'Weekly-Milestone';
  success_criteria?: string;
  due_date?: string;
  project_id: string;
  parent_goal_id?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  task_type?: 'Network' | 'Debug' | 'Review' | 'Develop' | 'Marketing' | 'Provision' | 'Research';
  priority?: 'Low' | 'Medium' | 'High';
  effort_level?: 'Small' | 'Medium' | 'Large';
  time_estimate_minutes?: number;
  due_date?: string;
  date_completed?: string;
  week_start_date?: string;
  assignee?: string;
  goal_id: string;
  created_at: string;
  updated_at: string;
  goal_name?: string;
  project_name?: string;
  dependencies?: string[];
}

export interface TaskCreate {
  name: string;
  description?: string;
  status?: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  task_type?: 'Network' | 'Debug' | 'Review' | 'Develop' | 'Marketing' | 'Provision' | 'Research';
  priority?: 'Low' | 'Medium' | 'High';
  effort_level?: 'Small' | 'Medium' | 'Large';
  time_estimate_minutes?: number;
  due_date?: string;
  date_completed?: string;
  week_start_date?: string;
  assignee?: string;
  goal_id: string;
}

export interface KnowledgeBase {
  id: string;
  document_name: string;
  content?: string;
  ai_summary?: string;
  date_added: string;
  link_citations?: string[];
  created_at: string;
  updated_at: string;
  related_entities?: string[];
  related_entity_ids?: string[];
  entity_types?: string[];
}

export interface KnowledgeBaseCreate {
  document_name: string;
  content?: string;
  ai_summary?: string;
  link_citations?: string[];
  related_projects?: string[];
  related_goals?: string[];
  related_tasks?: string[];
}

// Project API calls
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data;
  },
  
  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (project: ProjectCreate): Promise<Project> => {
    const response = await api.post('/projects/', project);
    return response.data;
  },
  
  update: async (id: string, project: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  
  getGoals: async (id: string): Promise<Goal[]> => {
    const response = await api.get(`/projects/${id}/goals`);
    return response.data;
  },
};

// Goal API calls
export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const response = await api.get('/goals/');
    return response.data;
  },
  
  getById: async (id: string): Promise<Goal> => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },
  
  create: async (goal: GoalCreate): Promise<Goal> => {
    const response = await api.post('/goals/', goal);
    return response.data;
  },
  
  update: async (id: string, goal: Partial<GoalCreate>): Promise<Goal> => {
    const response = await api.put(`/goals/${id}`, goal);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },
  
  getTasks: async (id: string): Promise<Task[]> => {
    const response = await api.get(`/goals/${id}/tasks`);
    return response.data;
  },
  
  getProjectHierarchy: async (projectId: string): Promise<Goal[]> => {
    const response = await api.get(`/goals/project/${projectId}/hierarchy`);
    return response.data;
  },
  
  getChildGoals: async (parentGoalId: string): Promise<Goal[]> => {
    const response = await api.get(`/goals/parent/${parentGoalId}/children`);
    return response.data;
  },
};

// Task API calls
export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/');
    return response.data;
  },
  
  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  create: async (task: TaskCreate): Promise<Task> => {
    const response = await api.post('/tasks/', task);
    return response.data;
  },
  
  update: async (id: string, task: Partial<TaskCreate>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
  
  updateStatus: async (id: string, status: string): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },
  
  getByProject: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },
  
  getByGoal: async (goalId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/goal/${goalId}`);
    return response.data;
  },
  
  getActiveProjectsTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/active/projects');
    return response.data;
  },
  
  getActiveGoalsTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/active/goals');
    return response.data;
  },
  
  getActiveWeeklyMilestoneTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks/active/weekly-milestones');
    return response.data;
  },
  
  getDetails: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/details/${id}`);
    return response.data;
  },
};

// Knowledge Base API calls
export const knowledgeApi = {
  getAll: async (): Promise<KnowledgeBase[]> => {
    const response = await api.get('/knowledge/');
    return response.data;
  },
  
  getById: async (id: string): Promise<KnowledgeBase> => {
    const response = await api.get(`/knowledge/${id}`);
    return response.data;
  },
  
  create: async (item: KnowledgeBaseCreate): Promise<KnowledgeBase> => {
    const response = await api.post('/knowledge/', item);
    return response.data;
  },
  
  update: async (id: string, item: Partial<KnowledgeBaseCreate>): Promise<KnowledgeBase> => {
    const response = await api.put(`/knowledge/${id}`, item);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/knowledge/${id}`);
  },
  
  getByProject: async (projectId: string): Promise<KnowledgeBase[]> => {
    const response = await api.get(`/knowledge/project/${projectId}`);
    return response.data;
  },
  
  getByGoal: async (goalId: string): Promise<KnowledgeBase[]> => {
    const response = await api.get(`/knowledge/goal/${goalId}`);
    return response.data;
  },
  
  getByTask: async (taskId: string): Promise<KnowledgeBase[]> => {
    const response = await api.get(`/knowledge/task/${taskId}`);
    return response.data;
  },
};

export default api;