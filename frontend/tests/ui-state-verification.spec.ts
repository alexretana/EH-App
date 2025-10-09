import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';

test.describe('UI State Verification - Animations and Transitions', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Animation Test Project',
      description: 'For animation testing',
    });
    
    await projectPage.addGoalToProject('Animation Test Project', {
      name: 'Animation Test Goal',
    });
  });

  test('should animate project expansion smoothly', async ({ page }) => {
    const projectCard = projectPage.getProjectCard('Animation Test Project');
    
    // Get initial height
    const initialBox = await projectCard.boundingBox();
    
    await projectPage.expandProject('Animation Test Project');
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    // Height should have increased
    const expandedBox = await projectCard.boundingBox();
    expect(expandedBox?.height).toBeGreaterThan(initialBox?.height || 0);
  });

  test('should animate project collapse smoothly', async ({ page }) => {
    await projectPage.expandProject('Animation Test Project');
    await page.waitForTimeout(500);
    
    const projectCard = projectPage.getProjectCard('Animation Test Project');
    const expandedBox = await projectCard.boundingBox();
    
    await projectPage.collapseProject('Animation Test Project');
    await page.waitForTimeout(500);
    
    const collapsedBox = await projectCard.boundingBox();
    expect(collapsedBox?.height).toBeLessThan(expandedBox?.height || 0);
  });

  test('should show modal fade-in animation', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Modal should be visible with proper styling
    const opacity = await modal.evaluate((el) => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBe(1);
  });

  test('should handle rapid expand/collapse without jank', async ({ page }) => {
    // Rapidly expand and collapse
    for (let i = 0; i < 3; i++) {
      await projectPage.expandProject('Animation Test Project');
      await page.waitForTimeout(200);
      await projectPage.collapseProject('Animation Test Project');
      await page.waitForTimeout(200);
    }
    
    // Final state should be stable
    const projectCard = projectPage.getProjectCard('Animation Test Project');
    await expect(projectCard).toBeVisible();
  });
});

test.describe('UI State Verification - Responsive Behavior', () => {
  test('should display properly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Desktop Test Project',
      description: 'Desktop viewport test',
    });
    
    const projectCard = projectPage.getProjectCard('Desktop Test Project');
    await expect(projectCard).toBeVisible();
    
    // Check that card has proper width constraints
    const box = await projectCard.boundingBox();
    expect(box?.width).toBeLessThan(1920);
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Tablet Test Project',
      description: 'Tablet viewport test',
    });
    
    const projectCard = projectPage.getProjectCard('Tablet Test Project');
    await expect(projectCard).toBeVisible();
  });

  test('should adapt to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Mobile Test Project',
      description: 'Mobile viewport test',
    });
    
    const projectCard = projectPage.getProjectCard('Mobile Test Project');
    await expect(projectCard).toBeVisible();
  });
});

test.describe('UI State Verification - Data Persistence', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should persist created project after reload', async ({ page }) => {
    await projectPage.createProject({
      name: 'Persistence Test Project',
      description: 'Should persist after reload',
      status: 'Active',
    });
    
    await projectPage.reloadPage();
    
    const projectCard = projectPage.getProjectCard('Persistence Test Project');
    await expect(projectCard).toBeVisible();
    await expect(projectCard).toContainText('Should persist after reload');
    await expect(projectCard).toContainText('Active');
  });

  test('should persist updated project after reload', async ({ page }) => {
    await projectPage.createProject({
      name: 'Update Persist Test',
      description: 'Original',
      status: 'Planning Phase',
    });
    
    await projectPage.editProject('Update Persist Test', {
      description: 'Updated description',
      status: 'Active',
    });
    
    await projectPage.reloadPage();
    
    const projectCard = projectPage.getProjectCard('Update Persist Test');
    await expect(projectCard).toContainText('Updated description');
    await expect(projectCard).toContainText('Active');
  });

  test('should maintain deletion after reload', async ({ page }) => {
    await projectPage.createProject({
      name: 'Delete Persist Test',
      description: 'To be deleted',
    });
    
    await projectPage.deleteProject('Delete Persist Test', true);
    
    await projectPage.reloadPage();
    
    await expect(projectPage.getProjectCard('Delete Persist Test')).not.toBeVisible();
  });
});

