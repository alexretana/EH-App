import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Tasks View
 */
export class TasksPage extends BasePage {
  // Locators
  readonly addTaskButton: Locator;
  readonly taskTable: Locator;
  readonly taskCards: Locator;
  readonly filterDropdown: Locator;
  readonly sortDropdown: Locator;
  readonly viewToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.addTaskButton = page.getByRole('button', { name: /add task/i });
    this.taskTable = page.locator('[data-testid="task-table"]');
    this.taskCards = page.locator('[data-testid="task-card"]');
    this.filterDropdown = page.getByLabel('Filter');
    this.sortDropdown = page.getByLabel('Sort');
    this.viewToggle = page.locator('[data-testid="view-toggle"]');
  }

  /**
   * Navigate to Tasks View
   */
  async navigate() {
    await this.goto('/tasks');
    await this.waitForLoadingComplete();
  }

  /**
   * Open Add Task modal
   */
  async openAddTaskModal() {
    await this.addTaskButton.click();
    await this.waitForModal();
  }

  /**
   * Create a new task
   */
  async createTask(data: {
    name: string;
    description?: string;
    status?: string;
    taskType?: string;
    priority?: string;
    effortLevel?: string;
    timeEstimate?: number;
    dueDate?: string;
    project?: string;
    goal?: string;
  }) {
    await this.openAddTaskModal();

    await this.fillInput('Task Name', data.name);
    
    if (data.description) {
      await this.fillInput('Description', data.description);
    }
    
    if (data.project) {
      await this.selectOption('Project', data.project);
      
      // Wait for goals to load after project selection
      await this.page.waitForTimeout(300);
      
      if (data.goal) {
        await this.selectOption('Goal', data.goal);
      }
    }
    
    if (data.status) {
      await this.selectOption('Status', data.status);
    }
    
    if (data.taskType) {
      await this.selectOption('Task Type', data.taskType);
    }
    
    if (data.priority) {
      await this.selectOption('Priority', data.priority);
    }
    
    if (data.effortLevel) {
      await this.selectOption('Effort Level', data.effortLevel);
    }
    
    if (data.timeEstimate !== undefined) {
      await this.fillInput('Time Estimate', data.timeEstimate.toString());
    }
    
    if (data.dueDate) {
      await this.fillInput('Due Date', data.dueDate);
    }

    await this.clickButton('Create Task');
    await this.waitForToast('Task created successfully!');
  }

  /**
   * Apply filter
   */
  async applyFilter(filter: 'All' | 'Active Projects' | 'Active Goals' | 'Active Milestones') {
    await this.page.getByRole('button', { name: filter }).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Apply sort
   */
  async applySort(sort: 'Status' | 'Dependency Order' | 'Recent') {
    await this.sortDropdown.click();
    await this.page.getByRole('option', { name: sort }).click();
    await this.waitForLoadingComplete();
  }

  /**
   * Switch view mode
   */
  async switchView(view: 'Table' | 'Kanban') {
    await this.page.getByRole('button', { name: view }).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Get task row/card by name
   */
  getTask(taskName: string): Locator {
    return this.page.locator(`[data-testid="task-row"]:has-text("${taskName}"), [data-testid="task-card"]:has-text("${taskName}")`);
  }

  /**
   * Start task (Not started → Active)
   */
  async startTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Start"]').click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Complete task (Active → Done)
   */
  async completeTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Complete"]').click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Pause task (Active → Not started)
   */
  async pauseTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Pause"]').click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Cancel task
   */
  async cancelTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Cancel"]').click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Reactivate task (Done/Cancelled → Active)
   */
  async reactivateTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Reactivate"]').click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Edit task
   */
  async editTask(taskName: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    taskType?: string;
    priority?: string;
    effortLevel?: string;
    timeEstimate?: number;
    dueDate?: string;
  }) {
    const task = this.getTask(taskName);
    await task.locator('button[aria-label="Edit"]').click();
    await this.waitForModal();

    if (updates.name) {
      await this.fillInput('Task Name', updates.name);
    }
    
    if (updates.description) {
      await this.fillInput('Description', updates.description);
    }
    
    if (updates.status) {
      await this.selectOption('Status', updates.status);
    }
    
    if (updates.taskType) {
      await this.selectOption('Task Type', updates.taskType);
    }
    
    if (updates.priority) {
      await this.selectOption('Priority', updates.priority);
    }
    
    if (updates.effortLevel) {
      await this.selectOption('Effort Level', updates.effortLevel);
    }
    
    if (updates.timeEstimate !== undefined) {
      await this.fillInput('Time Estimate', updates.timeEstimate.toString());
    }
    
    if (updates.dueDate) {
      await this.fillInput('Due Date', updates.dueDate);
    }

    await this.clickButton('Update Task');
    await this.waitForToast('Task updated successfully!');
  }

  /**
   * Delete task
   */
  async deleteTask(taskName: string, confirm: boolean = true) {
    const task = this.getTask(taskName);
    await this.handleConfirmDialog(confirm);
    await task.locator('button[aria-label="Delete"]').click();
    
    if (confirm) {
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click on task row/card to open edit modal
   */
  async clickTask(taskName: string) {
    const task = this.getTask(taskName);
    await task.click();
    await this.waitForModal();
  }

  /**
   * Get task count
   */
  async getTaskCount(): Promise<number> {
    const tasks = await this.page.locator('[data-testid="task-row"], [data-testid="task-card"]').count();
    return tasks;
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.page.locator('text=No tasks found').isVisible();
  }

  /**
   * Get task status badge text
   */
  async getTaskStatus(taskName: string): Promise<string | null> {
    const task = this.getTask(taskName);
    const statusBadge = task.locator('[data-testid="status-badge"]');
    return await statusBadge.textContent();
  }

  /**
   * Get task priority badge text
   */
  async getTaskPriority(taskName: string): Promise<string | null> {
    const task = this.getTask(taskName);
    const priorityBadge = task.locator('[data-testid="priority-badge"]');
    return await priorityBadge.textContent();
  }
}