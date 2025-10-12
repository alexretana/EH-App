# Frontend Test Plan - Event Horizon App

## Overview
This test plan covers end-to-end testing of the frontend application using Playwright. Tests assume a working backend and database are available at runtime. The focus is on user interactions, data persistence, error handling, and UI state updates.

## Test Environment Setup

### Prerequisites
- Frontend server running (accessible via Vite dev server)
- Backend API running and accessible
- Database initialized with clean state or seeded data
- Playwright installed and configured

### Base URL
Tests will navigate to the appropriate routes:
- Project View: `/` or `/projects`
- Knowledge Base View: `/knowledge`
- Tasks View: `/tasks`

---

## Project View Tests

### 1. Project CRUD Operations

#### 1.1 Create Project - Success Case
**Test Steps:**
1. Navigate to Project View
2. Click "Add Project" button
3. Fill in required fields:
   - Project Name: "Test Project Alpha"
   - Description: "A test project for validation"
   - Status: "Planning Phase"
   - Time Estimate: 3 months
   - Start Date: (current date)
4. Click "Create Project" button

**Expected Results:**
- Modal closes
- Success toast notification appears: "Project created successfully!"
- New project appears in the project list
- Project card displays correct information

**Verification Points:**
- Project name matches input
- Description matches input
- Status badge shows "Planning Phase"
- Time estimate displays "3 months"
- Start date is formatted correctly

#### 1.2 Create Project - Error Cases
**Test Scenarios:**
a) **Missing Required Field (Name)**
   - Leave project name empty
   - Attempt to submit
   - Expected: Validation error "Project name is required"
   - Modal remains open

b) **Backend Validation Error**
   - Submit invalid data (e.g., invalid date format)
   - Expected: Error alert displays with specific error message
   - Modal remains open

c) **Network Error**
   - Simulate backend unavailable
   - Expected: Error message displayed
   - Modal remains open

#### 1.3 Edit Project - Success Case
**Test Steps:**
1. Click Edit button (pencil icon) on existing project
2. Modify fields:
   - Change status to "Active"
   - Update description
   - Toggle "Active Project" checkbox to true
3. Click "Update Project" button

**Expected Results:**
- Modal closes
- Success toast: "Project updated successfully!"
- Project card updates with new values
- Status badge shows "Active"
- Changes persist after page reload

#### 1.4 Edit Project - Error Cases
**Test Scenarios:**
a) **Clear Required Field**
   - Open edit modal
   - Clear project name
   - Attempt to save
   - Expected: Validation error appears

b) **Backend Update Failure**
   - Simulate backend error during update
   - Expected: Error alert with message
   - Original values preserved

#### 1.5 Delete Project - Success Case
**Test Steps:**
1. Click Delete button (trash icon) on project
2. Confirm deletion in browser dialog
3. Observe result

**Expected Results:**
- Confirmation dialog appears with message: "Are you sure you want to delete this project? This will also delete all associated goals and tasks."
- After confirmation: Project removed from list
- Page updates immediately without reload

#### 1.6 Delete Project - Cancellation
**Test Steps:**
1. Click Delete button
2. Cancel the confirmation dialog

**Expected Results:**
- Project remains in list
- No changes occur

### 2. Goal CRUD Operations (within Project View)

#### 2.1 Expand Project to View Goals
**Test Steps:**
1. Click chevron/expand button on project card
2. Observe animation and content

**Expected Results:**
- Chevron rotates 90 degrees
- Goals section expands smoothly
- Goals list or "No goals yet" message appears
- Card background indicates expanded state

#### 2.2 Collapse Project
**Test Steps:**
1. Click chevron on expanded project
2. Observe collapse animation

**Expected Results:**
- Chevron rotates back to 0 degrees
- Goals section collapses smoothly
- Card returns to collapsed state

#### 2.3 Create Goal - Success Case
**Test Steps:**
1. Expand project
2. Click "Add New Goal" button
3. Fill in form:
   - Goal Name: "Q1 Milestone"
   - Description: "First quarter objectives"
   - Status: "Not started"
   - Scope: "Monthly"
   - Due Date: (future date)
