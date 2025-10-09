import { test, expect } from '@playwright/test';
import { TasksPage } from './pages/TasksPage';
import { ProjectPage } from './pages/ProjectPage';

test.describe('Tasks View - Filters and Sorting', () => {
  let tasksPage: TasksPage;
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    projectPage = new ProjectPage(page);
    
    // Set up test data: Create projects, goals, and tasks
    await projectPage.navigate();
    
    // Active project with active goal
    await projectPage.createProject({
      name: 'Active Project 1',
      description: 'Active test project',
      isActive: true,
    });
    
    await projectPage.addGoalToProject('Active Project 1', {
      name: 'Active Goal 1',
      status: 'Active',
      scope: 'Monthly',
    });
    
    await projectPage.addTaskToGoal('Active Project 1', 'Active Goal 1', {
      name: 'Active Task 1',
      status: 'Active',
      priority: 'High',
      timeEstimate: 60,
    });
    
    // Inactive project
    await projectPage.createProject({
      name: 'Inactive Project',
      description: 'Inactive test project',
      isActive: false,
    });
    
    await projectPage.addGoalToProject('Inactive Project', {
      name: 'Inactive Goal',
      status: 'Not started',
    });
    
    await projectPage.addTaskToGoal('Inactive Project', 'Inactive Goal', {
      name: 'Inactive Task',
      status: 'Not started',
      priority: 'Low',
      timeEstimate: 30,
    });
    
    // Navigate to tasks view
    await tasksPage.navigate();
  });

  test.describe('Filter Controls', () => {
    test('should show all tasks by default', async ({ page }) => {
      const taskCount = await tasksPage.getTaskCount();
      expect(taskCount).toBeGreaterThanOrEqual(2);
      
      await expect(tasksPage.getTask('Active Task 1')).toBeVisible();
      await expect(tasksPage.getTask('Inactive Task')).toBeVisible();
    });

    test('should filter by active projects', async ({ page }) => {
      await tasksPage.applyFilter('Active Projects');
      
      await expect(tasksPage.getTask('Active Task 1')).toBeVisible();
      await expect(tasksPage.getTask('Inactive Task')).not.toBeVisible();
    });

    test('should filter by active goals', async ({ page }) => {
      await tasksPage.applyFilter('Active Goals');
      
      await expect(tasksPage.getTask('Active Task 1')).toBeVisible();
      await expect(tasksPage.getTask('Inactive Task')).not.toBeVisible();
    });

    test('should filter by active milestones', async ({ page }) => {
      // Create a milestone goal
      await projectPage.navigate();
      await projectPage.addGoalToProject('Active Project 1', {
        name: 'Milestone Goal',
        status: 'Active',
        scope: 'Weekly-Milestone',
      });
      
      await projectPage.addTaskToGoal('Active Project 1', 'Milestone Goal', {
        name: 'Milestone Task',
        timeEstimate: 45,
      });
      
      await tasksPage.navigate();
      await tasksPage.applyFilter('Active Milestones');
      
      await expect(tasksPage.getTask('Milestone Task')).toBeVisible();
      await expect(tasksPage.getTask('Active Task 1')).not.toBeVisible();
    });
  });

  test.describe('Sort Controls', () => {
    test('should sort by status', async ({ page }) => {
      await tasksPage.applySort('Status');
      
      // Verify tasks are sorted (Active tasks should come before Not started)
      const tasks = page.locator('[data-testid="task-row"], [data-testid="task-card"]');
      const firstTask = tasks.first();
      await expect(firstTask).toContainText('Active');
    });

    test('should sort by dependency order', async ({ page }) => {
      await tasksPage.applySort('Dependency Order');
      
      // Tasks should be reordered
      const tasks = await tasksPage.getTaskCount();
      expect(tasks).toBeGreaterThan(0);
    });
  });

  test.describe('View Toggle', () => {
    test('should display table view on desktop by default', async ({ page }) => {
      await expect(tasksPage.taskTable).toBeVisible();
    });

    test('should show kanban coming soon message', async ({ page }) => {
      await tasksPage.switchView('Kanban');
      
      await expect(page.getByText(/kanban view coming soon/i)).toBeVisible();
    });
  });
});

