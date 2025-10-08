# Frontend Mock Data Structure

This document outlines the mock data structure that will be used for the Event Horizon frontend application, matching the PostgreSQL schema defined in the design document.

## TypeScript Type Definitions

```typescript
// Base entity interface
interface BaseEntity {
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
```

## Mock Data Implementation

```typescript
// src/data/mockData.ts
import { 
  Project, 
  Goal, 
  Task, 
  TaskDependency, 
  KnowledgeBase, 
  KnowledgeBaseReference,
  ProjectDashboard,
  TaskDetails,
  GoalProgress,
  KnowledgeBaseWithReferences
} from '@/types/mockData';

// Helper function to generate UUIDs
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to generate dates
const generateDate = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: generateId(),
    name: 'Event Horizon Database Migration',
    description: 'Migrate from Notion to PostgreSQL for better performance and n8n integration',
    status: 'Active',
    start_date: generateDate(30),
    end_date: generateDate(-30),
    is_active: true,
    is_validated: true,
    time_estimate_months: 3,
    time_estimation_validated: true,
    expansion_horizon: '2 Weeks',
    milestone_granularity: 'Monthly',
    created_at: generateDate(35),
    updated_at: generateDate(5)
  },
  {
    id: generateId(),
    name: 'n8n Workflow Optimization',
    description: 'Optimize existing n8n workflows for better performance',
    status: 'Planning Phase',
    is_active: false,
    is_validated: false,
    time_estimate_months: 2,
    time_estimation_validated: false,
    expansion_horizon: '3 Weeks',
    milestone_granularity: 'Quarterly',
    created_at: generateDate(20),
    updated_at: generateDate(10)
  },
  {
    id: generateId(),
    name: 'API Documentation Update',
    description: 'Update all API documentation to reflect new database schema',
    status: 'Planning Phase',
    is_active: false,
    is_validated: false,
    time_estimate_months: 1,
    time_estimation_validated: false,
    expansion_horizon: '1 Week',
    milestone_granularity: 'Monthly&Quarterly',
    created_at: generateDate(15),
    updated_at: generateDate(8)
  }
];

// Mock Goals
export const mockGoals: Goal[] = [
  // Goals for Event Horizon Database Migration
  {
    id: generateId(),
    name: 'Database Schema Implementation',
    description: 'Design and implement PostgreSQL schema',
    status: 'Active',
    scope: 'Monthly',
    success_criteria: 'Schema supports all Notion functionality with better performance',
    due_date: generateDate(-15),
    project_id: mockProjects[0].id,
    created_at: generateDate(28),
    updated_at: generateDate(7)
  },
  {
    id: generateId(),
    name: 'Data Migration Script',
    description: 'Create scripts to migrate data from Notion to PostgreSQL',
    status: 'Not started',
    scope: 'Monthly',
    success_criteria: 'All data successfully migrated without loss',
    due_date: generateDate(-10),
    project_id: mockProjects[0].id,
    created_at: generateDate(25),
    updated_at: generateDate(5)
  },
  {
    id: generateId(),
    name: 'Week 1: Schema Design',
    description: 'Complete database schema design and get approval',
    status: 'Done',
    scope: 'Weekly-Milestone',
    due_date: generateDate(20),
    project_id: mockProjects[0].id,
    parent_goal_id: mockGoals[0].id,
    created_at: generateDate(28),
    updated_at: generateDate(20)
  },
  {
    id: generateId(),
    name: 'Week 2: Schema Implementation',
    description: 'Implement the approved database schema',
    status: 'Active',
    scope: 'Weekly-Milestone',
    due_date: generateDate(-13),
    project_id: mockProjects[0].id,
    parent_goal_id: mockGoals[0].id,
    created_at: generateDate(21),
    updated_at: generateDate(3)
  },
  // Goals for n8n Workflow Optimization
  {
    id: generateId(),
    name: 'Performance Analysis',
    description: 'Analyze current n8n workflow performance bottlenecks',
    status: 'Not started',
    scope: 'Quarterly',
    success_criteria: 'Identify top 3 performance bottlenecks',
    due_date: generateDate(-20),
    project_id: mockProjects[1].id,
    created_at: generateDate(18),
    updated_at: generateDate(2)
  }
];

// Mock Tasks
export const mockTasks: Task[] = [
  // Tasks for Week 1: Schema Design
  {
    id: generateId(),
    name: 'Create DDL scripts',
    description: 'Write complete DDL for all tables, indexes, and constraints',
    status: 'Done',
    task_type: 'Develop',
    priority: 'High',
    effort_level: 'Medium',
    time_estimate_minutes: 240,
    due_date: generateDate(22),
    date_completed: generateDate(21),
    goal_id: mockGoals[2].id,
    created_at: generateDate(28),
    updated_at: generateDate(21)
  },
  {
    id: generateId(),
    name: 'Test database connection',
    description: 'Verify n8n can connect to PostgreSQL',
    status: 'Active',
    task_type: 'Debug',
    priority: 'High',
    effort_level: 'Small',
    time_estimate_minutes: 60,
    due_date: generateDate(-19),
    goal_id: mockGoals[2].id,
    created_at: generateDate(25),
    updated_at: generateDate(1)
  },
  // Tasks for Week 2: Schema Implementation
  {
    id: generateId(),
    name: 'Implement core tables',
    description: 'Create the main database tables based on approved schema',
    status: 'Active',
    task_type: 'Develop',
    priority: 'High',
    effort_level: 'Large',
    time_estimate_minutes: 300,
    due_date: generateDate(-14),
    goal_id: mockGoals[3].id,
    created_at: generateDate(20),
    updated_at: generateDate(2)
  },
  {
    id: generateId(),
    name: 'Create indexes',
    description: 'Add performance indexes to optimize query performance',
    status: 'Not started',
    task_type: 'Develop',
    priority: 'Medium',
    effort_level: 'Medium',
    time_estimate_minutes: 180,
    due_date: generateDate(-12),
    goal_id: mockGoals[3].id,
    created_at: generateDate(19),
    updated_at: generateDate(1)
  }
];

// Mock Task Dependencies
export const mockTaskDependencies: TaskDependency[] = [
  {
    id: generateId(),
    task_id: mockTasks[3].id, // Create indexes
    depends_on_task_id: mockTasks[2].id, // Implement core tables
    created_at: generateDate(19)
  }
];

// Mock Knowledge Base
export const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: generateId(),
    document_name: 'PostgreSQL Best Practices',
    content: '# PostgreSQL Best Practices\n\n## Indexing Strategies\n- Create indexes on frequently queried columns\n- Use composite indexes for multi-column queries\n- Monitor index usage and remove unused indexes\n\n## Performance Optimization\n- Use EXPLAIN ANALYZE to analyze query performance\n- Implement connection pooling\n- Regularly update statistics with ANALYZE',
    ai_summary: 'Comprehensive guide on PostgreSQL optimization including indexing strategies and performance tuning techniques.',
    date_added: generateDate(10),
    created_at: generateDate(10),
    updated_at: generateDate(5)
  },
  {
    id: generateId(),
    document_name: 'n8n Workflow Design Patterns',
    content: '# n8n Workflow Design Patterns\n\n## Error Handling\n- Implement retry mechanisms for external API calls\n- Use error handling nodes to manage failures\n- Set up notifications for critical errors\n\n## Performance Optimization\n- Batch operations when possible\n- Use parallel execution for independent tasks\n- Implement caching for frequently accessed data',
    ai_summary: 'Collection of design patterns and best practices for building efficient n8n workflows.',
    date_added: generateDate(7),
    created_at: generateDate(7),
    updated_at: generateDate(3)
  }
];

// Mock Knowledge Base References
export const mockKnowledgeBaseReferences: KnowledgeBaseReference[] = [
  {
    id: generateId(),
    knowledge_base_id: mockKnowledgeBase[0].id,
    entity_type: 'project',
    entity_id: mockProjects[0].id,
    created_at: generateDate(10)
  },
  {
    id: generateId(),
    knowledge_base_id: mockKnowledgeBase[1].id,
    entity_type: 'project',
    entity_id: mockProjects[1].id,
    created_at: generateDate(7)
  }
];

// Enhanced view data (computed from base entities)
export const mockProjectDashboard: ProjectDashboard[] = mockProjects.map(project => {
  const projectGoals = mockGoals.filter(goal => goal.project_id === project.id);
  const projectTasks = mockTasks.filter(task => {
    const taskGoal = mockGoals.find(goal => goal.id === task.goal_id);
    return taskGoal && taskGoal.project_id === project.id;
  });
  
  return {
    ...project,
    total_goals: projectGoals.length,
    completed_goals: projectGoals.filter(goal => goal.status === 'Done').length,
    total_tasks: projectTasks.length,
    completed_tasks: projectTasks.filter(task => task.status === 'Done').length,
    overdue_tasks: projectTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'
    ).length,
    task_progress_percentage: projectTasks.length > 0 
      ? Math.round((projectTasks.filter(task => task.status === 'Done').length / projectTasks.length) * 100)
      : 0,
    goal_progress_percentage: projectGoals.length > 0
      ? Math.round((projectGoals.filter(goal => goal.status === 'Done').length / projectGoals.length) * 100)
      : 0,
    total_estimated_minutes: projectTasks.reduce((sum, task) => sum + task.time_estimate_minutes, 0),
    completed_estimated_minutes: projectTasks
      .filter(task => task.status === 'Done')
      .reduce((sum, task) => sum + task.time_estimate_minutes, 0)
  };
});

export const mockTaskDetails: TaskDetails[] = mockTasks.map(task => {
  const goal = mockGoals.find(g => g.id === task.goal_id);
  const project = mockProjects.find(p => p.id && goal && p.id === goal.project_id);
  const dependencies = mockTaskDependencies
    .filter(dep => dep.task_id === task.id)
    .map(dep => mockTasks.find(t => t.id === dep.depends_on_task_id)?.name || '')
    .filter(Boolean);
  const dependencyIds = mockTaskDependencies
    .filter(dep => dep.task_id === task.id)
    .map(dep => dep.depends_on_task_id);
  const blockedTasks = mockTaskDependencies
    .filter(dep => dep.depends_on_task_id === task.id)
    .map(dep => mockTasks.find(t => t.id === dep.task_id)?.name || '')
    .filter(Boolean);
  const blockedTaskIds = mockTaskDependencies
    .filter(dep => dep.depends_on_task_id === task.id)
    .map(dep => dep.task_id);
  
  return {
    ...task,
    project_name: project?.name || '',
    project_id: project?.id || '',
    goal_name: goal?.name || '',
    goal_id: goal?.id || '',
    dependencies,
    dependency_ids: dependencyIds,
    blocks_tasks: blockedTasks,
    blocked_task_ids: blockedTaskIds,
    is_overdue: task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'Done' : false,
    days_until_due: task.due_date ? Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
  };
});

export const mockGoalProgress: GoalProgress[] = mockGoals.map(goal => {
  const project = mockProjects.find(p => p.id === goal.project_id);
  const parentGoal = mockGoals.find(g => g.id === goal.parent_goal_id);
  const goalTasks = mockTasks.filter(task => task.goal_id === goal.id);
  
  return {
    ...goal,
    project_name: project?.name || '',
    project_id: project?.id || '',
    parent_goal_name: parentGoal?.name,
    parent_goal_id: parentGoal?.id,
    total_tasks: goalTasks.length,
    completed_tasks: goalTasks.filter(task => task.status === 'Done').length,
    overdue_tasks: goalTasks.filter(task => 
      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'
    ).length,
    progress_percentage: goalTasks.length > 0
      ? Math.round((goalTasks.filter(task => task.status === 'Done').length / goalTasks.length) * 100)
      : 0,
    is_overdue: goal.due_date ? new Date(goal.due_date) < new Date() && goal.status !== 'Done' : false,
    days_until_due: goal.due_date ? Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
  };
});

export const mockKnowledgeBaseWithReferences: KnowledgeBaseWithReferences[] = mockKnowledgeBase.map(kb => {
  const references = mockKnowledgeBaseReferences.filter(ref => ref.knowledge_base_id === kb.id);
  const relatedEntities: string[] = [];
  const relatedEntityIds: string[] = [];
  const entityTypes: string[] = [];
  
  references.forEach(ref => {
    if (ref.entity_type === 'project') {
      const project = mockProjects.find(p => p.id === ref.entity_id);
      if (project) {
        relatedEntities.push(project.name);
        relatedEntityIds.push(project.id);
        entityTypes.push('project');
      }
    } else if (ref.entity_type === 'goal') {
      const goal = mockGoals.find(g => g.id === ref.entity_id);
      if (goal) {
        relatedEntities.push(goal.name);
        relatedEntityIds.push(goal.id);
        entityTypes.push('goal');
      }
    } else if (ref.entity_type === 'task') {
      const task = mockTasks.find(t => t.id === ref.entity_id);
      if (task) {
        relatedEntities.push(task.name);
        relatedEntityIds.push(task.id);
        entityTypes.push('task');
      }
    }
  });
  
  return {
    ...kb,
    related_entities: relatedEntities,
    related_entity_ids: relatedEntityIds,
    entity_types: entityTypes
  };
});
```

