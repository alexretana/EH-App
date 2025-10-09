import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';

test.describe('Project View - CRUD Operations', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test.describe('Create Project', () => {
    test('should create a new project successfully', async ({ page }) => {
      const projectData = {
        name: 'Test Project Alpha',
        description: 'A test project for validation',
        status: 'Planning Phase',
        timeEstimate: '3 months',
        startDate: new Date().toISOString().split('T')[0],
      };

      await projectPage.createProject(projectData);

      // Verify project card appears
      const projectCard = projectPage.getProjectCard(projectData.name);
      await expect(projectCard).toBeVisible();
      
      // Verify project information
      await expect(projectCard).toContainText(projectData.name);
      await expect(projectCard).toContainText(projectData.description!);
      await expect(projectCard).toContainText('Planning Phase');
      await expect(projectCard).toContainText('3 months');
    });

    test('should show validation error when project name is missing', async ({ page }) => {
      await projectPage.openAddProjectModal();
      
      // Try to submit without name
      await projectPage.clickButton('Create Project');
      
      // Modal should remain open and show error
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/project name is required/i)).toBeVisible();
    });

    test('should close modal on cancel', async ({ page }) => {
      await projectPage.openAddProjectModal();
      
      await projectPage.fillInput('Project Name', 'Test Project');
      await projectPage.clickButton('Cancel');
      
      // Modal should close
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
      
      // Project should not be created
      await expect(projectPage.getProjectCard('Test Project')).not.toBeVisible();
    });

    test('should close modal by pressing Escape', async ({ page }) => {
      await projectPage.openAddProjectModal();
      
      await projectPage.fillInput('Project Name', 'Test Project');
      await projectPage.closeModalByOverlay();
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Edit Project', () => {
    test.beforeEach(async () => {
      // Create a project to edit
      await projectPage.createProject({
        name: 'Edit Test Project',
        description: 'Original description',
        status: 'Planning Phase',
      });
    });

    test('should edit project successfully', async ({ page }) => {
      await projectPage.editProject('Edit Test Project', {
        status: 'Active',
        description: 'Updated description',
        isActive: true,
      });

      const projectCard = projectPage.getProjectCard('Edit Test Project');
      await expect(projectCard).toContainText('Updated description');
      await expect(projectCard).toContainText('Active');
      
      // Verify persistence after reload
      await projectPage.reloadPage();
      await expect(projectCard).toContainText('Updated description');
      await expect(projectCard).toContainText('Active');
    });

    test('should show validation error when clearing required field', async ({ page }) => {
      const projectCard = projectPage.getProjectCard('Edit Test Project');
      await projectCard.locator('button[aria-label="Edit"]').click();
      await projectPage.waitForModal();
      
      // Clear project name
      await page.getByLabel('Project Name').clear();
      await projectPage.clickButton('Update Project');
      
      // Modal should remain open with error
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/project name is required/i)).toBeVisible();
    });
  });

  test.describe('Delete Project', () => {
    test.beforeEach(async () => {
      await projectPage.createProject({
        name: 'Delete Test Project',
        description: 'To be deleted',
      });
    });

    test('should delete project with confirmation', async ({ page }) => {
      await projectPage.deleteProject('Delete Test Project', true);
      
      // Project should be removed
      await expect(projectPage.getProjectCard('Delete Test Project')).not.toBeVisible();
    });

    test('should cancel deletion', async ({ page }) => {
      await projectPage.deleteProject('Delete Test Project', false);
      
      // Project should still exist
      await expect(projectPage.getProjectCard('Delete Test Project')).toBeVisible();
    });
  });

  test.describe('Expand/Collapse Project', () => {
    test.beforeEach(async () => {
      await projectPage.createProject({
        name: 'Expand Test Project',
        description: 'For expand testing',
      });
    });

    test('should expand project to show goals section', async ({ page }) => {
      await projectPage.expandProject('Expand Test Project');
      
      const projectCard = projectPage.getProjectCard('Expand Test Project');
      
      // Goals section should be visible
      await expect(projectCard.getByText(/no goals yet|add new goal/i)).toBeVisible();
    });

    test('should collapse project', async ({ page }) => {
      await projectPage.expandProject('Expand Test Project');
      await projectPage.collapseProject('Expand Test Project');
      
      const projectCard = projectPage.getProjectCard('Expand Test Project');
      
      // Goals section should not be visible
      await expect(projectCard.getByText(/add new goal/i)).not.toBeVisible();
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no projects exist', async ({ page }) => {
      // This test assumes a clean database
      // In real scenarios, you might need to delete all projects first
      const isEmpty = await projectPage.isEmptyStateVisible();
      
      if (isEmpty) {
        await expect(page.getByText(/create your first project/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create project/i })).toBeVisible();
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist created project after page reload', async ({ page }) => {
      const projectData = {
        name: 'Persistence Test Project',
        description: 'Testing persistence',
        status: 'Active',
      };

      await projectPage.createProject(projectData);
      
      await projectPage.reloadPage();
      
      const projectCard = projectPage.getProjectCard(projectData.name);
      await expect(projectCard).toBeVisible();
      await expect(projectCard).toContainText(projectData.description);
    });
  });
});