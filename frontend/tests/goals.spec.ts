import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';

test.describe('Goal CRUD Operations', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    // Create a project to add goals to
    await projectPage.createProject({
      name: 'Goals Test Project',
      description: 'Project for testing goals',
    });
  });

  test.describe('Create Goal', () => {
    test('should create a new goal successfully', async ({ page }) => {
      const goalData = {
        name: 'Q1 Milestone',
        description: 'First quarter objectives',
        status: 'Not started',
        scope: 'Monthly',
        dueDate: '2025-03-31',
      };

      await projectPage.addGoalToProject('Goals Test Project', goalData);

      const goal = projectPage.getGoalInProject('Goals Test Project', goalData.name);
      await expect(goal).toBeVisible();
      await expect(goal).toContainText(goalData.name);
      await expect(goal).toContainText(goalData.description!);
      await expect(goal).toContainText('0/0 tasks completed');
    });

    test('should show validation error when goal name is missing', async ({ page }) => {
      await projectPage.expandProject('Goals Test Project');
      
      const projectCard = projectPage.getProjectCard('Goals Test Project');
      await projectCard.getByRole('button', { name: /add new goal/i }).click();
      await projectPage.waitForModal();
      
      // Try to submit without name
      await projectPage.clickButton('Create Goal');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/goal name is required/i)).toBeVisible();
    });

    test('should close modal on cancel', async ({ page }) => {
      await projectPage.expandProject('Goals Test Project');
      
      const projectCard = projectPage.getProjectCard('Goals Test Project');
      await projectCard.getByRole('button', { name: /add new goal/i }).click();
      await projectPage.waitForModal();
      
      await projectPage.fillInput('Goal Name', 'Test Goal');
      await projectPage.clickButton('Cancel');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
      
      // Goal should not be created
      await expect(projectPage.getGoalInProject('Goals Test Project', 'Test Goal')).not.toBeVisible();
    });
  });

  test.describe('Edit Goal', () => {
    test.beforeEach(async () => {
      await projectPage.addGoalToProject('Goals Test Project', {
        name: 'Edit Test Goal',
        description: 'Original goal description',
        status: 'Not started',
        scope: 'Monthly',
      });
    });

    test('should edit goal successfully', async ({ page }) => {
      await projectPage.editGoal('Goals Test Project', 'Edit Test Goal', {
        status: 'Active',
        scope: 'Quarterly',
        description: 'Updated goal description',
      });

      const goal = projectPage.getGoalInProject('Goals Test Project', 'Edit Test Goal');
      await expect(goal).toContainText('Updated goal description');
      await expect(goal).toContainText('Active');
      
      // Verify persistence
      await projectPage.reloadPage();
      await projectPage.expandProject('Goals Test Project');
      await expect(goal).toContainText('Updated goal description');
    });

    test('should show validation error when clearing required field', async ({ page }) => {
      await projectPage.expandProject('Goals Test Project');
      
      const goal = projectPage.getGoalInProject('Goals Test Project', 'Edit Test Goal');
      await goal.locator('button[aria-label="Edit"]').click();
      await projectPage.waitForModal();
      
      await page.getByLabel('Goal Name').clear();
      await projectPage.clickButton('Update Goal');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/goal name is required/i)).toBeVisible();
    });
  });

  test.describe('Delete Goal', () => {
    test.beforeEach(async () => {
      await projectPage.addGoalToProject('Goals Test Project', {
        name: 'Delete Test Goal',
        description: 'To be deleted',
      });
    });

    test('should delete goal with confirmation', async ({ page }) => {
      await projectPage.deleteGoal('Goals Test Project', 'Delete Test Goal', true);
      
      await expect(projectPage.getGoalInProject('Goals Test Project', 'Delete Test Goal')).not.toBeVisible();
    });

    test('should cancel deletion', async ({ page }) => {
      await projectPage.deleteGoal('Goals Test Project', 'Delete Test Goal', false);
      
      await expect(projectPage.getGoalInProject('Goals Test Project', 'Delete Test Goal')).toBeVisible();
    });
  });

  test.describe('Expand/Collapse Goal', () => {
    test.beforeEach(async () => {
      await projectPage.addGoalToProject('Goals Test Project', {
        name: 'Expand Test Goal',
        description: 'For expand testing',
      });
    });

    test('should expand goal to show tasks section', async ({ page }) => {
      await projectPage.expandGoal('Goals Test Project', 'Expand Test Goal');
      
      const goal = projectPage.getGoalInProject('Goals Test Project', 'Expand Test Goal');
      await expect(goal.getByText(/no tasks yet|add new task/i)).toBeVisible();
    });

    test('should collapse goal', async ({ page }) => {
      await projectPage.expandGoal('Goals Test Project', 'Expand Test Goal');
      
      // Now collapse it
      const goal = projectPage.getGoalInProject('Goals Test Project', 'Expand Test Goal');
      const collapseButton = goal.locator('button[aria-label="Collapse"]');
      await collapseButton.click();
      await page.waitForTimeout(300);
      
      // Tasks section should not be visible
      await expect(goal.getByText(/add new task/i)).not.toBeVisible();
    });
  });

  test.describe('Goal Empty State', () => {
    test('should show "No goals yet" when project has no goals', async ({ page }) => {
      // Create a new project without goals
      await projectPage.createProject({
        name: 'Empty Goals Project',
        description: 'No goals',
      });
      
      await projectPage.expandProject('Empty Goals Project');
      
      const projectCard = projectPage.getProjectCard('Empty Goals Project');
      await expect(projectCard.getByText(/no goals yet/i)).toBeVisible();
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist created goal after page reload', async ({ page }) => {
      const goalData = {
        name: 'Persistence Test Goal',
        description: 'Testing persistence',
        status: 'Active',
      };

      await projectPage.addGoalToProject('Goals Test Project', goalData);
      
      await projectPage.reloadPage();
      await projectPage.expandProject('Goals Test Project');
      
      const goal = projectPage.getGoalInProject('Goals Test Project', goalData.name);
      await expect(goal).toBeVisible();
      await expect(goal).toContainText(goalData.description);
    });
  });
});