4. Click "Create Goal"

**Expected Results:**
- Modal closes
- Success toast: "Goal created successfully!"
- Goal appears in project's goal list
- Goal displays correct information
- Task count shows "0/0 tasks completed"

#### 2.4 Create Goal - Error Cases
**Test Scenarios:**
a) **Missing Goal Name**
   - Leave name empty
   - Expected: Validation error

b) **Invalid Date**
   - Enter past due date (if validation exists)
   - Expected: Appropriate error message

#### 2.5 Edit Goal - Success Case
**Test Steps:**
1. Expand project to show goals
2. Click Edit button on goal
3. Modify:
   - Change status to "Active"
   - Update scope to "Quarterly"
4. Click "Update Goal"

**Expected Results:**
- Modal closes
- Success toast appears
- Goal card updates with new values
- Status badge reflects "Active"

#### 2.6 Delete Goal - Success Case
**Test Steps:**
1. Click Delete button on goal
2. Confirm deletion

**Expected Results:**
- Confirmation dialog: "Are you sure you want to delete this goal? This will also delete all associated tasks."
- Goal removed from list
- Associated tasks also deleted

### 3. Task CRUD Operations (within Goal)

#### 3.1 Expand Goal to View Tasks
**Test Steps:**
1. Expand project
2. Click chevron on goal to expand
3. Observe tasks section

**Expected Results:**
- Chevron rotates 90 degrees
- Tasks section expands
- Tasks list or "No tasks yet" message appears
- "Add New Task" button visible

#### 3.2 Collapse Goal
**Test Steps:**
1. Click chevron on expanded goal
2. Observe collapse

**Expected Results:**
- Tasks section collapses smoothly
- Chevron returns to original position

#### 3.3 Create Task - Success Case
**Test Steps:**
1. Expand project and goal
2. Click "Add New Task" button
3. Fill in form:
   - Task Name: "Design database schema"
   - Description: "Create initial ERD"
   - Status: "Not started"
   - Task Type: "Develop"
   - Priority: "High"
   - Effort Level: "Medium"
   - Time Estimate: 120 minutes
   - Due Date: (future date)
   - Goal: (should be pre-selected)
4. Click "Create Task"

**Expected Results:**
- Modal closes
- Success toast appears
- Task appears in goal's task list
- Task displays all information correctly
- Time estimate shows "120 min"
- Priority and task type badges display correctly

#### 3.4 Create Task - Error Cases
**Test Scenarios:**
a) **Missing Task Name**
   - Leave name empty
   - Expected: Validation error

b) **Invalid Time Estimate**
   - Enter 0 or negative value
   - Expected: "Time estimate is required" error

c) **Missing Goal Selection**
   - Clear goal selection
   - Expected: "Goal is required" error

#### 3.5 Edit Task - Success Case
**Test Steps:**
1. Navigate to task within expanded goal
2. Click Edit button on task
3. Modify:
   - Change status to "Active"
   - Update priority to "Medium"
4. Click "Update Task"

**Expected Results:**
- Modal closes
- Success toast appears
- Task card updates
- Status and priority badges update
- Appropriate status buttons appear (e.g., "Complete" button for Active tasks)

#### 3.6 Delete Task - Success Case
**Test Steps:**
1. Click Delete button on task
2. Confirm deletion

**Expected Results:**
- Confirmation: "Are you sure you want to delete this task?"
- Task removed from list
- Goal's task completion count updates

#### 3.7 Task Status Transitions
**Test Scenarios:**

a) **Start Task (Not started → Active)**
   - Click "Start" button on task with "Not started" status
   - Expected: Status changes to "Active", badge updates

b) **Complete Task (Active → Done)**
   - Click "Complete" button on task with "Active" status
   - Expected: Status changes to "Done", badge updates, completion count increases

c) **Pause Task (Active → Not started)**
   - On active task in TaskDataTable, click Pause
   - Expected: Status reverts to "Not started"

