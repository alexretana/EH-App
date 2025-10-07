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

// Helper function to generate date-time strings
const generateDateTime = (daysAgo: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Generate IDs first to avoid reference issues
const projectId1 = generateId();
const projectId2 = generateId();
const projectId3 = generateId();

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: projectId1,
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
    created_at: generateDateTime(35),
    updated_at: generateDateTime(5)
  },
  {
    id: projectId2,
    name: 'n8n Workflow Optimization',
    description: 'Optimize existing n8n workflows for better performance',
    status: 'Planning Phase',
    is_active: false,
    is_validated: false,
    time_estimate_months: 2,
    time_estimation_validated: false,
    expansion_horizon: '3 Weeks',
    milestone_granularity: 'Quarterly',
    created_at: generateDateTime(20),
    updated_at: generateDateTime(10)
  },
  {
    id: projectId3,
    name: 'API Documentation Update',
    description: 'Update all API documentation to reflect new database schema',
    status: 'Planning Phase',
    is_active: false,
    is_validated: false,
    time_estimate_months: 1,
    time_estimation_validated: false,
    expansion_horizon: '1 Week',
    milestone_granularity: 'Monthly&Quarterly',
    created_at: generateDateTime(15),
    updated_at: generateDateTime(8)
  }
];

// Generate goal IDs
const goalId1 = generateId();
const goalId2 = generateId();
const goalId3 = generateId();
const goalId4 = generateId();
const goalId5 = generateId();

// Mock Goals
export const mockGoals: Goal[] = [
  // Goals for Event Horizon Database Migration
  {
    id: goalId1,
    name: 'Database Schema Implementation',
    description: 'Design and implement PostgreSQL schema',
    status: 'Active',
    scope: 'Monthly',
    success_criteria: 'Schema supports all Notion functionality with better performance',
    due_date: generateDate(-15),
    project_id: projectId1,
    created_at: generateDateTime(28),
    updated_at: generateDateTime(7)
  },
  {
    id: goalId2,
    name: 'Data Migration Script',
    description: 'Create scripts to migrate data from Notion to PostgreSQL',
    status: 'Not started',
    scope: 'Monthly',
    success_criteria: 'All data successfully migrated without loss',
    due_date: generateDate(-10),
    project_id: projectId1,
    created_at: generateDateTime(25),
    updated_at: generateDateTime(5)
  },
  {
    id: goalId3,
    name: 'Week 1: Schema Design',
    description: 'Complete database schema design and get approval',
    status: 'Done',
    scope: 'Weekly-Milestone',
    due_date: generateDate(20),
    project_id: projectId1,
    parent_goal_id: goalId1,
    created_at: generateDateTime(28),
    updated_at: generateDateTime(20)
  },
  {
    id: goalId4,
    name: 'Week 2: Schema Implementation',
    description: 'Implement the approved database schema',
    status: 'Active',
    scope: 'Weekly-Milestone',
    due_date: generateDate(-13),
    project_id: projectId1,
    parent_goal_id: goalId1,
    created_at: generateDateTime(21),
    updated_at: generateDateTime(3)
  },
  // Goals for n8n Workflow Optimization
  {
    id: goalId5,
    name: 'Performance Analysis',
    description: 'Analyze current n8n workflow performance bottlenecks',
    status: 'Not started',
    scope: 'Quarterly',
    success_criteria: 'Identify top 3 performance bottlenecks',
    due_date: generateDate(-20),
    project_id: projectId2,
    created_at: generateDateTime(18),
    updated_at: generateDateTime(2)
  }
];

// Generate task IDs
const taskId1 = generateId();
const taskId2 = generateId();
const taskId3 = generateId();
const taskId4 = generateId();
const taskId5 = generateId();

