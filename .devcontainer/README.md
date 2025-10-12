# Event Horizon App DevContainer Setup

This directory contains the complete development container configuration for the Event Horizon App project. It provides a consistent, reproducible development environment with all necessary tools and services pre-configured.

## 🚀 Quick Start

1. **Open in DevContainer**: Open this project in VS Code and use the "Reopen in Container" command when prompted
2. **Wait for Setup**: The container will automatically build and configure itself (this may take a few minutes on first run)
3. **Start Services**: Once the container is ready, run `./start-dev.sh` to start all development services
4. **Access Applications**: 
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - n8n: http://localhost:5678

## 📁 File Structure

```
.devcontainer/
├── devcontainer.json    # Main devcontainer configuration
├── docker-compose.yml   # Docker Compose for dev environment
├── Dockerfile          # Container image definition
├── setup.sh            # Post-creation setup script
├── post-start.sh       # Post-start configuration script
└── README.md           # This file
```

## 🛠️ Included Tools & Services

### Development Tools
- **Node.js 22** with pnpm package manager
- **Python 3.12** with uv package manager
- **PostgreSQL 16** database server
- **Docker & Docker Compose** for container management
- **Git** with pre-commit hooks
- **VS Code Extensions** pre-configured for optimal development

### VS Code Extensions
- `ms-python.python` - Python language support
- `ms-python.flake8` - Python linting
- `ms-python.black-formatter` - Python code formatting
- `ms-python.isort` - Python import sorting
- `bradlc.vscode-tailwindcss` - Tailwind CSS support
- `esbenp.prettier-vscode` - Code formatting
- `dbaeumer.vscode-eslint` - JavaScript/TypeScript linting
- `ms-vscode.vscode-typescript-next` - TypeScript support
- `ms-azuretools.vscode-docker` - Docker integration
- `ms-vscode.vscode-postgresql` - PostgreSQL integration

### Services
- **Frontend Dev Server** (React + Vite) - Port 5173
- **Backend API Server** (FastAPI) - Port 8000
- **PostgreSQL Database** - Port 5432
- **n8n Automation** - Port 5678

## 🔧 Configuration

### Environment Variables

The devcontainer automatically creates `.env` files for each service:

#### Backend (.env)
```env
DATABASE_URL=postgresql://event_horizon_user:eventhorizon@localhost:5432/event_horizon
DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production
CORS_ORIGINS=["http://localhost:5173"]
GENERATE_MOCK_DATA=true
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Event Horizon
VITE_APP_VERSION=0.1.0
VITE_DEBUG=true
```

#### Database (.env)
```env
POSTGRES_DB=event_horizon
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=eventhorizon
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Development Scripts

The setup creates several convenience scripts in the project root:

- `./start-dev.sh` - Start all development services
- `./generate-mock-data.sh` - Generate fresh mock data
- `./run-tests.sh` - Run all tests

## 🗄️ Database Setup

The database is automatically initialized with the following steps:

1. **Database Creation**: PostgreSQL database and user are created
2. **Schema Initialization**: DDL files from `database/postgresql-ddl/` are executed in order
3. **Mock Data Generation**: Sample data is generated for development

### Database Connection Info
- **Host**: localhost
- **Port**: 5432
- **Database**: event_horizon
- **User**: event_horizon_user
- **Password**: eventhorizon

## 🧪 Testing

### Running Tests
```bash
# Run all tests
./run-tests.sh

# Run Python tests only
cd backend && source .venv/bin/activate && python -m pytest

# Run frontend tests only
cd frontend && pnpm test
```

### Test Coverage
- **Backend**: pytest with async support
- **Frontend**: Playwright for end-to-end testing
- **Linting**: flake8 (Python), ESLint (JavaScript/TypeScript)

## 🎨 Frontend Development

### Starting Frontend Only
```bash
cd frontend
pnpm run dev --host 0.0.0.0 --port 5173
```

### Building for Production
```bash
cd frontend
pnpm run build
```

### TypeScript Compilation
```bash
cd frontend
npx tsc -b
```

## 🔧 Backend Development

### Starting Backend Only
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Documentation
Once the backend is running, visit http://localhost:8000/docs for interactive API documentation.

### Database Operations
```bash
# Generate mock data
cd backend && source .venv/bin/activate
python scripts/generate_mock_data.py

# Connect to database
psql -h localhost -p 5432 -U event_horizon_user -d event_horizon
```

## ⚙️ n8n Automation

n8n is included for workflow automation and is available at http://localhost:5678.

### n8n Configuration
- **Timezone**: America/New_York
- **API Key**: dev-api-key
- **External Function Calls**: Enabled
- **Runners**: Enabled

### Custom Workflows
The n8n workflows are located in the `n8n/` directory:
- `EventHorizonArchivistAgent.json`
- `EventHorizonDayScheduler.json`
- `EventHorizonPlanner.json`

## 🔍 Debugging

### VS Code Debugging
The devcontainer includes pre-configured debugging settings:

1. **Python Debugging**: Use the VS Code Python debugger
2. **JavaScript/TypeScript Debugging**: Use the VS Code JavaScript debugger
3. **Browser Debugging**: Use the VS Code browser debugger for frontend

### Common Issues

#### Port Conflicts
If you encounter port conflicts, modify the port mappings in `.devcontainer/devcontainer.json` and `.devcontainer/docker-compose.yml`.

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose -f .devcontainer/docker-compose.yml ps postgres

# Check PostgreSQL logs
docker-compose -f .devcontainer/docker-compose.yml logs postgres

# Restart PostgreSQL
docker-compose -f .devcontainer/docker-compose.yml restart postgres
```

#### Dependency Issues
```bash
# Reinstall Python dependencies
cd backend
rm -rf .venv
python -m venv .venv
source .venv/bin/activate
pip install uv
uv sync

# Reinstall Node.js dependencies
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 🚀 Production Considerations

This devcontainer is optimized for development. For production deployment:

1. **Security**: Change all default passwords and API keys
2. **Performance**: Optimize database queries and add caching
3. **Monitoring**: Add logging and monitoring solutions
4. **Scaling**: Configure load balancers and horizontal scaling

## 📚 Additional Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

When contributing to this project:

1. Make changes in the devcontainer environment
2. Run tests with `./run-tests.sh`
3. Follow the code formatting rules (pre-commit hooks will enforce this)
4. Update documentation as needed

## 📞 Support

If you encounter issues with the devcontainer setup:

1. Check the container logs: `docker ps` and `docker logs <container_id>`
2. Verify all services are running: `docker-compose -f .devcontainer/docker-compose.yml ps`
3. Try rebuilding the container: "Rebuild Container" in VS Code
4. Check this README for troubleshooting steps

---

Happy coding! 🚀