d) **Reactivate Task (Done/Cancelled → Active)**
   - On completed or cancelled task, click Reactivate
   - Expected: Status changes to "Active"

### 4. Button Interaction Tests

#### 4.1 All Modal Cancel Buttons
**Test for each modal type (Project, Goal, Task):**
1. Open modal
2. Fill in some data
3. Click "Cancel" button

**Expected Results:**
- Modal closes
- No data saved
- No changes to list

#### 4.2 Modal Close via Overlay
**Test for each modal:**
1. Open modal
2. Click outside modal area (on overlay)

**Expected Results:**
- Modal closes
- No data saved

#### 4.3 Modal Close via X Button
**Test for each modal (if X button exists):**
1. Open modal
2. Click X button

**Expected Results:**
- Modal closes
- No data saved

---

## Knowledge Base View Tests

### 1. Document CRUD Operations

#### 1.1 Create Document - Success Case
**Test Steps:**
1. Navigate to Knowledge Base View
2. Click "Add Document" button
3. Fill in "Content" tab:
   - Document Name: "API Documentation"
   - Content: "# API Guide\n\nThis is markdown content..."
4. Switch to "AI Summary" tab
5. Add summary: "Documentation for REST API endpoints"
6. Switch to "Citations" tab
7. Add citation URL: "https://example.com/api-guide"
8. Click "Add" button for citation
9. Click "Create Document"

**Expected Results:**
- Modal closes
- Success toast: "Document created successfully!"
- Document card appears in grid
- Card shows document name, date, and summary preview
- Citation count badge shows "1 citation"

#### 1.2 Create Document - Error Cases
**Test Scenarios:**
a) **Missing Document Name**
   - Leave name empty
   - Expected: Validation error

b) **Backend Error**
   - Simulate backend failure
   - Expected: Error alert with message

#### 1.3 Edit Document - Success Case
**Test Steps:**
1. Click "Edit" button on document card
2. Modify content
3. Add another citation
4. Click "Update Document"

**Expected Results:**
- Modal closes
- Success toast appears
- Document card updates with new information
- Citation count updates

#### 1.4 Delete Document - Success Case
**Test Steps:**
1. Click Delete button (trash icon) on document card
2. Confirm deletion

**Expected Results:**
- Confirmation: "Are you sure you want to delete this document?"
- Document removed from grid
- Grid re-layouts smoothly

#### 1.5 Read Document
**Test Steps:**
1. Click "Read" button on document card
2. Observe modal content

**Expected Results:**
- Read modal opens
- Document name displayed as title
- AI Summary section shows (if present)
- Content section renders markdown correctly
- Citations section displays all links
- Citations are clickable and open in new tab
- Modal scrollable if content is long

### 2. Attachment Management

#### 2.1 Upload Attachment - Success Case
**Test Steps:**
1. Create and save a new document (attachments require saved document)
2. Click "Edit" on the document
3. Navigate to "Attachment" tab
4. Click "Upload File Attachment" button
5. Select a file from file picker
6. Wait for upload to complete

**Expected Results:**
- Upload button shows "Uploading..." during upload
- Success toast: "File uploaded successfully!"
- File information card appears showing filename
- Download and Delete buttons visible

#### 2.2 Upload Attachment - Error Cases
**Test Scenarios:**
a) **Upload Before Saving Document**
   - Try to upload attachment on new document
   - Expected: Warning message: "Please save the document first before uploading attachments."
   - Upload button disabled

b) **Upload Failure**
   - Simulate backend error
   - Expected: Error toast: "Failed to upload file"

#### 2.3 Download Attachment - Success Case
**Test Steps:**
1. Navigate to document with attachment
2. Click "Edit" button
3. Go to "Attachment" tab
4. Click "Download" button

**Expected Results:**
- File downloads to browser's download location
- Success toast: "File downloaded successfully!"
- Original filename preserved

#### 2.4 Update Attachment (Replace)
**Test Steps:**
1. Edit document with existing attachment
2. Go to "Attachment" tab
3. Upload a new file (which replaces the old one)

**Expected Results:**
- New file replaces old file
- New filename displays
- Success toast appears

