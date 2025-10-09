import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common functionality shared across all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific route
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for toast notification to appear
   */
  async waitForToast(message?: string): Promise<Locator> {
    const toast = this.page.locator('[data-sonner-toast]');
    await toast.waitFor({ state: 'visible' });
    if (message) {
      await this.page.locator(`text=${message}`).waitFor({ state: 'visible' });
    }
    return toast;
  }

  /**
   * Handle browser confirm dialogs
   */
  async handleConfirmDialog(accept: boolean = true): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for loading state to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click button by text
   */
  async clickButton(text: string): Promise<void> {
    await this.page.getByRole('button', { name: text }).click();
  }

  /**
   * Fill input by label
   */
  async fillInput(label: string, value: string): Promise<void> {
    await this.page.getByLabel(label).fill(value);
  }

  /**
   * Select option by label
   */
  async selectOption(label: string, value: string): Promise<void> {
    await this.page.getByLabel(label).click();
    await this.page.getByRole('option', { name: value }).click();
  }

  /**
   * Wait for modal to open
   */
  async waitForModal(): Promise<Locator> {
    const modal = this.page.locator('[role="dialog"]');
    await modal.waitFor({ state: 'visible' });
    return modal;
  }

  /**
   * Close modal by clicking overlay
   */
  async closeModalByOverlay(): Promise<void> {
    await this.page.locator('[role="dialog"]').press('Escape');
  }

  /**
   * Close modal by X button
   */
  async closeModalByButton(): Promise<void> {
    await this.page.locator('[role="dialog"] button[aria-label="Close"]').click();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }

  /**
   * Reload page and wait for it to load
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.waitForLoadingComplete();
  }
}