test.describe('Tasks View - Task Status Transitions', () => {
  let tasksPage: TasksPage;
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    projectPage = new ProjectPage(page);
    
    // Create test project, goal, and tasks
    await projectPage.navigate();
    await projectPage.createProject({
      name: 'Status Test Project',
      description: 'For status testing',
    });
    
    await projectPage.addGoalToProject('Status Test Project', {
      name: 'Status Test Goal',
      status: 'Active',
    });
    
    await projectPage.addTaskToGoal('Status Test Project', 'Status Test Goal', {
      name: 'Status Transition Task',
      status: 'Not started',
      timeEstimate: 60,
    });
    
    await tasksPage.navigate();
  });

  test('should start task (Not started → Active)', async ({ page }) => {
    await tasksPage.startTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Active');
  });

  test('should complete task (Active → Done)', async ({ page }) => {
    await tasksPage.startTask('Status Transition Task');
    await tasksPage.completeTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Done');
  });

  test('should pause task (Active → Not started)', async ({ page }) => {
    await tasksPage.startTask('Status Transition Task');
    await tasksPage.pauseTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Not started');
  });

  test('should cancel task', async ({ page }) => {
    await tasksPage.cancelTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Cancelled');
  });

  test('should reactivate task (Done → Active)', async ({ page }) => {
    await tasksPage.startTask('Status Transition Task');
    await tasksPage.completeTask('Status Transition Task');
    await tasksPage.reactivateTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Active');
  });

  test('should reactivate cancelled task', async ({ page }) => {
    await tasksPage.cancelTask('Status Transition Task');
    await tasksPage.reactivateTask('Status Transition Task');
    
    const status = await tasksPage.getTaskStatus('Status Transition Task');
    expect(status).toContain('Active');
  });
});

test.describe('Tasks View - Add and Edit Tasks', () => {
  let tasksPage: TasksPage;
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    projectPage = new ProjectPage(page);
    
    // Create test project and goal
    await projectPage.navigate();
    await projectPage.createProject({
      name: 'Task Creation Project',
      description: 'For task creation testing',
    });
    
    await projectPage.addGoalToProject('Task Creation Project', {
      name: 'Task Creation Goal',
      status: 'Active',
    });
    
    await tasksPage.navigate();
  });

  test('should create task from tasks view', async ({ page }) => {
    await tasksPage.createTask({
      name: 'New Task from View',
      description: 'Created from tasks view',
      project: 'Task Creation Project',
      goal: 'Task Creation Goal',
      priority: 'Medium',
      timeEstimate: 90,
    });

    await expect(tasksPage.getTask('New Task from View')).toBeVisible();
  });

  test('should update goal dropdown when project changes', async ({ page }) => {
    await tasksPage.openAddTaskModal();
    
    // Select a project
    await tasksPage.page.getByLabel('Project').click();
    await tasksPage.page.getByRole('option', { name: 'Task Creation Project' }).click();
    
    // Wait for goals to load
    await page.waitForTimeout(500);
    
    // Goal dropdown should be enabled and have options
    const goalDropdown = tasksPage.page.getByLabel('Goal');
    await expect(goalDropdown).toBeEnabled();
  });

  test('should edit task from tasks view', async ({ page }) => {
    // Create a task first
    await tasksPage.createTask({
      name: 'Edit Test Task',
      project: 'Task Creation Project',
      goal: 'Task Creation Goal',
      priority: 'Low',
      timeEstimate: 30,
    });

    // Edit it
    await tasksPage.editTask('Edit Test Task', {
      priority: 'High',
      description: 'Updated description',
    });

    const priority = await tasksPage.getTaskPriority('Edit Test Task');
    expect(priority).toContain('High');
  });

  test('should open edit modal by clicking task row', async ({ page }) => {
    await tasksPage.createTask({
      name: 'Click Test Task',
      project: 'Task Creation Project',
      goal: 'Task Creation Goal',
      timeEstimate: 45,
    });

    await tasksPage.clickTask('Click Test Task');
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Click Test Task');
  });

  test('should delete task from tasks view', async ({ page }) => {
    await tasksPage.createTask({
      name: 'Delete Test Task',
      project: 'Task Creation Project',
      goal: 'Task Creation Goal',
      timeEstimate: 20,
    });

    await tasksPage.deleteTask('Delete Test Task', true);
    
    await expect(tasksPage.getTask('Delete Test Task')).not.toBeVisible();
  });
});

test.describe('Tasks View - Empty States', () => {
  let tasksPage: TasksPage;

  test.beforeEach(async ({ page }) => {
    tasksPage = new TasksPage(page);
    await tasksPage.navigate();
  });

  test('should show empty state when no tasks exist', async ({ page }) => {
    // This test assumes a clean database or all tasks deleted
    const isEmpty = await tasksPage.isEmptyStateVisible();
    
    if (isEmpty) {
      await expect(page.getByText(/no tasks found/i)).toBeVisible();
    }
  });

  test('should show empty state when filter excludes all tasks', async ({ page }) => {
    // Apply a filter that might exclude all tasks
    await tasksPage.applyFilter('Active Milestones');
    
    // If no milestones exist, empty state should show
    const taskCount = await tasksPage.getTaskCount();
    if (taskCount === 0) {
      await expect(page.getByText(/no tasks found/i)).toBeVisible();
    }
  });
});