#### 2.5 Delete Attachment - Success Case
**Test Steps:**
1. Edit document with attachment
2. Go to "Attachment" tab
3. Click Delete button (X icon)

**Expected Results:**
- Attachment removed
- Success toast: "File deleted successfully!"
- Upload button appears again

### 3. Citations Management

#### 3.1 Add Multiple Citations
**Test Steps:**
1. Edit document
2. Go to "Citations" tab
3. Add citation: "https://example.com/ref1"
4. Click "Add"
5. Add citation: "https://example.com/ref2"
6. Click "Add"

**Expected Results:**
- Both citations appear in list
- Each citation has clickable link
- Each citation has delete button

#### 3.2 Remove Citation
**Test Steps:**
1. Edit document with citations
2. Go to "Citations" tab
3. Click X button on a citation

**Expected Results:**
- Citation removed from list immediately
- Remaining citations still visible

#### 3.3 Citations Display in Read Modal
**Test Steps:**
1. View document with citations using "Read" button
2. Check Citations section

**Expected Results:**
- All citations listed
- Links are clickable
- Open in new tab with rel="noopener noreferrer"

---

## Tasks View Tests

### 1. Filter Controls

#### 1.1 Filter: All Tasks
**Test Steps:**
1. Navigate to Tasks View
2. Ensure "All" filter is selected (default)

**Expected Results:**
- All tasks from all projects and goals display
- Task count accurate

#### 1.2 Filter: Active Projects
**Test Steps:**
1. Select "Active Projects" filter
2. Observe task list

**Expected Results:**
- Only tasks from projects with `is_active: true` display
- Other tasks hidden
- Task count updates

#### 1.3 Filter: Active Goals
**Test Steps:**
1. Select "Active Goals" filter
2. Observe task list

**Expected Results:**
- Only tasks from goals with status "Active" display
- Tasks from Weekly-Milestone goals excluded
- Task count updates

#### 1.4 Filter: Active Milestones
**Test Steps:**
1. Select "Active Milestones" filter
2. Observe task list

**Expected Results:**
- Only tasks from goals with status "Active" AND scope "Weekly-Milestone" display
- Task count updates

### 2. Sorting Controls

#### 2.1 Sort by Status
**Test Steps:**
1. Select "Status" from sort dropdown
2. Observe task order

**Expected Results:**
- Tasks ordered: Active → Not started → Done → Cancelled
- Within same status, sorted by most recent update

#### 2.2 Sort by Dependency Order
**Test Steps:**
1. Select "Dependency Order" from sort dropdown
2. Observe task order

**Expected Results:**
- Tasks sorted according to dependency logic
- (Note: Implementation may default to recent order if dependencies not fully implemented)

### 3. View Mode Toggle

#### 3.1 Table View (Desktop)
**Test Steps:**
1. Navigate to Tasks View on desktop
2. Ensure "Table" view selected

**Expected Results:**
- Tasks displayed in table format
- Columns: Task, Project/Goal, Type, Priority, Status, Estimate, Due Date, Actions
- All data visible in columns
- Table scrollable horizontally if needed

#### 3.2 Kanban View
**Test Steps:**
1. Click "Kanban" view button

**Expected Results:**
- Message: "Kanban view coming soon..."
- (Test to be expanded when Kanban implemented)

#### 3.3 Card View (Mobile)
**Test Steps:**
1. Open Tasks View on mobile viewport
2. Observe display

**Expected Results:**
- Tasks displayed as cards
- Each card shows: name, description, badges (type, priority, status), time estimate, due date
- Action buttons accessible
- Cards scrollable vertically

### 4. Task Status Buttons (TaskDataTable)

#### 4.1 Start Button (Not started tasks)
**Test Steps:**
1. Find task with "Not started" status
2. Click Play icon button

**Expected Results:**
- Task status updates to "Active"
- Status badge changes color
- Button changes to Pause and Complete buttons
- Table/card re-renders to show updated state

#### 4.2 Complete Button (Active tasks)
**Test Steps:**
1. Find task with "Active" status
2. Click CheckCircle button

