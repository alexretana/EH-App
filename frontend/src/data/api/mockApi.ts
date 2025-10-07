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
import {
  mockProjects,
  mockGoals,
  mockTasks,
  mockKnowledgeBase,
  mockProjectDashboard,
  mockTaskDetails,
  mockGoalProgress,
  mockKnowledgeBaseWithReferences,
  mockTaskDependencies,
  mockKnowledgeBaseReferences
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to generate UUIDs
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to generate current timestamp
const now = (): string => {
  return new Date().toISOString();
};

// Project API
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    await delay();
    return [...mockProjects];
  },
  
  getById: async (id: string): Promise<Project | null> => {
    await delay();
    return mockProjects.find(p => p.id === id) || null;
  },
  
  create: async (project: CreateProject): Promise<Project> => {
    await delay();
    const newProject: Project = {
      ...project,
      id: generateId(),
      created_at: now(),
      updated_at: now()
    };
    mockProjects.push(newProject);
    return newProject;
  },
  
  update: async (id: string, updates: UpdateProject): Promise<Project | null> => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...updates,
      updated_at: now()
    };
    return mockProjects[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    // Remove associated goals and tasks
    const goalsToRemove = mockGoals.filter(g => g.project_id === id);
    goalsToRemove.forEach(goal => {
      // Remove tasks for this goal
      const tasksToRemove = mockTasks.filter(t => t.goal_id === goal.id);
      tasksToRemove.forEach(task => {
        const taskIndex = mockTasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) mockTasks.splice(taskIndex, 1);
      });
      
      // Remove the goal
      const goalIndex = mockGoals.findIndex(g => g.id === goal.id);
      if (goalIndex !== -1) mockGoals.splice(goalIndex, 1);
    });
    
    // Remove the project
    mockProjects.splice(index, 1);
    return true;
  },
  
  getDashboard: async (): Promise<ProjectDashboard[]> => {
    await delay();
    return [...mockProjectDashboard];
  }
};

// Goal API
export const goalApi = {
  getAll: async (): Promise<Goal[]> => {
    await delay();
    return [...mockGoals];
  },
  
  getByProjectId: async (projectId: string): Promise<Goal[]> => {
    await delay();
    return mockGoals.filter(g => g.project_id === projectId);
  },
  
  getById: async (id: string): Promise<Goal | null> => {
    await delay();
    return mockGoals.find(g => g.id === id) || null;
  },
  
  create: async (goal: CreateGoal): Promise<Goal> => {
    await delay();
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      created_at: now(),
      updated_at: now()
    };
    mockGoals.push(newGoal);
    return newGoal;
  },
  
  update: async (id: string, updates: UpdateGoal): Promise<Goal | null> => {
    await delay();
    const index = mockGoals.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    mockGoals[index] = {
      ...mockGoals[index],
      ...updates,
      updated_at: now()
    };
    return mockGoals[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockGoals.findIndex(g => g.id === id);
    if (index === -1) return false;
    
    // Remove associated tasks
    const tasksToRemove = mockTasks.filter(t => t.goal_id === id);
    tasksToRemove.forEach(task => {
      const taskIndex = mockTasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) mockTasks.splice(taskIndex, 1);
    });
    
    // Remove the goal
    mockGoals.splice(index, 1);
    return true;
  },
  
  getProgress: async (): Promise<GoalProgress[]> => {
    await delay();
    return [...mockGoalProgress];
  }
};

// Task API
export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    await delay();
    return [...mockTasks];
  },
  
  getByGoalId: async (goalId: string): Promise<Task[]> => {
    await delay();
    return mockTasks.filter(t => t.goal_id === goalId);
  },
  
  getById: async (id: string): Promise<Task | null> => {
    await delay();
    return mockTasks.find(t => t.id === id) || null;
  },
  
  create: async (task: CreateTask): Promise<Task> => {
    await delay();
    const newTask: Task = {
      ...task,
      id: generateId(),
      created_at: now(),
      updated_at: now()
    };
    mockTasks.push(newTask);
    return newTask;
  },
  
  update: async (id: string, updates: UpdateTask): Promise<Task | null> => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    // Auto-update date_completed based on status
    if (updates.status === 'Done' && !updates.date_completed) {
      updates.date_completed = new Date().toISOString().split('T')[0];
    } else if (updates.status !== 'Done') {
      updates.date_completed = undefined;
    }
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...updates,
      updated_at: now()
    };
    return mockTasks[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    // Remove task dependencies
    const depsToRemove = mockTaskDependencies.filter(
      dep => dep.task_id === id || dep.depends_on_task_id === id
    );
    depsToRemove.forEach(dep => {
      const depIndex = mockTaskDependencies.findIndex(d => d.id === dep.id);
      if (depIndex !== -1) mockTaskDependencies.splice(depIndex, 1);
    });
    
    // Remove the task
    mockTasks.splice(index, 1);
    return true;
  },
  
  getDetails: async (): Promise<TaskDetails[]> => {
    await delay();
    return [...mockTaskDetails];
  }
};

