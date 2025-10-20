# Event Horizon Planner

A project management application built with React frontend and FastAPI backend, using PostgreSQL for data storage.

## Features

- **Project Management**: Create, view, and manage projects with hierarchical goals and tasks
- **Goal Tracking**: Set monthly, quarterly, and weekly milestone goals with progress tracking
- **Task Management**: Create tasks with status tracking, time estimates, and dependencies
- **Knowledge Base**: Store and manage documentation with markdown support
- **Multiple Views**: Project view, Knowledge Base gallery, and Tasks view with checklist and kanban layouts
- **Glassmorphic UI**: Modern UI with glassmorphism effects, animations, and responsive design

## Tech Stack

### Frontend
- React 19.2.0
- TypeScript
- Tailwind CSS v4
- Vite
- shadcn/ui components
- Framer Motion (UI animations)
- React Router DOM
- React Hook Form with Zod validation
- Lucide React icons

### Backend
- FastAPI
- Python 3.12+
- PostgreSQL
- Psycopg3
- Pydantic
- UV (package manager)

### DevOps
- Docker & Docker Compose
- Multi-container setup with frontend, backend, and PostgreSQL

## Prerequisites

- Node.js 22.x
- Python 3.12+
- Docker & Docker Compose
- pnpm 9.x

## Setup Instructions

### Option 1: Using DevPod (Recommended for Cloud/Remote Development)

DevPod allows you to create reproducible development environments in the cloud or locally, using the same devcontainer configuration. You can use either the desktop app (recommended) or CLI.

**IMPORTANT: First, commit the devcontainer files to GitHub**

Before using DevPod, you must commit the devcontainer configuration to your repository:

```bash
# Add all devcontainer and devpod files
git add .devcontainer/
git add devpod.yaml
git add README-DEVPOD.md
git add README.md

# Commit the changes
git commit -m "Add DevContainer and DevPod configuration"

# Push to GitHub
git push origin main
```

#### Option 1A: DevPod Desktop App (Recommended)

1. **Install DevPod Desktop App**: Download from [devpod.sh](https://devpod.sh/)
2. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd EH-App
   ```
3. **Setup with Desktop App**:
   - Open the DevPod desktop app
   - Click "Add Workspace" → "Clone from Git Repository"
   - Select your cloned `EH-App` folder
   - Choose VS Code as IDE and your preferred provider (Docker for local, AWS/GCP for cloud)
   - Click "Create" and wait for setup
4. **Start Services**: Once the workspace opens in VS Code, run `./start-dev.sh` in the terminal
5. **Access Applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - n8n: http://localhost:5678

#### Option 1B: DevPod CLI

For terminal-based workflow:

1. **Install DevPod CLI**: Follow the installation guide at [devpod.sh](https://devpod.sh/)
2. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd EH-App
   ```
3. **Start DevPod workspace**:
   ```bash
   # Local development
   devpod up
   
   # Or with cloud provider
   devpod up --provider aws
   devpod up --provider gcp
   ```
4. **Start Services**: Once connected, run `./start-dev.sh` in the terminal
5. **Access Applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - n8n: http://localhost:5678

For detailed DevPod instructions, see [`README-DEVPOD.md`](README-DEVPOD.md).

### Option 2: Using VS Code DevContainer (Recommended for Local Development)

The VS Code DevContainer provides a complete, pre-configured development environment.

1. **Open in VS Code**: Open this project in VS Code
2. **Reopen in Container**: When prompted, click "Reopen in Container" or use the Command Palette (Ctrl+Shift+P) and select "Dev Containers: Reopen in Container"
3. **Wait for Setup**: The container will automatically build and configure itself (first-time setup may take several minutes)
4. **Start Services**: Once the container is ready, run `./start-dev.sh` in the terminal to start all development services
5. **Access Applications**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - n8n: http://localhost:5678

For detailed DevContainer documentation, see [`.devcontainer/README.md`](.devcontainer/README.md).

### Option 2: Using Docker Compose

1. Clone the repository
2. Start all services using Docker Compose:
   ```bash
   docker compose up -d
   ```
3. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 3: Local Development

#### 1. Database Setup

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
  - `layout/` - Layout components (Header, Sidebar, etc.)
  - `ui/` - shadcn/ui components
  - `projects/` - Project-related components
  - `tasks/` - Task-related components
  - `knowledge/` - Knowledge base components
- `src/views/` - Main application views
- `src/contexts/` - React context providers
- `src/data/` - Mock data and API layer
- `src/hooks/` - Custom React hooks
- `src/router/` - Application routing
- `src/styles/` - Global styles with Tailwind CSS

### Backend Structure
- `api/` - API endpoint modules
  - `projects.py` - Project CRUD operations
  - `goals.py` - Goal CRUD operations
  - `tasks.py` - Task CRUD operations
  - `knowledge.py` - Knowledge base CRUD operations
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
- Glassmorphic UI design with backdrop blur effects
- All modals support both create and edit operations
- Tasks can be updated with status buttons for quick workflow changes
- The Knowledge Base supports markdown rendering with read/edit modes
- The layout is responsive with a collapsible navigation drawer
- Mock data generator is used for development and testing
- No data migration scripts needed for this prototype

## Validation

### Frontend Validation
To validate the frontend TypeScript code:
```bash
cd frontend && npx tsc --noEmit
```

### Backend Validation
To test the backend API, construct HTTP requests and send them using curl. There is a Vite proxy set up so you can hit the frontend's '/api' route to reach the backend.

## API Documentation

Once the backend is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Commands

The server is managed using a docker compose file. You can use docker and docker compose commands to:

- Check the status of containers: `docker compose ps`
- Stop containers: `docker compose stop`
- Start containers: `docker compose start`
- Restart containers: `docker compose restart`
- Rebuild images: `docker compose build --no-cache`
- View logs: `docker compose logs -f [service_name]`