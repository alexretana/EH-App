import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Goal, Task, CreateGoal, UpdateGoal, CreateTask, UpdateTask } from '@/types/mockData';

interface AppContextType {
  // Client-side state only
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  expandedProjects: Set<string>;
  setExpandedProjects: (projects: Set<string>) => void;
  expandedGoals: Set<string>;
  setExpandedGoals: (goals: Set<string>) => void;
  
  // UI state
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (open: boolean) => void;
  isGoalModalOpen: boolean;
  setIsGoalModalOpen: (open: boolean) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  
  // Current editing items
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  currentGoal: Goal | null;
  setCurrentGoal: (goal: Goal | null) => void;
  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
  
  // Selections
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedGoalId: string | null;
  setSelectedGoalId: (id: string | null) => void;
  
  // Temporary methods for goals and tasks (until fully migrated)
  getGoalsByProjectId: (projectId: string) => Goal[];
  getTasksByGoalId: (goalId: string) => Task[];
  deleteGoal: (id: string) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  createGoal: (goal: CreateGoal) => Promise<Goal>;
  updateGoal: (id: string, updates: UpdateGoal) => Promise<Goal | null>;
  createTask: (task: CreateTask) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTask) => Promise<Task | null>;
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
  // Client-side state only
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  
  // UI state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Current editing items
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  // Selections
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Temporary storage for goals and tasks (until fully migrated to React Query)
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Temporary methods for goals and tasks
  const getGoalsByProjectId = (projectId: string): Goal[] => {
    return goals.filter(goal => goal.project_id === projectId);
  };
  
  const getTasksByGoalId = (goalId: string): Task[] => {
    return tasks.filter(task => task.goal_id === goalId);
  };
  
  const deleteGoal = async (id: string): Promise<boolean> => {
    // This is a temporary implementation
    setGoals(prev => prev.filter(g => g.id !== id));
    setTasks(prev => prev.filter(t => t.goal_id !== id));
    return true;
  };
  
  const deleteTask = async (id: string): Promise<boolean> => {
    // This is a temporary implementation
    setTasks(prev => prev.filter(t => t.id !== id));
    return true;
  };
  
  const createGoal = async (goal: CreateGoal): Promise<Goal> => {
    // This is a temporary implementation
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Goal;
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };
  
  const updateGoal = async (id: string, updates: UpdateGoal): Promise<Goal | null> => {
    // This is a temporary implementation
    const updatedGoal = goals.find(g => g.id === id);
    if (updatedGoal) {
      const newGoal = { ...updatedGoal, ...updates, updated_at: new Date().toISOString() };
      setGoals(prev => prev.map(g => g.id === id ? newGoal : g));
      return newGoal;
    }
    return null;
  };
  
  const createTask = async (task: CreateTask): Promise<Task> => {
    // This is a temporary implementation
    const newTask = {
      ...task,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Task;
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };
  
  const updateTask = async (id: string, updates: UpdateTask): Promise<Task | null> => {
    // This is a temporary implementation
    const updatedTask = tasks.find(t => t.id === id);
    if (updatedTask) {
      const newTask = { ...updatedTask, ...updates, updated_at: new Date().toISOString() };
      setTasks(prev => prev.map(t => t.id === id ? newTask : t));
      return newTask;
    }
    return null;
  };
  
  const value: AppContextType = {
    // Client-side state
    activeProjectId,
    setActiveProjectId,
    expandedProjects,
    setExpandedProjects,
    expandedGoals,
    setExpandedGoals,
    
    // UI state
    isProjectModalOpen,
    setIsProjectModalOpen,
    isGoalModalOpen,
    setIsGoalModalOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    
    // Current editing items
    currentProject,
    setCurrentProject,
    currentGoal,
    setCurrentGoal,
    currentTask,
    setCurrentTask,
    
    // Selections
    selectedProjectId,
    setSelectedProjectId,
    selectedGoalId,
    setSelectedGoalId,
    
    // Temporary methods
    getGoalsByProjectId,
    getTasksByGoalId,
    deleteGoal,
    deleteTask,
    createGoal,
    updateGoal,
    createTask,
    updateTask,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};