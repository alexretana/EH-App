# Event Horizon Frontend Implementation Plan

Based on your requirements, I'll create a comprehensive plan for building the frontend of your Event Horizon application with React, shadcn/ui, and a glassmorphic theme. The application will have three main views: Project View, Knowledge Base View, and Task View, with full functionality as described in your design document.

## Architecture Overview

The application will be structured as a single-page application (SPA) with the following key components:

1. **Glassmorphic Theme System**: Custom CSS variables and utility classes implementing the glassmorphic design rules
2. **Navigation System**: Drawer-style navigation with hideable sidebar
3. **Data Layer**: Mock data files matching the PostgreSQL schema structure
4. **Component Library**: Extended shadcn/ui components with glassmorphic styling
5. **State Management**: React state management for handling application data
6. **Routing**: Client-side routing between the three main views

## Detailed Implementation Plan

### 1. Glassmorphic Theme Setup

First, I'll update the CSS variables in [`globals.css`](frontend/src/styles/globals.css) to match your specified color palette:

```css
:root {
  /* Custom color variables from design document */
  --bg-dark: oklch(0.1 0.03 310);
  --bg: oklch(0.15 0.03 310);
  --bg-light: oklch(0.2 0.03 310);
  --text: oklch(0.96 0.06 310);
  --text-muted: oklch(0.76 0.06 310);
  --highlight: oklch(0.5 0.06 310);
  --border: oklch(0.4 0.06 310);
  --border-muted: oklch(0.3 0.06 310);
  --primary: oklch(0.76 0.1 310);
  --secondary: oklch(0.76 0.1 130);
  --danger: oklch(0.7 0.06 30);
  --warning: oklch(0.7 0.06 100);
  --success: oklch(0.7 0.06 160);
  --info: oklch(0.7 0.06 260);
  
  /* Glassmorphic utility classes */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

I'll also create utility classes for glassmorphic effects:

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
}
```

### 2. Component Library Extensions

I'll need to add several shadcn/ui components that aren't currently in the project:

- Dialog/Modal components for create/edit forms
- Drawer component for navigation
- Card components for knowledge base items
- Badge components for status indicators
- Select/Dropdown components for form inputs
- Textarea components for descriptions
- Checkbox components for task management
- Radio button components for view options
- Separator components for visual hierarchy

### 3. Mock Data Structure

I'll create mock data files that match your PostgreSQL schema:

```typescript
// types/mockData.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning Phase' | 'Active' | 'Completed' | 'Cancelled';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_validated: boolean;
  time_estimate_months?: number;
  time_estimation_validated: boolean;
  expansion_horizon?: '1 Week' | '2 Weeks' | '3 Weeks';
  milestone_granularity?: 'Monthly' | 'Quarterly' | 'Monthly&Quarterly';
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  scope: 'Monthly' | 'Quarterly' | 'Weekly-Milestone';
  success_criteria?: string;
  due_date?: string;
  project_id: string;
  parent_goal_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'Not started' | 'Active' | 'Done' | 'Cancelled';
  task_type: 'Network' | 'Debug' | 'Review' | 'Develop' | 'Marketing' | 'Provision' | 'Research';
  priority: 'Low' | 'Medium' | 'High';
  effort_level: 'Small' | 'Medium' | 'Large';
  time_estimate_minutes: number;
  due_date?: string;
  date_completed?: string;
  week_start_date?: string;
  assignee?: string;
  goal_id: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  document_name: string;
  content?: string;
  ai_summary?: string;
  file_attachment?: string;
  link_citations?: string[];
  date_added: string;
  created_at: string;
  updated_at: string;
  related_entities?: string[];
  related_entity_ids?: string[];
  entity_types?: string[];
}
```

### 4. Application Structure

The application will have the following folder structure:

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Layout components (Navigation, Sidebar, etc.)
│   ├── projects/     # Project-related components
│   ├── knowledge/    # Knowledge base components
│   ├── tasks/        # Task-related components
│   └── common/       # Reusable components
├── data/
│   ├── mockData.ts   # Mock data files
│   └── api/          # Mock API functions
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── styles/           # CSS and styling
├── types/            # TypeScript type definitions
└── views/            # Main view components
```

### 5. Navigation and Routing

I'll implement a drawer-style navigation with the following structure:

```typescript
// Navigation items
const navigationItems = [
  { name: 'Projects', icon: 'FolderOpen', href: '/projects' },
  { name: 'Knowledge Base', icon: 'BookOpen', href: '/knowledge' },
  { name: 'Tasks', icon: 'CheckSquare', href: '/tasks' }
];
```

The navigation will be hideable with a hamburger menu button and will use React state to manage the open/closed state.

### 6. View Implementations

#### Project View
- List view of projects with expand/collapse for goals
- Create/Edit modals for projects and goals
- Hierarchical display of projects → goals → tasks
- Status management buttons for tasks
- Time estimate display

#### Knowledge Base View
- Gallery view with cards for each document
- Read/Edit modal with markdown rendering
- Document creation and editing
- Project association display

#### Task View
- Two sub-views: Checklist and Kanban
- Filtering options (active projects, goals, milestones)
- Sorting options (dependency order, status)
- Quick status update buttons

### 7. State Management

I'll use React's built-in state management with Context API for global state:

```typescript
// AppContext.tsx
export interface AppContextType {
  projects: Project[];
  goals: Goal[];
  tasks: Task[];
  knowledgeBase: KnowledgeBase[];
  activeProject?: string;
  // CRUD functions for each entity type
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  // ... other CRUD functions
}
```

### 8. Animations and Transitions

I'll integrate Framer Motion for smooth animations:

- Page transitions between views
- Modal open/close animations
- Hover effects on interactive elements
- Expand/collapse animations for hierarchical data
- Glass shimmer effects

### 9. Responsive Design

The application will be fully responsive with:

- Mobile-first approach
- Collapsible navigation drawer
- Adaptive grid layouts
- Touch-friendly interactions
- Optimized glassmorphic effects for different screen sizes

### 10. Form Validation

I'll implement comprehensive form validation:

- Required field validation
- Data type validation
- Custom validation rules
- Real-time validation feedback
- Error message display

## Implementation Order

1. **Setup Phase**: Glassmorphic theme, additional components, and project structure
2. **Data Layer**: Mock data files and API functions
3. **Navigation**: Drawer navigation and routing
4. **Core Views**: Implement each view with basic functionality
5. **Enhancements**: Animations, responsive design, and validation
6. **Polish**: Final testing and refinement of glassmorphic design

## Technical Considerations

- **Performance**: Lazy loading of components and optimized re-renders
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Code Organization**: Modular component structure with clear separation of concerns
- **Testing**: Component testing with React Testing Library

This plan provides a comprehensive roadmap for implementing your Event Horizon frontend with all the specified requirements, glassmorphic design, and full functionality for all three views.