**Expected Results:**
- Task status updates to "Done"
- Status badge updates
- Buttons change to Reactivate option

#### 4.3 Pause Button (Active tasks)
**Test Steps:**
1. Find active task
2. Click Pause button

**Expected Results:**
- Task status reverts to "Not started"
- Status badge updates
- Start button reappears

#### 4.4 Cancel Button (Any task)
**Test Steps:**
1. Find any task
2. Click XCircle (cancel) button

**Expected Results:**
- Task status changes to "Cancelled"
- Status badge updates
- Reactivate button appears

#### 4.5 Reactivate Button (Done/Cancelled tasks)
**Test Steps:**
1. Find task with "Done" or "Cancelled" status
2. Click RotateCcw (Reactivate) button

**Expected Results:**
- Task status changes to "Active"
- Status badge updates
- Active task buttons appear

### 5. Add Task from Tasks View

#### 5.1 Create Task - Success Case
**Test Steps:**
1. Click "Add Task" button at top of view
2. Fill in complete form
3. Select project (which filters goals)
4. Select goal from filtered list
5. Click "Create Task"

**Expected Results:**
- Modal closes
- Success toast appears
- Task appears in table/card list
- Filters still apply correctly

#### 5.2 Project Selection Updates Goals
**Test Steps:**
1. Open Add Task modal
2. Change project selection
3. Observe goal dropdown

**Expected Results:**
- Goal dropdown updates to show only goals from selected project
- First goal auto-selected
- If no goals exist for project, goal dropdown disabled

### 6. Edit Task from Table

#### 6.1 Edit via Edit Button
**Test Steps:**
1. Click Edit (pencil) button on task row/card
2. Modify task details
3. Save changes

**Expected Results:**
- Modal opens with task data pre-filled
- Changes save successfully
- Table/card updates immediately

#### 6.2 Edit via Row Click (Desktop)
**Test Steps:**
1. Click anywhere on task row (except action buttons)
2. Observe modal

**Expected Results:**
- Edit modal opens
- Task data pre-filled
- Same behavior as clicking Edit button

#### 6.3 Edit via Card Click (Mobile)
**Test Steps:**
1. Click on task card area (except action buttons)
2. Observe modal

**Expected Results:**
- Edit modal opens
- Task data pre-filled

---

## Error Handling & Edge Cases

### 1. Network Errors

#### 1.1 Backend Unavailable on Load
**Test Steps:**
1. Stop backend
2. Navigate to any view
3. Observe behavior

**Expected Results:**
- Loading state appears initially
- Error state or empty state after timeout
- User-friendly message displayed

#### 1.2 Backend Unavailable on Create/Update
**Test Steps:**
1. Stop backend
2. Attempt to create/update any entity
3. Observe error handling

**Expected Results:**
- Error alert appears in modal
- Modal remains open
- User can retry after fixing connection

### 2. Validation Errors

#### 2.1 Client-Side Validation
**Test Scenarios:**
- Empty required fields
- Invalid number inputs (negative, zero where not allowed)
- Invalid date formats

**Expected Results:**
- Form validation prevents submission
- Error messages display below fields
- Focus moves to first error

#### 2.2 Server-Side Validation
**Test Scenarios:**
- Data that passes client validation but fails server validation
- Foreign key violations (e.g., invalid goal_id)

**Expected Results:**
- Error alert displays server error message
- Field-specific errors shown when available
- Modal remains open for correction

### 3. Empty States

#### 3.1 No Projects
**Test Steps:**
1. Navigate to Project View with empty database
2. Observe display

**Expected Results:**
- Empty state card displays
- Message: "Create Your First Project"
- "Create Project" button visible

#### 3.2 No Documents
**Test Steps:**
1. Navigate to Knowledge Base View with no documents
2. Observe display

**Expected Results:**
- Empty state with file icon
- Message: "No Documents Yet"
- "Create Document" button visible

#### 3.3 No Tasks (or Filtered Out)
**Test Steps:**
1. Apply filter that excludes all tasks
2. Observe display

