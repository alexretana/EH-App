# Frontend Component Structure

This document outlines the detailed component structure for the Event Horizon frontend application.

## Component Hierarchy

```
App
├── AppProvider (Context Provider)
├── Router
└── Layout
    ├── Header
    │   ├── Logo
    │   └── MenuToggle
    ├── NavigationDrawer
    │   ├── NavigationHeader
    │   ├── NavigationList
    │   │   └── NavigationItem
    │   └── NavigationFooter
    └── MainContent
        ├── ProjectView
        │   ├── ProjectHeader
        │   │   ├── Title
        │   │   └── AddProjectButton
        │   ├── ProjectList
        │   │   ├── ProjectItem
        │   │   │   ├── ProjectInfo
        │   │   │   ├── ProjectActions
        │   │   │   └── GoalList
        │   │   │       ├── GoalItem
        │   │   │       │   ├── GoalInfo
        │   │   │       │   ├── GoalActions
        │   │   │       │   └── TaskList
        │   │   │       │       ├── TaskItem
        │   │   │       │       │   ├── TaskInfo
        │   │   │       │       │   └── TaskActions
        │   │   │       │       └── AddTaskButton
        │   │   │       └── AddGoalButton
        │   │   └── EmptyState
        │   ├── CreateProjectModal
        │   ├── EditProjectModal
        │   ├── CreateGoalModal
        │   ├── EditGoalModal
        │   ├── CreateTaskModal
        │   └── EditTaskModal
        ├── KnowledgeBaseView
        │   ├── KnowledgeHeader
        │   │   ├── Title
        │   │   └── AddDocumentButton
        │   ├── DocumentGallery
        │   │   ├── DocumentCard
        │   │   │   ├── DocumentInfo
        │   │   │   ├── DocumentPreview
        │   │   │   └── DocumentActions
        │   │   └── EmptyState
        │   ├── CreateDocumentModal
        │   └── DocumentModal
        │       ├── DocumentHeader
        │       ├── DocumentContent
        │       └── DocumentActions
        └── TaskView
            ├── TaskHeader
            │   ├── Title
            │   ├── ViewToggle
            │   ├── FilterOptions
            │   └── SortOptions
            ├── ChecklistView
            │   ├── TaskList
            │   │   ├── TaskItem
            │   │   │   ├── TaskInfo
            │   │   │   └── TaskActions
            │   │   └── EmptyState
            ├── KanbanView
            │   ├── KanbanBoard
            │   │   ├── KanbanColumn
            │   │   │   ├── ColumnHeader
            │   │   │   ├── TaskCard
            │   │   │   │   ├── TaskInfo
            │   │   │   │   └── TaskActions
            │   │   │   └── AddTaskButton
            │   │   └── EmptyState
            ├── CreateTaskModal
            └── EditTaskModal
```

## Key Components Description

### Layout Components

#### Header
- Contains the application logo and menu toggle button
- Fixed position at the top of the screen
- Glassmorphic styling with backdrop blur

#### NavigationDrawer
- Slide-out drawer with navigation items
- Hideable with smooth animations
- Contains links to Projects, Knowledge Base, and Tasks views

### Project View Components

#### ProjectItem
- Displays project information (name, status, time estimate)
- Edit and expand/collapse buttons
- Expandable to show related goals

#### GoalItem
- Displays goal information (name, status, time frame)
- Edit and add milestone buttons for monthly/quarterly goals
- Edit and expand/collapse buttons for weekly milestones
- Expandable to show related tasks

#### TaskItem
- Displays task information (name, status, time estimate)
- Edit button and status update buttons
- Status buttons change based on current task status

### Knowledge Base Components

#### DocumentCard
- Displays document information in gallery view
- Shows document name, attachment icon, last updated date
- Truncated content preview
- Read and Edit buttons

#### DocumentModal
- Modal for viewing and editing documents
- Toggle between read and edit modes
- Markdown rendering in read mode
- Text editing in edit mode

### Task View Components

#### ChecklistView
- List view of all tasks based on selected filters
- Task items with full information and actions
- Radio buttons for filtering options
- Sort button for ordering tasks

#### KanbanView
- Standard kanban board with columns for different task statuses
- Drag and drop functionality for moving tasks between columns
- Task cards with essential information

## Reusable Components

### Form Components
- GlassmorphicInput
- GlassmorphicTextarea
- GlassmorphicSelect
- GlassmorphicCheckbox
- GlassmorphicRadioGroup

### Display Components
- GlassmorphicCard
- GlassmorphicBadge
- GlassmorphicButton
- GlassmorphicModal
- GlassmorphicDrawer

### Utility Components
- LoadingSpinner
- EmptyState
- ErrorBoundary
- StatusIndicator

## Data Flow

### State Management
- Global state managed through React Context
- Each view has its own state slice
- Mock data functions simulate API calls

### Props Structure
- Components receive data through props
- Callback functions for actions passed down
- Minimal prop drilling through context usage

## Styling Approach

### Glassmorphic Classes
- Base glass class for all glassmorphic elements
- Hover variants for interactive elements
- Size variants for different component scales

### Responsive Design
- Mobile-first approach
- Breakpoint-specific adjustments
- Touch-friendly interaction areas

## Animation Strategy

### Page Transitions
- Fade transitions between views
- Slide animations for drawer navigation
- Stagger animations for list items

### Micro-interactions
- Hover effects on buttons and cards
- Smooth expand/collapse animations
- Loading states with skeleton screens