## Mock API Functions

```typescript
// src/data/api/mockApi.ts
import { 
  Project, 
  Goal, 
  Task, 
  KnowledgeBase,
  ProjectDashboard,
  TaskDetails,
  GoalProgress,
  KnowledgeBaseWithReferences
} from '@/types/mockData';
import {
  mockProjects,
  mockGoals,
  mockTasks,
  mockKnowledgeBase,
  mockProjectDashboard,
  mockTaskDetails,
  mockGoalProgress,
  mockKnowledgeBaseWithReferences
} from '@/data/mockData';

// Simulate API delay
const delay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  
  create: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    await delay();
    const newProject: Project = {
      ...project,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProjects.push(newProject);
    return newProject;
  },
  
  update: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockProjects[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockProjects.findIndex(p => p.id === id);
    if (index === -1) return false;
    
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
  
  create: async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> => {
    await delay();
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockGoals.push(newGoal);
    return newGoal;
  },
  
  update: async (id: string, updates: Partial<Goal>): Promise<Goal | null> => {
    await delay();
    const index = mockGoals.findIndex(g => g.id === id);
    if (index === -1) return null;
    
    mockGoals[index] = {
      ...mockGoals[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockGoals[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockGoals.findIndex(g => g.id === id);
    if (index === -1) return false;
    
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
  
  create: async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    await delay();
    const newTask: Task = {
      ...task,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockTasks.push(newTask);
    return newTask;
  },
  
  update: async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    mockTasks[index] = {
      ...mockTasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockTasks[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockTasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    mockTasks.splice(index, 1);
    return true;
  },
  
  getDetails: async (): Promise<TaskDetails[]> => {
    await delay();
    return [...mockTaskDetails];
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
  
  create: async (kb: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeBase> => {
    await delay();
    const newKb: KnowledgeBase = {
      ...kb,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockKnowledgeBase.push(newKb);
    return newKb;
  },
  
  update: async (id: string, updates: Partial<KnowledgeBase>): Promise<KnowledgeBase | null> => {
    await delay();
    const index = mockKnowledgeBase.findIndex(kb => kb.id === id);
    if (index === -1) return null;
    
    mockKnowledgeBase[index] = {
      ...mockKnowledgeBase[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return mockKnowledgeBase[index];
  },
  
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const index = mockKnowledgeBase.findIndex(kb => kb.id === id);
    if (index === -1) return false;
    
    mockKnowledgeBase.splice(index, 1);
    return true;
  },
  
  getWithReferences: async (): Promise<KnowledgeBaseWithReferences[]> => {
    await delay();
    return [...mockKnowledgeBaseWithReferences];
  }
};
```

This mock data structure provides a comprehensive foundation for the frontend application, matching the PostgreSQL schema while providing realistic data for development and testing.