// Mock Tasks
export const mockTasks: Task[] = [
  // Tasks for Week 1: Schema Design
  {
    id: taskId1,
    name: 'Create DDL scripts',
    description: 'Write complete DDL for all tables, indexes, and constraints',
    status: 'Done',
    task_type: 'Develop',
    priority: 'High',
    effort_level: 'Medium',
    time_estimate_minutes: 240,
    due_date: generateDate(22),
    date_completed: generateDate(21),
    goal_id: goalId3,
    created_at: generateDateTime(28),
    updated_at: generateDateTime(21)
  },
  {
    id: taskId2,
    name: 'Test database connection',
    description: 'Verify n8n can connect to PostgreSQL',
    status: 'Active',
    task_type: 'Debug',
    priority: 'High',
    effort_level: 'Small',
    time_estimate_minutes: 60,
    due_date: generateDate(-19),
    goal_id: goalId3,
    created_at: generateDateTime(25),
    updated_at: generateDateTime(1)
  },
  // Tasks for Week 2: Schema Implementation
  {
    id: taskId3,
    name: 'Implement core tables',
    description: 'Create the main database tables based on approved schema',
    status: 'Active',
    task_type: 'Develop',
    priority: 'High',
    effort_level: 'Large',
    time_estimate_minutes: 300,
    due_date: generateDate(-14),
    goal_id: goalId4,
    created_at: generateDateTime(20),
    updated_at: generateDateTime(2)
  },
  {
    id: taskId4,
    name: 'Create indexes',
    description: 'Add performance indexes to optimize query performance',
    status: 'Not started',
    task_type: 'Develop',
    priority: 'Medium',
    effort_level: 'Medium',
    time_estimate_minutes: 180,
    due_date: generateDate(-12),
    goal_id: goalId4,
    created_at: generateDateTime(19),
    updated_at: generateDateTime(1)
  },
  {
    id: taskId5,
    name: 'Create triggers',
    description: 'Implement database triggers for data validation and automation',
    status: 'Not started',
    task_type: 'Develop',
    priority: 'Medium',
    effort_level: 'Medium',
    time_estimate_minutes: 120,
    due_date: generateDate(-11),
    goal_id: goalId4,
    created_at: generateDateTime(18),
    updated_at: generateDateTime(1)
  }
];

// Mock Task Dependencies
export const mockTaskDependencies: TaskDependency[] = [
  {
    id: generateId(),
    task_id: taskId4, // Create indexes
    depends_on_task_id: taskId3, // Implement core tables
    created_at: generateDateTime(19),
    updated_at: generateDateTime(19)
  },
  {
    id: generateId(),
    task_id: taskId5, // Create triggers
    depends_on_task_id: taskId3, // Implement core tables
    created_at: generateDateTime(18),
    updated_at: generateDateTime(18)
  }
];

// Generate knowledge base IDs
const kbId1 = generateId();
const kbId2 = generateId();
const kbId3 = generateId();

// Mock Knowledge Base
export const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: kbId1,
    document_name: 'PostgreSQL Best Practices',
    content: '# PostgreSQL Best Practices\n\n## Indexing Strategies\n- Create indexes on frequently queried columns\n- Use composite indexes for multi-column queries\n- Monitor index usage and remove unused indexes\n\n## Performance Optimization\n- Use EXPLAIN ANALYZE to analyze query performance\n- Implement connection pooling\n- Regularly update statistics with ANALYZE',
    ai_summary: 'Comprehensive guide on PostgreSQL optimization including indexing strategies and performance tuning techniques.',
    date_added: generateDate(10),
    created_at: generateDateTime(10),
    updated_at: generateDateTime(5)
  },
  {
    id: kbId2,
    document_name: 'n8n Workflow Design Patterns',
    content: '# n8n Workflow Design Patterns\n\n## Error Handling\n- Implement retry mechanisms for external API calls\n- Use error handling nodes to manage failures\n- Set up notifications for critical errors\n\n## Performance Optimization\n- Batch operations when possible\n- Use parallel execution for independent tasks\n- Implement caching for frequently accessed data',
    ai_summary: 'Collection of design patterns and best practices for building efficient n8n workflows.',
    date_added: generateDate(7),
    created_at: generateDateTime(7),
    updated_at: generateDateTime(3)
  },
  {
    id: kbId3,
    document_name: 'Database Migration Guide',
    content: '# Database Migration Guide\n\n## Planning Phase\n- Inventory all data sources\n- Map data relationships\n- Plan migration strategy\n\n## Execution Phase\n- Create backup of all data\n- Run migration in phases\n- Validate data integrity\n\n## Post-Migration\n- Update application connections\n- Monitor performance\n- Document new schema',
    ai_summary: 'Step-by-step guide for planning and executing database migrations with minimal downtime.',
    date_added: generateDate(5),
    created_at: generateDateTime(5),
    updated_at: generateDateTime(2)
  }
];

// Mock Knowledge Base References
export const mockKnowledgeBaseReferences: KnowledgeBaseReference[] = [
  {
    id: generateId(),
    knowledge_base_id: kbId1,
    entity_type: 'project',
    entity_id: projectId1,
    created_at: generateDateTime(10),
    updated_at: generateDateTime(10)
  },
  {
    id: generateId(),
    knowledge_base_id: kbId2,
    entity_type: 'project',
    entity_id: projectId2,
    created_at: generateDateTime(7),
    updated_at: generateDateTime(7)
  },
  {
    id: generateId(),
    knowledge_base_id: kbId3,
    entity_type: 'project',
    entity_id: projectId1,
    created_at: generateDateTime(5),
    updated_at: generateDateTime(5)
  },
  {
    id: generateId(),
    knowledge_base_id: kbId3,
    entity_type: 'goal',
    entity_id: goalId1,
    created_at: generateDateTime(5),
    updated_at: generateDateTime(5)
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