# Event Horizon Planner

A project management application built with Solid.js frontend and FastAPI backend, using PostgreSQL for data storage.

## Features

- **Project Management**: Create, view, and manage projects with hierarchical goals and tasks
- **Goal Tracking**: Set monthly, quarterly, and weekly milestone goals with progress tracking
- **Task Management**: Create tasks with status tracking, time estimates, and dependencies
- **Knowledge Base**: Store and manage documentation with markdown support
- **Multiple Views**: Project view, Knowledge Base gallery, and Tasks view with checklist and kanban layouts

## Tech Stack

### Frontend
- Solid.js
- TypeScript
- Tailwind CSS
- Vite
- Axios for API calls
- Lucide icons

### Backend
- FastAPI
- Python
- PostgreSQL
- Psycopg3
- Pydantic

## Prerequisites

- Node.js 20.x
- Python 3.12+
- PostgreSQL
- pnpm 9.x

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database named `event_horizon`
2. Run the DDL scripts in order from the `postgresql-ddl` directory:
   ```bash
   psql -d event_horizon -f postgresql-ddl/1-database-setup-ddl.sql
   psql -d event_horizon -f postgresql-ddl/2-core-tables-ddl.sql
   psql -d event_horizon -f postgresql-ddl/3-performance-indexes-ddl.sql
   psql -d event_horizon -f postgresql-ddl/4-essential-triggers-ddl.sql
   psql -d event_horizon -f postgresql-ddl/5-api-friendly-views-ddl.sql
   psql -d event_horizon -f postgresql-ddl/6-stored-procedures-ddl.sql
   psql -d event_horizon -f postgresql-ddl/7-sample-data-ddl.sql
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   uv sync
   ```

3. Configure environment variables:
   - Copy `.env` file and update the `DATABASE_URL` to match your PostgreSQL connection

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

### 4. Running Both Servers

From the root directory, you can run both servers simultaneously:

```bash
pnpm run dev
```

This will start both the frontend (on http://localhost:5173) and backend (on http://localhost:8000) servers.

## Application Structure

### Frontend Structure
- `src/components/` - Reusable UI components
- `src/views/` - Main application views
- `src/services/` - API service layer
- `src/App.tsx` - Main application component with routing

### Backend Structure
- `api/` - API endpoint modules
- `models.py` - Pydantic models for data validation
- `database.py` - Database connection and query helpers
- `main.py` - FastAPI application setup

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Use the navigation drawer to switch between:
   - **Projects**: View and manage projects with hierarchical goals and tasks
   - **Knowledge Base**: Browse and edit documentation
   - **Tasks**: View tasks in checklist or kanban format

## Development Notes

- The application uses a modern color scheme with oklch color space
- All modals support both create and edit operations
- Tasks can be updated with status buttons for quick workflow changes
- The Knowledge Base supports markdown rendering with read/edit modes
- The layout is responsive with a collapsible navigation drawer

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc