import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Knowledge Base View
 */
export class KnowledgeBasePage extends BasePage {
  // Locators
  readonly addDocumentButton: Locator;
  readonly documentCards: Locator;

  constructor(page: Page) {
    super(page);
    this.addDocumentButton = page.getByRole('button', { name: /add document/i });
    this.documentCards = page.locator('[data-testid="document-card"]');
  }

  /**
   * Navigate to Knowledge Base View
   */
  async navigate() {
    await this.goto('/knowledge');
    await this.waitForLoadingComplete();
  }

  /**
   * Open Add Document modal
   */
  async openAddDocumentModal() {
    await this.addDocumentButton.click();
    await this.waitForModal();
  }

  /**
   * Create a new document
   */
  async createDocument(data: {
    name: string;
    content?: string;
    aiSummary?: string;
    citations?: string[];
  }) {
    await this.openAddDocumentModal();

    // Content tab (should be default)
    await this.fillInput('Document Name', data.name);
    
    if (data.content) {
      await this.page.getByLabel('Content').fill(data.content);
    }

    // AI Summary tab
    if (data.aiSummary) {
      await this.page.getByRole('tab', { name: /ai summary/i }).click();
      await this.page.getByLabel('AI Summary').fill(data.aiSummary);
    }

    // Citations tab
    if (data.citations && data.citations.length > 0) {
      await this.page.getByRole('tab', { name: /citations/i }).click();
      
      for (const citation of data.citations) {
        await this.page.getByPlaceholder(/citation url/i).fill(citation);
        await this.page.getByRole('button', { name: /^add$/i }).click();
      }
    }

    await this.clickButton('Create Document');
    await this.waitForToast('Document created successfully!');
  }

  /**
   * Get document card by name
   */
  getDocumentCard(name: string): Locator {
    return this.page.locator(`[data-testid="document-card"]:has-text("${name}")`);
  }

  /**
   * Read document
   */
  async readDocument(documentName: string) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /read/i }).click();
    await this.waitForModal();
  }

  /**
   * Edit document
   */
  async editDocument(documentName: string, updates: {
    name?: string;
    content?: string;
    aiSummary?: string;
    addCitations?: string[];
  }) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /edit/i }).click();
    await this.waitForModal();

    if (updates.name) {
      await this.fillInput('Document Name', updates.name);
    }

    if (updates.content) {
      await this.page.getByLabel('Content').fill(updates.content);
    }

    if (updates.aiSummary) {
      await this.page.getByRole('tab', { name: /ai summary/i }).click();
      await this.page.getByLabel('AI Summary').fill(updates.aiSummary);
    }

    if (updates.addCitations && updates.addCitations.length > 0) {
      await this.page.getByRole('tab', { name: /citations/i }).click();
      
      for (const citation of updates.addCitations) {
        await this.page.getByPlaceholder(/citation url/i).fill(citation);
        await this.page.getByRole('button', { name: /^add$/i }).click();
      }
    }

    await this.clickButton('Update Document');
    await this.waitForToast('Document updated successfully!');
  }

  /**
   * Delete document
   */
  async deleteDocument(documentName: string, confirm: boolean = true) {
    const card = this.getDocumentCard(documentName);
    await this.handleConfirmDialog(confirm);
    await card.locator('button[aria-label="Delete"]').click();
    
    if (confirm) {
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Upload attachment to document
   */
  async uploadAttachment(documentName: string, filePath: string) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /edit/i }).click();
    await this.waitForModal();

    // Go to Attachment tab
    await this.page.getByRole('tab', { name: /attachment/i }).click();

    // Upload file
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    
    await this.waitForToast('File uploaded successfully!');
  }

  /**
   * Download attachment from document
   */
  async downloadAttachment(documentName: string) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /edit/i }).click();
    await this.waitForModal();

    await this.page.getByRole('tab', { name: /attachment/i }).click();
    
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: /download/i }).click();
    const download = await downloadPromise;
    
    await this.waitForToast('File downloaded successfully!');
    return download;
  }

  /**
   * Delete attachment from document
   */
  async deleteAttachment(documentName: string) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /edit/i }).click();
    await this.waitForModal();

    await this.page.getByRole('tab', { name: /attachment/i }).click();
    await this.page.locator('button[aria-label="Delete attachment"]').click();
    
    await this.waitForToast('File deleted successfully!');
  }

  /**
   * Remove citation from document
   */
  async removeCitation(documentName: string, citationUrl: string) {
    const card = this.getDocumentCard(documentName);
    await card.getByRole('button', { name: /edit/i }).click();
    await this.waitForModal();

    await this.page.getByRole('tab', { name: /citations/i }).click();
    
    const citationItem = this.page.locator(`[data-testid="citation-item"]:has-text("${citationUrl}")`);
    await citationItem.locator('button[aria-label="Remove"]').click();
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.page.locator('text=No Documents Yet').isVisible();
  }

  /**
   * Get citation count from document card
   */
  async getCitationCount(documentName: string): Promise<number> {
    const card = this.getDocumentCard(documentName);
    const citationBadge = card.locator('[data-testid="citation-count"]');
    const text = await citationBadge.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0');
  }
}