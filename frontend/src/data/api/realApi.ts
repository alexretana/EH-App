import { 
  Project, 
  Goal, 
  Task, 
  KnowledgeBase,
  ProjectDashboard,
  TaskDetails,
  GoalProgress,
  KnowledgeBaseWithReferences,
  CreateProject,
  UpdateProject,
  CreateGoal,
  UpdateGoal,
  CreateTask,
  UpdateTask,
  CreateKnowledgeBase,
  UpdateKnowledgeBase
} from '@/types/mockData';

// API base URL - will use Vite proxy in development
const API_BASE_URL = '/api';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // Try to parse error details from response
    let errorDetails: any = { message: 'Unknown error occurred' };
    try {
      errorDetails = await response.json();
    } catch (e) {
      // If response is not JSON, use status text
      errorDetails = { message: response.statusText || 'API request failed' };
    }
    
    // Create a detailed error for developers
    const error = new Error(
      `API Error: ${response.status} ${response.statusText}\n` +
      `Details: ${JSON.stringify(errorDetails, null, 2)}`
    );
    
    // Attach additional error information
    (error as any).status = response.status;
    (error as any).details = errorDetails;
    
    throw error;
  }
  
  return response.json();
};

// Generic request function with error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Merge with provided headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return await handleResponse<T>(response);
  } catch (error) {
    // Log detailed error for debugging
    console.error('API Request Error:', {
      url,
      method: options.method || 'GET',
      headers,
      error: error instanceof Error ? error.message : String(error),
      details: (error as any).details,
    });
    
    // Re-throw the error for the caller to handle
    throw error;
  }
};

// Project API
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    return apiRequest<Project[]>('/projects/');
  },
  
  getById: async (id: string): Promise<Project | null> => {
    try {
      return await apiRequest<Project>(`/projects/${id}`);
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  create: async (project: CreateProject): Promise<Project> => {
    return apiRequest<Project>('/projects/', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },
  
  update: async (id: string, updates: UpdateProject): Promise<Project | null> => {
    try {
      return await apiRequest<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest<{ message: string }>(`/projects/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      // If 404, return false (project doesn't exist)
      if ((error as any).status === 404) {
        return false;
      }
      throw error;
    }
  },
  
  getDashboard: async (): Promise<ProjectDashboard[]> => {
    // This endpoint doesn't exist yet in the backend, we'll need to create it
    // For now, we'll fetch all projects and transform them
    const projects = await apiRequest<Project[]>('/projects/');
    
    // We need to implement the dashboard view in the backend
    // For now, return a basic transformation
    return projects.map(project => ({
      ...project,
      total_goals: 0,
      completed_goals: 0,
      total_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      task_progress_percentage: 0,
      goal_progress_percentage: 0,
      total_estimated_minutes: 0,
      completed_estimated_minutes: 0,
    }));
  }
};

// Goal API
export const goalApi = {
  getAll: async (): Promise<Goal[]> => {
    return apiRequest<Goal[]>('/goals/');
  },
  
  getByProjectId: async (projectId: string): Promise<Goal[]> => {
    return apiRequest<Goal[]>(`/projects/${projectId}/goals`);
  },
  
  getById: async (id: string): Promise<Goal | null> => {
    try {
      return await apiRequest<Goal>(`/goals/${id}`);
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  create: async (goal: CreateGoal): Promise<Goal> => {
    return apiRequest<Goal>('/goals/', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
  
  update: async (id: string, updates: UpdateGoal): Promise<Goal | null> => {
    try {
      return await apiRequest<Goal>(`/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest<{ message: string }>(`/goals/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      // If 404, return false (goal doesn't exist)
      if ((error as any).status === 404) {
        return false;
      }
      throw error;
    }
  },
  
  getProgress: async (): Promise<GoalProgress[]> => {
    // This endpoint doesn't exist yet in the backend
    // For now, return empty array
    console.warn('Goal progress endpoint not implemented in backend yet');
    return [];
  }
};

// Task API
export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks/');
  },
  
  getByGoalId: async (goalId: string): Promise<Task[]> => {
    return apiRequest<Task[]>(`/tasks/goal/${goalId}`);
  },
  
  getById: async (id: string): Promise<Task | null> => {
    try {
      return await apiRequest<Task>(`/tasks/${id}`);
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  create: async (task: CreateTask): Promise<Task> => {
    return apiRequest<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  
  update: async (id: string, updates: UpdateTask): Promise<Task | null> => {
    try {
      return await apiRequest<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest<{ message: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      // If 404, return false (task doesn't exist)
      if ((error as any).status === 404) {
        return false;
      }
      throw error;
    }
  },
  
  getDetails: async (): Promise<TaskDetails[]> => {
    // This endpoint doesn't exist yet in the backend
    // For now, return empty array
    console.warn('Task details endpoint not implemented in backend yet');
    return [];
  }
};

// Task Dependency API
export const taskDependencyApi = {
  getAll: async () => {
    // This endpoint doesn't exist yet in the backend
    // For now, return empty array
    console.warn('Task dependencies endpoint not implemented in backend yet');
    return [];
  },
  
  create: async (taskId: string, dependsOnTaskId: string) => {
    // This endpoint doesn't exist yet in the backend
    console.warn('Task dependency creation endpoint not implemented in backend yet');
    return {
      id: 'temp-id',
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },
  
  delete: async (taskId: string, dependsOnTaskId: string) => {
    // This endpoint doesn't exist yet in the backend
    console.warn('Task dependency deletion endpoint not implemented in backend yet');
    return false;
  }
};

// Knowledge Base API
export const knowledgeApi = {
  getAll: async (): Promise<KnowledgeBase[]> => {
    return apiRequest<KnowledgeBase[]>('/knowledge/');
  },
  
  getById: async (id: string): Promise<KnowledgeBase | null> => {
    try {
      return await apiRequest<KnowledgeBase>(`/knowledge/${id}`);
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  create: async (kb: CreateKnowledgeBase): Promise<KnowledgeBase> => {
    return apiRequest<KnowledgeBase>('/knowledge/', {
      method: 'POST',
      body: JSON.stringify(kb),
    });
  },
  
  update: async (id: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | null> => {
    try {
      return await apiRequest<KnowledgeBase>(`/knowledge/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      // If 404, return null
      if ((error as any).status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest<{ message: string }>(`/knowledge/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      // If 404, return false (knowledge base item doesn't exist)
      if ((error as any).status === 404) {
        return false;
      }
      throw error;
    }
  },
  
  getWithReferences: async (): Promise<KnowledgeBaseWithReferences[]> => {
    // This endpoint doesn't exist yet in the backend
    // For now, return empty array
    console.warn('Knowledge base with references endpoint not implemented in backend yet');
    return [];
  },
  
  // Reference management
  addReference: async (knowledgeBaseId: string, entityType: 'project' | 'goal' | 'task', entityId: string) => {
    // This endpoint doesn't exist yet in the backend
    console.warn('Knowledge base reference creation endpoint not implemented in backend yet');
    return {
      id: 'temp-id',
      knowledge_base_id: knowledgeBaseId,
      entity_type: entityType,
      entity_id: entityId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },
  
  removeReference: async (knowledgeBaseId: string, entityType: 'project' | 'goal' | 'task', entityId: string) => {
    // This endpoint doesn't exist yet in the backend
    console.warn('Knowledge base reference deletion endpoint not implemented in backend yet');
    return false;
  }
};