import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Project View
 */
export class ProjectPage extends BasePage {
  // Locators
  readonly addProjectButton: Locator;
  readonly projectCards: Locator;

  constructor(page: Page) {
    super(page);
    this.addProjectButton = page.getByRole('button', { name: /add project/i });
    this.projectCards = page.locator('[data-testid="project-card"]');
  }

  /**
   * Navigate to Project View
   */
  async navigate() {
    await this.goto('/');
    await this.waitForLoadingComplete();
  }

  /**
   * Open Add Project modal
   */
  async openAddProjectModal() {
    await this.addProjectButton.click();
    await this.waitForModal();
  }

  /**
   * Create a new project
   */
  async createProject(data: {
    name: string;
    description?: string;
    status?: string;
    timeEstimate?: string;
    startDate?: string;
    isActive?: boolean;
  }) {
    await this.openAddProjectModal();

    // Fill required fields
    await this.fillInput('Project Name', data.name);
    
    if (data.description) {
      await this.fillInput('Description', data.description);
    }
    
    if (data.status) {
      await this.selectOption('Status', data.status);
    }
    
    if (data.timeEstimate) {
      await this.fillInput('Time Estimate', data.timeEstimate);
    }
    
    if (data.startDate) {
      await this.fillInput('Start Date', data.startDate);
    }
    
    if (data.isActive !== undefined) {
      const checkbox = this.page.getByLabel('Active Project');
      if (data.isActive) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }

    await this.clickButton('Create Project');
    await this.waitForToast('Project created successfully!');
  }

  /**
   * Get project card by name
   */
  getProjectCard(name: string): Locator {
    return this.page.locator(`[data-testid="project-card"]:has-text("${name}")`);
  }