// Task Dependency API
export const taskDependencyApi = {
  getAll: async () => {
    await delay();
    return [...mockTaskDependencies];
  },
  
  create: async (taskId: string, dependsOnTaskId: string) => {
    await delay();
    
    // Check if dependency already exists
    const existing = mockTaskDependencies.find(
      dep => dep.task_id === taskId && dep.depends_on_task_id === dependsOnTaskId
    );
    if (existing) return existing;
    
    const newDep = {
      id: generateId(),
      task_id: taskId,
      depends_on_task_id: dependsOnTaskId,
      created_at: now(),
      updated_at: now()
    };
    mockTaskDependencies.push(newDep);
    return newDep;
  },
  
  delete: async (taskId: string, dependsOnTaskId: string) => {
    await delay();
    const index = mockTaskDependencies.findIndex(
      dep => dep.task_id === taskId && dep.depends_on_task_id === dependsOnTaskId
    );
    if (index === -1) return false;
    
    mockTaskDependencies.splice(index, 1);
    return true;
  }
};

// Knowledge Base API
export const knowledgeApi = {
  getAll: async (): Promise<KnowledgeBase[]> => {
    await delay();
    return [...mockKnowledgeBase];
  },
  
  getById: async (id: string): Promise<KnowledgeBase | null> => {
    await delay();
    return mockKnowledgeBase.find(kb => kb.id === id) || null;
  },
  
  create: async (kb: CreateKnowledgeBase): Promise<KnowledgeBase> => {
    await delay();
    const newKb: KnowledgeBase = {
      ...kb,
      id: generateId(),
      date_added: new Date().toISOString().split('T')[0],
      created_at: now(),
      updated_at: now()
    };
    mockKnowledgeBase.push(newKb);
    return newKb;
  },
  
  update: async (id: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | null> => {
    await delay();
    const index = mockKnowledgeBase.findIndex(kb => kb.id === id);
    if (index === -1) return null;
    
    mockKnowledgeBase[index] = {
      ...mockKnowledgeBase[index],
      ...updates,
      updated_at: now()
    };
    return mockKnowledgeBase[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockKnowledgeBase.findIndex(kb => kb.id === id);
    if (index === -1) return false;
    
    // Remove references
    const refsToRemove = mockKnowledgeBaseReferences.filter(ref => ref.knowledge_base_id === id);
    refsToRemove.forEach(ref => {
      const refIndex = mockKnowledgeBaseReferences.findIndex(r => r.id === ref.id);
      if (refIndex !== -1) mockKnowledgeBaseReferences.splice(refIndex, 1);
    });
    
    // Remove the knowledge base item
    mockKnowledgeBase.splice(index, 1);
    return true;
  },
  
  getWithReferences: async (): Promise<KnowledgeBaseWithReferences[]> => {
    await delay();
    return [...mockKnowledgeBaseWithReferences];
  },
  
  // Reference management
  addReference: async (knowledgeBaseId: string, entityType: 'project' | 'goal' | 'task', entityId: string) => {
    await delay();
    
    // Check if reference already exists
    const existing = mockKnowledgeBaseReferences.find(
      ref => ref.knowledge_base_id === knowledgeBaseId && 
             ref.entity_type === entityType && 
             ref.entity_id === entityId
    );
    if (existing) return existing;
    
    const newRef = {
      id: generateId(),
      knowledge_base_id: knowledgeBaseId,
      entity_type: entityType,
      entity_id: entityId,
      created_at: now(),
      updated_at: now()
    };
    mockKnowledgeBaseReferences.push(newRef);
    return newRef;
  },
  
  removeReference: async (knowledgeBaseId: string, entityType: 'project' | 'goal' | 'task', entityId: string) => {
    await delay();
    const index = mockKnowledgeBaseReferences.findIndex(
      ref => ref.knowledge_base_id === knowledgeBaseId && 
             ref.entity_type === entityType && 
             ref.entity_id === entityId
    );
    if (index === -1) return false;
    
    mockKnowledgeBaseReferences.splice(index, 1);
    return true;
  }
};