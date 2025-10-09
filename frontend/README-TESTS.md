# Playwright Test Suite

This directory contains the end-to-end test suite for the Event Horizon App frontend, implemented using Playwright.

## Test Structure

### Page Object Models (`tests/pages/`)
- **BasePage.ts** - Common functionality shared across all pages
- **ProjectPage.ts** - Page object for Project View interactions
- **KnowledgeBasePage.ts** - Page object for Knowledge Base View
- **TasksPage.ts** - Page object for Tasks View

### Test Files
- **project-view.spec.ts** - Tests for Project CRUD operations, expand/collapse, empty states
- **goals.spec.ts** - Tests for Goal CRUD operations within projects
- **tasks-within-goals.spec.ts** - Tests for Task CRUD operations within goals, status transitions
- **knowledge-base.spec.ts** - Tests for Document CRUD, attachments, citations
- **tasks-view.spec.ts** - Tests for filters, sorting, status transitions in Tasks View
- **error-handling.spec.ts** - Tests for validation, empty states, loading states, dialogs
- **ui-state-verification.spec.ts** - Tests for animations, responsive behavior, persistence, accessibility

## Running Tests

### Prerequisites
1. Ensure the backend API is running
2. Ensure the database is initialized
3. Frontend dev server should be running (or will be started automatically by Playwright)

### Commands

Run all tests:
```bash
cd frontend
npx playwright test
```

Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

Run specific test file:
```bash
npx playwright test tests/project-view.spec.ts
```

Run tests in debug mode:
```bash
npx playwright test --debug
```

Run tests in UI mode (recommended for development):
```bash
npx playwright test --ui
```

### View Test Report
```bash
npx playwright show-report
```

## Test Configuration

Configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Browser: Chromium (default)
- Retries: 2 on CI, 0 locally
- Screenshots: On failure
- Traces: On first retry

## Writing New Tests

1. **Use Page Object Models**: Always use the page objects in `tests/pages/` for interacting with the UI
2. **Wait for State**: Use `waitForToast()`, `waitForModal()`, etc. to ensure state changes
3. **Isolate Tests**: Each test should be independent and not rely on other tests
4. **Clean Data**: Tests assume they can create their own test data
5. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested

### Example Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/ProjectPage';

test.describe('Feature Name', () => {
  let projectPage: ProjectPage;

  test.beforeEach(async ({ page }) => {
    projectPage = new ProjectPage(page);
    await projectPage.navigate();
    // Set up test data
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Test Data Management

Tests create their own data and should clean up after themselves where possible. The test plan assumes:
- A working backend API
- A database that can handle test data
- Data isolation between test runs

## Known Limitations

1. **API Mocking**: Currently tests run against the real backend. Some error scenarios are skipped and would require API mocking.
2. **File Uploads**: Attachment upload tests are skipped as they require actual file fixtures.
3. **Browser Dialog**: Confirmation dialogs are tested but require careful handling.

## Debugging Tests

1. **Use UI Mode**: `npx playwright test --ui` for interactive debugging
2. **Use Debug Mode**: `npx playwright test --debug` to step through tests
3. **Screenshots**: Automatically captured on failure in `test-results/`
4. **Traces**: View traces with `npx playwright show-trace trace.zip`

## CI/CD Integration

The test suite is configured to run in CI with:
- Automatic retries on failure
- HTML report generation
- Parallel execution disabled for stability

## Coverage

The test suite covers:
- ✅ Project CRUD operations
- ✅ Goal CRUD operations
- ✅ Task CRUD operations (within goals and Tasks View)
- ✅ Knowledge Base document management
- ✅ Status transitions for tasks
- ✅ Filters and sorting in Tasks View
- ✅ Validation errors (client-side)
- ✅ Modal interactions
- ✅ Empty states
- ✅ Data persistence
- ✅ Animations and UI states
- ✅ Responsive behavior
- ✅ Basic accessibility checks

## Future Improvements

- [ ] Add API mocking for network error scenarios
- [ ] Add file upload testing with fixtures
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add cross-browser testing (Firefox, Safari)
- [ ] Add mobile viewport testing
- [ ] Add more comprehensive accessibility testing