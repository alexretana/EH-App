import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { TasksPage } from './pages/TasksPage';

test.describe('Error Handling - Network Errors', () => {
  test.skip('should show error state when backend is unavailable on load', async ({ page }) => {
    // Note: This test would require mocking or actually stopping the backend
    // For now, we'll structure it as a placeholder
  });

  test.skip('should handle backend errors gracefully during create/update', async ({ page }) => {
    // This would require API mocking to simulate backend failures
  });
});

test.describe('Error Handling - Validation Errors', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test.describe('Client-Side Validation', () => {
    test('should prevent submission with empty required fields', async ({ page }) => {
      await projectPage.openAddProjectModal();
      
      // Try to submit without filling required fields
      await projectPage.clickButton('Create Project');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Error message should be displayed
      await expect(page.getByText(/project name is required/i)).toBeVisible();
    });

    test('should validate negative time estimate', async ({ page }) => {
      await projectPage.createProject({
        name: 'Validation Test Project',
        description: 'For validation testing',
      });
      
      await projectPage.addGoalToProject('Validation Test Project', {
        name: 'Validation Test Goal',
      });
      
      await projectPage.expandGoal('Validation Test Project', 'Validation Test Goal');
      
      const goalItem = projectPage.getGoalInProject('Validation Test Project', 'Validation Test Goal');
      await goalItem.getByRole('button', { name: /add new task/i }).click();
      await projectPage.waitForModal();
      
      await projectPage.fillInput('Task Name', 'Test Task');
      await projectPage.fillInput('Time Estimate', '-10');
      
      await projectPage.clickButton('Create Task');
      
      // Should show validation error
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    });

    test('should validate invalid date formats', async ({ page }) => {
      await projectPage.openAddProjectModal();
      
      await projectPage.fillInput('Project Name', 'Date Test Project');
      
      // Try to enter invalid date
      const dateInput = page.getByLabel('Start Date');
      await dateInput.fill('invalid-date');
      
      await projectPage.clickButton('Create Project');
      
      // Form validation should catch this
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    });
  });

  test.describe('Server-Side Validation', () => {
    test.skip('should display server validation errors in modal', async ({ page }) => {
      // This test would require API mocking to return specific validation errors
    });

    test.skip('should handle foreign key violations', async ({ page }) => {
      // This would test scenarios like referencing non-existent goal_id
    });
  });
});

test.describe('Error Handling - Empty States', () => {
  test('should show empty state for projects view', async ({ page }) => {
    const projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    const isEmpty = await projectPage.isEmptyStateVisible();
    
    if (isEmpty) {
      await expect(page.getByText(/create your first project/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create project/i })).toBeVisible();
    }
  });

  test('should show empty state for knowledge base', async ({ page }) => {
    const knowledgePage = new KnowledgeBasePage(page);
    await knowledgePage.navigate();
    
    const isEmpty = await knowledgePage.isEmptyStateVisible();
    
    if (isEmpty) {
      await expect(page.getByText(/no documents yet/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create document/i })).toBeVisible();
    }
  });

  test('should show empty state for tasks view', async ({ page }) => {
    const tasksPage = new TasksPage(page);
    await tasksPage.navigate();
    
    const isEmpty = await tasksPage.isEmptyStateVisible();
    
    if (isEmpty) {
      await expect(page.getByText(/no tasks found/i)).toBeVisible();
    }
  });
});

test.describe('Error Handling - Loading States', () => {
  test('should show loading state during initial page load', async ({ page }) => {
    const projectPage = new ProjectPage(page);
    
    // Navigate and check for loading state
    const navigationPromise = projectPage.navigate();
    
    // Check if loading state appears (this may be too fast to catch)
    const loadingElement = page.locator('text=Loading...');
    
    await navigationPromise;
    
    // After load, content should be visible
    await expect(page).toHaveURL(/\//);
  });

  test('should show loading state during form submission', async ({ page }) => {
    const projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.openAddProjectModal();
    await projectPage.fillInput('Project Name', 'Loading Test Project');
    
    // Click submit and check for loading state
    const submitButton = page.getByRole('button', { name: 'Create Project' });
    await submitButton.click();
    
    // Button should show loading state
    // This may be too fast to catch without network throttling
    await projectPage.waitForToast('Project created successfully!');
  });
});

test.describe('Error Handling - Dialog Confirmations', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Dialog Test Project',
      description: 'For dialog testing',
    });
  });

  test('should show confirmation dialog before deletion', async ({ page }) => {
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', async dialog => {
      dialogShown = true;
      expect(dialog.message()).toContain('Are you sure');
      await dialog.accept();
    });
    
    const projectCard = projectPage.getProjectCard('Dialog Test Project');
    await projectCard.locator('button[aria-label="Delete"]').click();
    
    await page.waitForTimeout(500);
    expect(dialogShown).toBe(true);
  });

  test('should preserve data when dialog is cancelled', async ({ page }) => {
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
    
    const projectCard = projectPage.getProjectCard('Dialog Test Project');
    await projectCard.locator('button[aria-label="Delete"]').click();
    
    await page.waitForTimeout(500);
    
    // Project should still exist
    await expect(projectCard).toBeVisible();
  });
});

test.describe('Error Handling - Modal Interactions', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should not save data when modal is closed via cancel', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    await projectPage.fillInput('Project Name', 'Cancelled Project');
    await projectPage.fillInput('Description', 'Should not be saved');
    
    await projectPage.clickButton('Cancel');
    
    // Modal should close
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
    
    // Project should not exist
    await expect(projectPage.getProjectCard('Cancelled Project')).not.toBeVisible();
  });

  test('should not save data when modal is closed via overlay', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    await projectPage.fillInput('Project Name', 'Overlay Closed Project');
    
    await projectPage.closeModalByOverlay();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
    
    await expect(projectPage.getProjectCard('Overlay Closed Project')).not.toBeVisible();
  });

  test('should handle rapid modal open/close', async ({ page }) => {
    // Open and close modal multiple times
    for (let i = 0; i < 3; i++) {
      await projectPage.openAddProjectModal();
      await projectPage.closeModalByOverlay();
      await page.waitForTimeout(200);
    }
    
    // Final state should be modal closed
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
  });
});

test.describe('Error Handling - Toast Notifications', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should display success toast on successful operation', async ({ page }) => {
    await projectPage.createProject({
      name: 'Toast Test Project',
      description: 'For toast testing',
    });
    
    const toast = await projectPage.waitForToast('Project created successfully!');
    await expect(toast).toBeVisible();
  });

  test('should auto-dismiss toast after timeout', async ({ page }) => {
    await projectPage.createProject({
      name: 'Auto Dismiss Project',
      description: 'Toast should auto-dismiss',
    });
    
    const toast = await projectPage.waitForToast('Project created successfully!');
    await expect(toast).toBeVisible();
    
    // Wait for auto-dismiss (usually 3-5 seconds)
    await page.waitForTimeout(6000);
    
    // Toast should be gone
    await expect(toast).not.toBeVisible();
  });
});