  /**
   * Edit project
   */
  async editProject(projectName: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    timeEstimate?: string;
    isActive?: boolean;
  }) {
    const projectCard = this.getProjectCard(projectName);
    await projectCard.locator('button[aria-label="Edit"]').click();
    await this.waitForModal();

    if (updates.name) {
      await this.fillInput('Project Name', updates.name);
    }
    
    if (updates.description) {
      await this.fillInput('Description', updates.description);
    }
    
    if (updates.status) {
      await this.selectOption('Status', updates.status);
    }
    
    if (updates.timeEstimate) {
      await this.fillInput('Time Estimate', updates.timeEstimate);
    }
    
    if (updates.isActive !== undefined) {
      const checkbox = this.page.getByLabel('Active Project');
      if (updates.isActive) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    }

    await this.clickButton('Update Project');
    await this.waitForToast('Project updated successfully!');
  }

  /**
   * Delete project
   */
  async deleteProject(projectName: string, confirm: boolean = true) {
    const projectCard = this.getProjectCard(projectName);
    await this.handleConfirmDialog(confirm);
    await projectCard.locator('button[aria-label="Delete"]').click();
    
    if (confirm) {
      await this.page.waitForTimeout(500); // Wait for deletion to complete
    }
  }

  /**
   * Expand project to view goals
   */
  async expandProject(projectName: string) {
    const projectCard = this.getProjectCard(projectName);
    const expandButton = projectCard.locator('button[aria-label="Expand"]');
    await expandButton.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Collapse project
   */
  async collapseProject(projectName: string) {
    const projectCard = this.getProjectCard(projectName);
    const collapseButton = projectCard.locator('button[aria-label="Collapse"]');
    await collapseButton.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Add goal to project
   */
  async addGoalToProject(projectName: string, goalData: {
    name: string;
    description?: string;
    status?: string;
    scope?: string;
    dueDate?: string;
  }) {
    await this.expandProject(projectName);
    
    const projectCard = this.getProjectCard(projectName);
    await projectCard.getByRole('button', { name: /add new goal/i }).click();
    await this.waitForModal();

    await this.fillInput('Goal Name', goalData.name);
    
    if (goalData.description) {
      await this.fillInput('Description', goalData.description);
    }
    
    if (goalData.status) {
      await this.selectOption('Status', goalData.status);
    }
    
    if (goalData.scope) {
      await this.selectOption('Scope', goalData.scope);
    }
    
    if (goalData.dueDate) {
      await this.fillInput('Due Date', goalData.dueDate);
    }

    await this.clickButton('Create Goal');
    await this.waitForToast('Goal created successfully!');
  }

  /**
   * Get goal within project
   */
  getGoalInProject(projectName: string, goalName: string): Locator {
    const projectCard = this.getProjectCard(projectName);
    return projectCard.locator(`[data-testid="goal-item"]:has-text("${goalName}")`);
  }

  /**
   * Edit goal
   */
  async editGoal(projectName: string, goalName: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    scope?: string;
    dueDate?: string;
  }) {
    await this.expandProject(projectName);
    
    const goalItem = this.getGoalInProject(projectName, goalName);
    await goalItem.locator('button[aria-label="Edit"]').click();
    await this.waitForModal();

    if (updates.name) {
      await this.fillInput('Goal Name', updates.name);
    }
    
    if (updates.description) {
      await this.fillInput('Description', updates.description);
    }
    
    if (updates.status) {
      await this.selectOption('Status', updates.status);
    }
    
    if (updates.scope) {
      await this.selectOption('Scope', updates.scope);
    }
    
    if (updates.dueDate) {
      await this.fillInput('Due Date', updates.dueDate);
    }

    await this.clickButton('Update Goal');
    await this.waitForToast('Goal updated successfully!');
  }

  /**
   * Delete goal
   */
  async deleteGoal(projectName: string, goalName: string, confirm: boolean = true) {
    await this.expandProject(projectName);
    
    const goalItem = this.getGoalInProject(projectName, goalName);
    await this.handleConfirmDialog(confirm);
    await goalItem.locator('button[aria-label="Delete"]').click();
    
    if (confirm) {
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Expand goal to view tasks
   */
  async expandGoal(projectName: string, goalName: string) {
    await this.expandProject(projectName);
    
    const goalItem = this.getGoalInProject(projectName, goalName);
    const expandButton = goalItem.locator('button[aria-label="Expand"]');
    await expandButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Add task to goal
   */
  async addTaskToGoal(projectName: string, goalName: string, taskData: {
    name: string;
    description?: string;
    status?: string;
    taskType?: string;
    priority?: string;
    effortLevel?: string;
    timeEstimate?: number;
    dueDate?: string;
  }) {
    await this.expandGoal(projectName, goalName);
    
    const goalItem = this.getGoalInProject(projectName, goalName);
    await goalItem.getByRole('button', { name: /add new task/i }).click();
    await this.waitForModal();

    await this.fillInput('Task Name', taskData.name);
    
    if (taskData.description) {
      await this.fillInput('Description', taskData.description);
    }
    
    if (taskData.status) {
      await this.selectOption('Status', taskData.status);
    }
    
    if (taskData.taskType) {
      await this.selectOption('Task Type', taskData.taskType);
    }
    
    if (taskData.priority) {
      await this.selectOption('Priority', taskData.priority);
    }
    
    if (taskData.effortLevel) {
      await this.selectOption('Effort Level', taskData.effortLevel);
    }
    
    if (taskData.timeEstimate !== undefined) {
      await this.fillInput('Time Estimate', taskData.timeEstimate.toString());
    }
    
    if (taskData.dueDate) {
      await this.fillInput('Due Date', taskData.dueDate);
    }

    await this.clickButton('Create Task');
    await this.waitForToast('Task created successfully!');
  }

  /**
   * Get task within goal
   */
  getTaskInGoal(projectName: string, goalName: string, taskName: string): Locator {
    const goalItem = this.getGoalInProject(projectName, goalName);
    return goalItem.locator(`[data-testid="task-item"]:has-text("${taskName}")`);
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.page.locator('text=Create Your First Project').isVisible();
  }
}