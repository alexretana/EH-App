import { test, expect } from '@playwright/test';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';

test.describe('Knowledge Base View - CRUD Operations', () => {
  let knowledgePage: KnowledgeBasePage;

  test.beforeEach(async ({ page }) => {
    knowledgePage = new KnowledgeBasePage(page);
    await knowledgePage.navigate();
  });

  test.describe('Create Document', () => {
    test('should create a new document successfully', async ({ page }) => {
      const documentData = {
        name: 'API Documentation',
        content: '# API Guide\n\nThis is markdown content for the API guide.',
        aiSummary: 'Documentation for REST API endpoints',
        citations: ['https://example.com/api-guide', 'https://example.com/api-reference'],
      };

      await knowledgePage.createDocument(documentData);

      const documentCard = knowledgePage.getDocumentCard(documentData.name);
      await expect(documentCard).toBeVisible();
      await expect(documentCard).toContainText(documentData.name);
      await expect(documentCard).toContainText('2 citation');
    });

    test('should show validation error when document name is missing', async ({ page }) => {
      await knowledgePage.openAddDocumentModal();
      
      await knowledgePage.clickButton('Create Document');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(page.getByText(/document name is required/i)).toBeVisible();
    });

    test('should close modal on cancel', async ({ page }) => {
      await knowledgePage.openAddDocumentModal();
      
      await knowledgePage.fillInput('Document Name', 'Test Document');
      await knowledgePage.clickButton('Cancel');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
      
      await expect(knowledgePage.getDocumentCard('Test Document')).not.toBeVisible();
    });
  });

  test.describe('Edit Document', () => {
    test.beforeEach(async () => {
      await knowledgePage.createDocument({
        name: 'Edit Test Document',
        content: 'Original content',
        aiSummary: 'Original summary',
      });
    });

    test('should edit document successfully', async ({ page }) => {
      await knowledgePage.editDocument('Edit Test Document', {
        content: 'Updated content',
        aiSummary: 'Updated summary',
        addCitations: ['https://example.com/new-citation'],
      });

      const documentCard = knowledgePage.getDocumentCard('Edit Test Document');
      await expect(documentCard).toBeVisible();
      
      // Verify persistence
      await knowledgePage.reloadPage();
      await expect(documentCard).toBeVisible();
    });
  });

  test.describe('Delete Document', () => {
    test.beforeEach(async () => {
      await knowledgePage.createDocument({
        name: 'Delete Test Document',
        content: 'To be deleted',
      });
    });

    test('should delete document with confirmation', async ({ page }) => {
      await knowledgePage.deleteDocument('Delete Test Document', true);
      
      await expect(knowledgePage.getDocumentCard('Delete Test Document')).not.toBeVisible();
    });

    test('should cancel deletion', async ({ page }) => {
      await knowledgePage.deleteDocument('Delete Test Document', false);
      
      await expect(knowledgePage.getDocumentCard('Delete Test Document')).toBeVisible();
    });
  });

  test.describe('Read Document', () => {
    test.beforeEach(async () => {
      await knowledgePage.createDocument({
        name: 'Read Test Document',
        content: '# Test Content\n\nThis is test markdown content.',
        aiSummary: 'Test summary',
        citations: ['https://example.com/citation1', 'https://example.com/citation2'],
      });
    });

    test('should open read modal and display document content', async ({ page }) => {
      await knowledgePage.readDocument('Read Test Document');
      
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Read Test Document');
      await expect(modal).toContainText('Test summary');
      await expect(modal).toContainText('Test Content');
      
      // Check citations are visible
      await expect(modal.locator('a[href="https://example.com/citation1"]')).toBeVisible();
      await expect(modal.locator('a[href="https://example.com/citation2"]')).toBeVisible();
    });

    test('should have clickable citations that open in new tab', async ({ page }) => {
      await knowledgePage.readDocument('Read Test Document');
      
      const modal = page.locator('[role="dialog"]');
      const citationLink = modal.locator('a[href="https://example.com/citation1"]');
      
      await expect(citationLink).toHaveAttribute('target', '_blank');
      await expect(citationLink).toHaveAttribute('rel', /noopener/);
    });
  });

  test.describe('Citations Management', () => {
    test.beforeEach(async () => {
      await knowledgePage.createDocument({
        name: 'Citations Test Document',
        content: 'Test content',
        citations: ['https://example.com/citation1'],
      });
    });

    test('should add multiple citations', async ({ page }) => {
      await knowledgePage.editDocument('Citations Test Document', {
        addCitations: ['https://example.com/citation2', 'https://example.com/citation3'],
      });

      const citationCount = await knowledgePage.getCitationCount('Citations Test Document');
      expect(citationCount).toBe(3);
    });

    test('should remove citation', async ({ page }) => {
      await knowledgePage.editDocument('Citations Test Document', {
        addCitations: ['https://example.com/citation2'],
      });

      await knowledgePage.removeCitation('Citations Test Document', 'https://example.com/citation1');

      const citationCount = await knowledgePage.getCitationCount('Citations Test Document');
      expect(citationCount).toBe(1);
    });
  });

  test.describe('Empty State', () => {
    test('should show empty state when no documents exist', async ({ page }) => {
      const isEmpty = await knowledgePage.isEmptyStateVisible();
      
      if (isEmpty) {
        await expect(page.getByText(/no documents yet/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create document/i })).toBeVisible();
      }
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist created document after page reload', async ({ page }) => {
      const documentData = {
        name: 'Persistence Test Document',
        content: 'Testing persistence',
        aiSummary: 'Persistence test',
      };

      await knowledgePage.createDocument(documentData);
      
      await knowledgePage.reloadPage();
      
      const documentCard = knowledgePage.getDocumentCard(documentData.name);
      await expect(documentCard).toBeVisible();
    });
  });
});

test.describe('Knowledge Base - Attachment Management', () => {
  let knowledgePage: KnowledgeBasePage;

  test.beforeEach(async ({ page }) => {
    knowledgePage = new KnowledgeBasePage(page);
    await knowledgePage.navigate();
    
    // Create a document for attachment testing
    await knowledgePage.createDocument({
      name: 'Attachment Test Document',
      content: 'Document for attachment testing',
    });
  });

  test.describe('Upload Attachment', () => {
    test('should show warning when trying to upload before saving document', async ({ page }) => {
      await knowledgePage.openAddDocumentModal();
      
      await page.getByRole('tab', { name: /attachment/i }).click();
      
      await expect(page.getByText(/please save the document first/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /upload file/i })).toBeDisabled();
    });

    // Note: Actual file upload testing would require a test file
    // This is a placeholder for the structure
    test.skip('should upload attachment successfully', async ({ page }) => {
      // This test would require creating a test file and uploading it
      // await knowledgePage.uploadAttachment('Attachment Test Document', 'path/to/test/file.pdf');
      // await expect(page.getByText(/file uploaded successfully/i)).toBeVisible();
    });
  });

  test.describe('Download Attachment', () => {
    test.skip('should download attachment successfully', async ({ page }) => {
      // This test requires an existing attachment
      // const download = await knowledgePage.downloadAttachment('Attachment Test Document');
      // expect(download).toBeTruthy();
    });
  });

  test.describe('Delete Attachment', () => {
    test.skip('should delete attachment successfully', async ({ page }) => {
      // This test requires an existing attachment
      // await knowledgePage.deleteAttachment('Attachment Test Document');
      // await expect(page.getByText(/file deleted successfully/i)).toBeVisible();
    });
  });
});