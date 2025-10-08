import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  Project, 
  Goal, 
  Task, 
  KnowledgeBase,
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
  projectApi,
  goalApi,
  taskApi,
  knowledgeApi
} from '@/data/api/realApi';

interface AppContextType {
  // Data
  projects: Project[];
  goals: Goal[];
  tasks: Task[];
  knowledgeBase: KnowledgeBase[];
  
  // Loading states
  isLoading: boolean;
  
  
  // Current active project
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  
  // Project operations
  createProject: (project: CreateProject) => Promise<Project>;
  updateProject: (id: string, updates: UpdateProject) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
  
  // Goal operations
  createGoal: (goal: CreateGoal) => Promise<Goal>;
  updateGoal: (id: string, updates: UpdateGoal) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  refreshGoals: () => Promise<void>;
  getGoalsByProjectId: (projectId: string) => Goal[];
  
  // Task operations
  createTask: (task: CreateTask) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTask) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
  getTasksByGoalId: (goalId: string) => Task[];
  
  // Knowledge base operations
  createKnowledgeBase: (kb: CreateKnowledgeBase) => Promise<KnowledgeBase>;
  updateKnowledgeBase: (id: string, updates: UpdateKnowledgeBase) => Promise<KnowledgeBase | null>;
  deleteKnowledgeBase: (id: string) => Promise<boolean>;
  refreshKnowledgeBase: () => Promise<void>;
  
  // Utility functions
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [knowledgeApiEnabled, setKnowledgeApiEnabled] = useState(true);
  
  // Error handling
  const handleError = (err: unknown, message: string) => {
    console.error(message, err);
    
    // Extract detailed error information for developers
    let errorMessage = message;
    if (err instanceof Error) {
      errorMessage = `${message}: ${err.message}`;
      // Log additional error details if available
      if ((err as any).details) {
        console.error('Error details:', (err as any).details);
      }
    }
    
    // Show error toast using sonner
    toast.error(errorMessage);
    setIsLoading(false);
  };
  
  // Refresh functions
  const refreshProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      handleError(err, 'Failed to load projects');
    }
  };
  
  const refreshGoals = async () => {
    try {
      const data = await goalApi.getAll();
      setGoals(data);
    } catch (err) {
      handleError(err, 'Failed to load goals');
    }
  };
  
  const refreshTasks = async () => {
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      handleError(err, 'Failed to load tasks');
    }
  };
  
  const refreshKnowledgeBase = async () => {
    // Skip if knowledge API is disabled
    if (!knowledgeApiEnabled) {
      return;
    }
    
    try {
      const data = await knowledgeApi.getAll();
      setKnowledgeBase(data);
    } catch (err) {
      // If knowledge API fails, disable it and continue with other data
      console.warn('Knowledge API is currently unavailable. Disabling knowledge base features.');
      setKnowledgeApiEnabled(false);
      // Don't show an error to the user for this specific failure
    }
  };
  
  const refreshAllData = async () => {
    setIsLoading(true);
    
    try {
      await Promise.all([
        refreshProjects(),
        refreshGoals(),
        refreshTasks(),
        refreshKnowledgeBase()
      ]);
    } catch (err) {
      handleError(err, 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize data
  useEffect(() => {
    refreshAllData();
  }, []);
  
  // Project operations
  const createProject = async (project: CreateProject): Promise<Project> => {
    try {
      const newProject = await projectApi.create(project);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      handleError(err, 'Failed to create project');
      throw err;
    }
  };
  
  const updateProject = async (id: string, updates: UpdateProject): Promise<Project | null> => {
    try {
      const updatedProject = await projectApi.update(id, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      }
      return updatedProject;
    } catch (err) {
      handleError(err, 'Failed to update project');
      throw err;
    }
  };
  
  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      const success = await projectApi.delete(id);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        // Also remove associated goals and tasks
        setGoals(prev => prev.filter(g => g.project_id !== id));
        const projectGoalIds = goals.filter(g => g.project_id === id).map(g => g.id);
        setTasks(prev => prev.filter(t => !projectGoalIds.includes(t.goal_id)));
        
        // Clear active project if it was deleted
        if (activeProjectId === id) {
          setActiveProjectId(null);
        }
      }
      return success;
    } catch (err) {
      handleError(err, 'Failed to delete project');
      throw err;
    }
  };
  
  // Goal operations
  const createGoal = async (goal: CreateGoal): Promise<Goal> => {
    try {
      const newGoal = await goalApi.create(goal);
      setGoals(prev => [...prev, newGoal]);
      return newGoal;
    } catch (err) {
      handleError(err, 'Failed to create goal');
      throw err;
    }
  };
  
  const updateGoal = async (id: string, updates: UpdateGoal): Promise<Goal | null> => {
    try {
      const updatedGoal = await goalApi.update(id, updates);
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      }
      return updatedGoal;
    } catch (err) {
      handleError(err, 'Failed to update goal');
      throw err;
    }
  };
  
  const deleteGoal = async (id: string): Promise<boolean> => {
    try {
      const success = await goalApi.delete(id);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== id));
        // Also remove associated tasks
        setTasks(prev => prev.filter(t => t.goal_id !== id));
      }
      return success;
    } catch (err) {
      handleError(err, 'Failed to delete goal');
      throw err;
    }
  };
  
  const getGoalsByProjectId = (projectId: string): Goal[] => {
    return goals.filter(goal => goal.project_id === projectId);
  };
  
  // Task operations
  const createTask = async (task: CreateTask): Promise<Task> => {
    try {
      const newTask = await taskApi.create(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      handleError(err, 'Failed to create task');
      throw err;
    }
  };
  
  const updateTask = async (id: string, updates: UpdateTask): Promise<Task | null> => {
    try {
      const updatedTask = await taskApi.update(id, updates);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      }
      return updatedTask;
    } catch (err) {
      handleError(err, 'Failed to update task');
      throw err;
    }
  };
  
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const success = await taskApi.delete(id);
      if (success) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
      return success;
    } catch (err) {
      handleError(err, 'Failed to delete task');
      throw err;
    }
  };
  
  const getTasksByGoalId = (goalId: string): Task[] => {
    return tasks.filter(task => task.goal_id === goalId);
  };
  
  // Knowledge base operations
  const createKnowledgeBase = async (kb: CreateKnowledgeBase): Promise<KnowledgeBase> => {
    if (!knowledgeApiEnabled) {
      throw new Error('Knowledge API is currently unavailable');
    }
    
    try {
      const newKb = await knowledgeApi.create(kb);
      setKnowledgeBase(prev => [...prev, newKb]);
      return newKb;
    } catch (err) {
      handleError(err, 'Failed to create knowledge base document');
      throw err;
    }
  };
  
  const updateKnowledgeBase = async (id: string, updates: UpdateKnowledgeBase): Promise<KnowledgeBase | null> => {
    if (!knowledgeApiEnabled) {
      throw new Error('Knowledge API is currently unavailable');
    }
    
    try {
      const updatedKb = await knowledgeApi.update(id, updates);
      if (updatedKb) {
        setKnowledgeBase(prev => prev.map(kb => kb.id === id ? updatedKb : kb));
      }
      return updatedKb;
    } catch (err) {
      handleError(err, 'Failed to update knowledge base document');
      throw err;
    }
  };
  
  const deleteKnowledgeBase = async (id: string): Promise<boolean> => {
    if (!knowledgeApiEnabled) {
      throw new Error('Knowledge API is currently unavailable');
    }
    
    try {
      const success = await knowledgeApi.delete(id);
      if (success) {
        setKnowledgeBase(prev => prev.filter(kb => kb.id !== id));
      }
      return success;
    } catch (err) {
      handleError(err, 'Failed to delete knowledge base document');
      throw err;
    }
  };
  
  const value: AppContextType = {
    // Data
    projects,
    goals,
    tasks,
    knowledgeBase,
    
    // States
    isLoading,
    activeProjectId,
    
    // Actions
    setActiveProjectId,
    
    // Project operations
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
    
    // Goal operations
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
    getGoalsByProjectId,
    
    // Task operations
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
    getTasksByGoalId,
    
    // Knowledge base operations
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    refreshKnowledgeBase,
    
    // Utility functions
    refreshAllData
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};