**Expected Results:**
- Empty state message
- Message explains filter situation
- "Add Task" button available

### 4. Loading States

#### 4.1 Initial Load
**For each view:**
1. Navigate to view
2. Observe loading state

**Expected Results:**
- Glass card with "Loading..." message
- Smooth transition to content when loaded

#### 4.2 Submitting Forms
**For each modal:**
1. Submit form
2. Observe button state during save

**Expected Results:**
- Submit button shows "Saving..." text
- Button disabled during save
- Cannot close modal during save

---

## UI State Verification

### 1. Animations & Transitions

#### 1.1 Project/Goal Expansion
- Chevron rotation smooth (90 degrees)
- Content expands/collapses with height animation
- No layout jank

#### 1.2 Modal Open/Close
- Modal fades in smoothly
- Overlay appears
- Modal closes smoothly on any close action

#### 1.3 List Item Add/Remove
- New items animate in (fade + slide)
- Removed items animate out
- List re-flows smoothly

### 2. Responsive Behavior

#### 2.1 Desktop View
- Project cards display properly
- Modals centered with max-width
- Tables display all columns
- Hover states work on buttons

#### 2.2 Mobile View
- Cards stack vertically
- Modals take most of screen
- Tables convert to cards (TaskDataTable)
- Touch targets adequately sized

### 3. Data Persistence

#### 3.1 After Creation
- Reload page
- Verify created item still exists

#### 3.2 After Update
- Reload page
- Verify updates persisted

#### 3.3 After Deletion
- Reload page
- Verify item remains deleted

### 4. Toast Notifications

**For all operations, verify:**
- Success toasts appear for successful operations
- Toast auto-dismisses after timeout
- Toast position consistent (likely top-right)
- Multiple toasts stack properly

---

## Test Execution Strategy

### Phase 1: Smoke Tests
- Basic CRUD for Projects
- Basic CRUD for Goals
- Basic CRUD for Tasks
- Basic CRUD for Knowledge Base

### Phase 2: Detailed Interaction Tests
- All button interactions
- All modal behaviors
- Expand/collapse functionality
- Filter and sort controls

### Phase 3: Error & Edge Cases
- All validation scenarios
- Network error scenarios
- Empty states
- Loading states

### Phase 4: UI/UX Tests
- Animations and transitions
- Responsive behavior
- Data persistence verification
- Cross-browser testing (if required)

---

## Test Data Requirements

### Minimum Test Data Set
- **3 Projects** with varying statuses
- **6 Goals** (2 per project, mix of scopes)
- **12 Tasks** (2 per goal, varying statuses)
- **5 Knowledge Base Documents** (some with attachments, some with citations)

### Test Data Characteristics
- Projects: Mix of active/inactive, different statuses
- Goals: Mix of Monthly, Quarterly, Weekly-Milestone
- Tasks: All status types represented, various priorities
- Documents: Some with attachments, some without, various citation counts

---

## Notes & Considerations

1. **Manual Setup Required**: Tests assume environment is manually set up with backend and database running

2. **Test Independence**: Each test should be independent and not rely on state from previous tests (or use seed data reset between test runs)

3. **Playwright Features**: Utilize Playwright's:
   - Page object model for reusable components
   - Locators for stable element selection
   - Auto-waiting for elements
   - Screenshot capture on failure

4. **Browser Dialog Handling**: Use `page.on('dialog')` to handle `window.confirm()` dialogs for delete operations

5. **File Upload Testing**: Use Playwright's `setInputFiles()` for file attachment testing

6. **Accessibility**: Consider adding aria-label checks for better test stability

7. **Animation Considerations**: May need to wait for animations to complete before assertions

8. **API Mocking** (Future): While current plan assumes real backend, consider adding tests with mocked API responses for error scenarios

---

## Success Criteria

- All CRUD operations work for Projects, Goals, Tasks, and Knowledge Base
- All buttons perform expected actions
- All error cases display appropriate messages
- UI updates reflect backend changes
- No console errors during normal operation
- Animations smooth without jank
- Tests pass consistently across multiple runs