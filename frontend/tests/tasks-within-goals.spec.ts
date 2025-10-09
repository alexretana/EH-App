import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';

test.describe('Task CRUD Operations within Goals', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    // Create project and goal to add tasks to
    await projectPage.createProject({
      name: 'Tasks Test Project',
      description: 'Project for testing tasks',
    });
    
    await projectPage.addGoalToProject('Tasks Test Project', {
      name: 'Tasks Test Goal',
      description: 'Goal for testing tasks',
    });
  });

  test.describe('Create Task', () => {
    test('should create a new task successfully', async ({ page }) => {
      const taskData = {
        name: 'Design database schema',
        description: 'Create initial ERD',
        status: 'Not started',
        taskType: 'Develop',
        priority: 'High',
        effortLevel: 'Medium',
        timeEstimate: 120,
        dueDate: '2025-12-31',
      };

      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', taskData);

      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', taskData.name);
      await expect(task).toBeVisible();
      await expect(task).toContainText(taskData.name);
      await expect(task).toContainText(taskData.description!);
      await expect(task).toContainText('120 min');
      await expect(task).toContainText('High');
    });

    test('should show validation error when task name is missing', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const goalItem = projectPage.getGoalInProject('Tasks Test Project', 'Tasks Test Goal');
      await goalItem.getByRole('button', { name: /add new task/i }).click();
      await projectPage.waitForModal();
      
      // Try to submit without name
      await projectPage.clickButton('Create Task');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/task name is required/i)).toBeVisible();
    });

    test('should show validation error when time estimate is missing', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const goalItem = projectPage.getGoalInProject('Tasks Test Project', 'Tasks Test Goal');
      await goalItem.getByRole('button', { name: /add new task/i }).click();
      await projectPage.waitForModal();
      
      await projectPage.fillInput('Task Name', 'Test Task');
      
      // Try to submit without time estimate
      await projectPage.clickButton('Create Task');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/time estimate is required/i)).toBeVisible();
    });

    test('should close modal on cancel', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const goalItem = projectPage.getGoalInProject('Tasks Test Project', 'Tasks Test Goal');
      await goalItem.getByRole('button', { name: /add new task/i }).click();
      await projectPage.waitForModal();
      
      await projectPage.fillInput('Task Name', 'Test Task');
      await projectPage.clickButton('Cancel');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Edit Task', () => {
    test.beforeEach(async () => {
      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', {
        name: 'Edit Test Task',
        description: 'Original task description',
        status: 'Not started',
        priority: 'High',
        timeEstimate: 60,
      });
    });

    test('should edit task successfully', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Edit Test Task');
      await task.locator('button[aria-label="Edit"]').click();
      await projectPage.waitForModal();
      
      // Update fields
      await projectPage.selectOption('Status', 'Active');
      await projectPage.selectOption('Priority', 'Medium');
      await projectPage.fillInput('Description', 'Updated task description');
      
      await projectPage.clickButton('Update Task');
      await projectPage.waitForToast('Task updated successfully!');
      
      await expect(task).toContainText('Updated task description');
      await expect(task).toContainText('Active');
      await expect(task).toContainText('Medium');
    });
  });

  test.describe('Delete Task', () => {
    test.beforeEach(async () => {
      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', {
        name: 'Delete Test Task',
        description: 'To be deleted',
        timeEstimate: 30,
      });
    });

    test('should delete task with confirmation', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Delete Test Task');
      
      await projectPage.handleConfirmDialog(true);
      await task.locator('button[aria-label="Delete"]').click();
      await page.waitForTimeout(500);
      
      await expect(task).not.toBeVisible();
    });

    test('should cancel deletion', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Delete Test Task');
      
      await projectPage.handleConfirmDialog(false);
      await task.locator('button[aria-label="Delete"]').click();
      
      await expect(task).toBeVisible();
    });
  });

  test.describe('Task Status Transitions', () => {
    test.beforeEach(async () => {
      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', {
        name: 'Status Test Task',
        description: 'For status testing',
        status: 'Not started',
        timeEstimate: 45,
      });
    });

    test('should start task (Not started → Active)', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Status Test Task');
      await task.locator('button[aria-label="Start"]').click();
      await page.waitForTimeout(300);
      
      await expect(task).toContainText('Active');
    });

    test('should complete task (Active → Done)', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Status Test Task');
      
      // First start the task
      await task.locator('button[aria-label="Start"]').click();
      await page.waitForTimeout(300);
      
      // Then complete it
      await task.locator('button[aria-label="Complete"]').click();
      await page.waitForTimeout(300);
      
      await expect(task).toContainText('Done');
    });

    test('should pause task (Active → Not started)', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Status Test Task');
      
      // First start the task
      await task.locator('button[aria-label="Start"]').click();
      await page.waitForTimeout(300);
      
      // Then pause it
      await task.locator('button[aria-label="Pause"]').click();
      await page.waitForTimeout(300);
      
      await expect(task).toContainText('Not started');
    });

    test('should reactivate completed task (Done → Active)', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Status Test Task');
      
      // Start and complete the task
      await task.locator('button[aria-label="Start"]').click();
      await page.waitForTimeout(300);
      await task.locator('button[aria-label="Complete"]').click();
      await page.waitForTimeout(300);
      
      // Now reactivate it
      await task.locator('button[aria-label="Reactivate"]').click();
      await page.waitForTimeout(300);
      
      await expect(task).toContainText('Active');
    });
  });

  test.describe('Task Count Updates', () => {
    test('should update goal task completion count', async ({ page }) => {
      const goal = projectPage.getGoalInProject('Tasks Test Project', 'Tasks Test Goal');
      
      // Initially 0/0
      await expect(goal).toContainText('0/0 tasks');
      
      // Add a task
      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', {
        name: 'Count Test Task',
        timeEstimate: 30,
      });
      
      // Should now be 0/1
      await expect(goal).toContainText('0/1 tasks');
      
      // Start and complete the task
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', 'Count Test Task');
      await task.locator('button[aria-label="Start"]').click();
      await page.waitForTimeout(300);
      await task.locator('button[aria-label="Complete"]').click();
      await page.waitForTimeout(300);
      
      // Should now be 1/1
      await expect(goal).toContainText('1/1 tasks');
    });
  });

  test.describe('Task Empty State', () => {
    test('should show "No tasks yet" when goal has no tasks', async ({ page }) => {
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const goal = projectPage.getGoalInProject('Tasks Test Project', 'Tasks Test Goal');
      await expect(goal.getByText(/no tasks yet/i)).toBeVisible();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist created task after page reload', async ({ page }) => {
      const taskData = {
        name: 'Persistence Test Task',
        description: 'Testing persistence',
        timeEstimate: 90,
      };

      await projectPage.addTaskToGoal('Tasks Test Project', 'Tasks Test Goal', taskData);
      
      await projectPage.reloadPage();
      await projectPage.expandProject('Tasks Test Project');
      await projectPage.expandGoal('Tasks Test Project', 'Tasks Test Goal');
      
      const task = projectPage.getTaskInGoal('Tasks Test Project', 'Tasks Test Goal', taskData.name);
      await expect(task).toBeVisible();
      await expect(task).toContainText(taskData.description);
    });
  });
});