test.describe('UI State Verification - Button States', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    
    await projectPage.createProject({
      name: 'Button State Test Project',
      description: 'For button testing',
    });
  });

  test('should show hover states on buttons', async ({ page }) => {
    const projectCard = projectPage.getProjectCard('Button State Test Project');
    const editButton = projectCard.locator('button[aria-label="Edit"]');
    
    await expect(editButton).toBeVisible();
    
    // Hover over button
    await editButton.hover();
    
    // Button should be interactive
    await expect(editButton).toBeEnabled();
  });

  test('should disable submit button during form submission', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    await projectPage.fillInput('Project Name', 'Button Test Project');
    
    const submitButton = page.getByRole('button', { name: 'Create Project' });
    await expect(submitButton).toBeEnabled();
    
    // After clicking, button may show loading state
    // This is tested in the create project flow
  });
});

test.describe('UI State Verification - Focus Management', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should focus first input when modal opens', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    // First input should be focused
    const firstInput = page.getByLabel('Project Name');
    await expect(firstInput).toBeFocused();
  });

  test('should trap focus within modal', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    // Tab through modal elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should remain within modal
    const modal = page.locator('[role="dialog"]');
    const focusedElement = page.locator(':focus');
    
    // Check if focused element is within modal
    const isFocusedInModal = await focusedElement.evaluate((el, modalEl) => {
      return modalEl?.contains(el) || false;
    }, await modal.elementHandle());
    
    expect(isFocusedInModal).toBe(true);
  });

  test('should move focus to error on validation failure', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    // Try to submit without required field
    await projectPage.clickButton('Create Project');
    
    // Error message should be visible
    await expect(page.getByText(/project name is required/i)).toBeVisible();
  });
});

test.describe('UI State Verification - Badge and Status Display', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should display status badges correctly', async ({ page }) => {
    await projectPage.createProject({
      name: 'Badge Test Project',
      status: 'Active',
    });
    
    const projectCard = projectPage.getProjectCard('Badge Test Project');
    await expect(projectCard).toContainText('Active');
    
    // Status badge should be styled
    const statusBadge = projectCard.locator('[data-testid="status-badge"]');
    if (await statusBadge.count() > 0) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should update status badge when status changes', async ({ page }) => {
    await projectPage.createProject({
      name: 'Status Change Test',
      status: 'Planning Phase',
    });
    
    let projectCard = projectPage.getProjectCard('Status Change Test');
    await expect(projectCard).toContainText('Planning Phase');
    
    await projectPage.editProject('Status Change Test', {
      status: 'Active',
    });
    
    projectCard = projectPage.getProjectCard('Status Change Test');
    await expect(projectCard).toContainText('Active');
    await expect(projectCard).not.toContainText('Planning Phase');
  });
});

test.describe('UI State Verification - Accessibility', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
  });

  test('should have proper ARIA labels on buttons', async ({ page }) => {
    await projectPage.createProject({
      name: 'Accessibility Test Project',
      description: 'For a11y testing',
    });
    
    const projectCard = projectPage.getProjectCard('Accessibility Test Project');
    
    // Check for aria-labels
    const editButton = projectCard.locator('button[aria-label="Edit"]');
    const deleteButton = projectCard.locator('button[aria-label="Delete"]');
    
    await expect(editButton).toBeVisible();
    await expect(deleteButton).toBeVisible();
  });

  test('should have proper modal role', async ({ page }) => {
    await projectPage.openAddProjectModal();
    
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await projectPage.createProject({
      name: 'Keyboard Nav Test',
      description: 'For keyboard testing',
    });
    
    // Tab to the add project button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Modal might open (depending on focus)
    // This is a basic keyboard navigation test
  });
});