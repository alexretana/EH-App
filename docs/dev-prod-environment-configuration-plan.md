# Development vs Production Environment Configuration Plan

## Executive Summary

This document outlines the strategy for implementing separate **Development (DEV)** and **Production (PROD)** modes for the Event Horizon application. The goal is to create a clear separation between development and production environments with appropriate configurations for each.

## Current State Analysis

### Existing Configuration Issues

1. **Frontend**: Uses Vite dev server in production (should use built static files)
2. **Backend**: No environment-specific configuration for CORS, logging, or debug mode
3. **Docker Compose**: Single configuration file for all environments
4. **Environment Variables**: Mixed configuration without clear dev/prod separation
5. **Database**: No distinction between dev/prod data seeding
6. **Caddy**: Configured for production domains but proxies to dev server

### Deployment Context

- **Production Environment**: Digital Ocean Ubuntu VM (Droplet)
- **Development Environment**: Local machine or devcontainer
- **Production Domain**: event-horizon.retanatech.com, eh-n8n.retanatech.com
- **Development Access**: localhost only
- **Database Strategy**: Separate instances (dev regenerated with mock data)

---

## Environment Strategy

### Centralized Environment Control

**Primary Environment Variable**: `APP_ENV`

Values:
- `development` - Local development with hot-reload, debug logging, mock data
- `production` - Optimized builds, production domains, minimal logging

This single variable will control:
- Docker Compose file selection
- Build processes
- Service configurations
- Database initialization
- Logging levels
- CORS policies

---

## Detailed Implementation Plan

### 1. Environment Variable Files

#### Structure

```
.env.development      # Development-specific settings
.env.production       # Production-specific settings
.env.infrastructure   # Shared infrastructure (keep existing)
.env.credentials      # Credentials (environment-agnostic)
.env.third-party      # Third-party services (environment-agnostic)
```

#### `.env.development` Contents

```bash
# Core Environment
APP_ENV=development
NODE_ENV=development
DEBUG=true

# Frontend Configuration
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_RELOAD=true
BACKEND_LOG_LEVEL=debug
BACKEND_DEBUG=true

# CORS Configuration (permissive for dev)
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]

# Database Configuration
POSTGRES_DB=event_horizon_dev
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=eventhorizon_dev
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://event_horizon_user:eventhorizon_dev@postgres:5432/event_horizon_dev
DATABASE_SEED_MOCK_DATA=true

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_dev_password

# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_WEBHOOK_URL=http://n8n:5678
N8N_EDITOR_BASE_URL=http://localhost:5678

# Service Ports
FRONTEND_PORT=5173
CADDY_HTTP_PORT=80
CADDY_HTTPS_PORT=443

# Docker Configuration
RESTART_POLICY=no
DOCKER_ENV=true
```

#### `.env.production` Contents

```bash
# Core Environment
APP_ENV=production
NODE_ENV=production
DEBUG=false

# Frontend Configuration (build-time)
VITE_API_URL=https://event-horizon.retanatech.com
VITE_APP_ENV=production

# Backend Configuration
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
BACKEND_RELOAD=false
BACKEND_LOG_LEVEL=info
BACKEND_DEBUG=false

# CORS Configuration (restrictive for prod)
BACKEND_CORS_ORIGINS=["https://event-horizon.retanatech.com","https://eh-n8n.retanatech.com"]

# Database Configuration
POSTGRES_DB=event_horizon
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=${PROD_POSTGRES_PASSWORD}  # Load from .env.credentials
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://event_horizon_user:${PROD_POSTGRES_PASSWORD}@postgres:5432/event_horizon
DATABASE_SEED_MOCK_DATA=false

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${PROD_REDIS_PASSWORD}  # Load from .env.credentials

# n8n Configuration
N8N_BASE_URL=https://eh-n8n.retanatech.com
N8N_WEBHOOK_URL=https://eh-n8n.retanatech.com
N8N_EDITOR_BASE_URL=https://eh-n8n.retanatech.com

# Service Ports
FRONTEND_PORT=80
CADDY_HTTP_PORT=80
CADDY_HTTPS_PORT=443

# Docker Configuration
RESTART_POLICY=unless-stopped
DOCKER_ENV=true
```

---

### 2. Docker Compose Configuration

#### File Structure

```
docker-compose.yml              # Base configuration (shared)
docker-compose.dev.yml          # Development overrides
docker-compose.prod.yml         # Production overrides
```

#### `docker-compose.yml` (Base)

Contains common service definitions:
- Service names
- Volume definitions
- Network configuration
- Basic health checks
- Shared dependencies

#### `docker-compose.dev.yml` (Development Overrides)

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
      target: development
    command: pnpm run dev --host 0.0.0.0
    volumes:
      - ./frontend:/app
      - /app/node_modules
    env_file:
      - .env.development
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
    restart: no

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    command: uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    env_file:
      - .env.development
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
    restart: no

  caddy:
    volumes:
      - ./caddy/Caddyfile.dev:/etc/caddy/Caddyfile
    ports:
      - "80:80"
      - "443:443"
```

#### `docker-compose.prod.yml` (Production Overrides)

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      target: production
    env_file:
      - .env.production
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
    command: uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
    env_file:
      - .env.production
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
    restart: unless-stopped

  caddy:
    volumes:
      - ./caddy/Caddyfile.prod:/etc/caddy/Caddyfile
    restart: unless-stopped
```

---

### 3. Frontend Configuration Changes

#### Multi-stage Dockerfile

**File**: `frontend/Dockerfile.dev`

```dockerfile
FROM node:22-alpine as development

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Development command (with hot-reload)
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
```

**File**: `frontend/Dockerfile.prod`

```dockerfile
# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_APP_ENV=production

# Build the application
RUN pnpm run build

# Production stage
FROM caddy:2-alpine as production

WORKDIR /srv

# Copy built files from builder
COPY --from=builder /app/dist /srv

# Copy Caddyfile for serving static files
COPY Caddyfile.static /etc/caddy/Caddyfile

EXPOSE 80
```

**File**: `frontend/Caddyfile.static`

```
:80 {
    root * /srv
    encode gzip
    file_server
    try_files {path} /index.html
}
```

#### Vite Configuration Updates

**File**: `frontend/vite.config.ts`

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDevelopment = mode === 'development';

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: isDevelopment ? {
        '/api': {
          target: env.DOCKER_ENV === 'true' 
            ? 'http://eh-app-backend:8000' 
            : 'http://localhost:8000',
          changeOrigin: true,
        },
      } : undefined,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      host: true,
      strictPort: true,
      port: 5173,
      allowedHosts: ['localhost', '127.0.0.1'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: isDevelopment ? false : 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react'],
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || '/api'),
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || 'development'),
    },
  };
});
```

#### Package.json Scripts

**File**: `frontend/package.json` (update scripts section)

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "tsc -b && vite build --mode production",
    "build:dev": "tsc -b && vite build --mode development",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

#### Frontend API Configuration

**File**: `frontend/src/data/api/realApi.ts` (update)

```typescript
// API base URL - use environment variable or fallback to /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

// Log API configuration in development
if (APP_ENV === 'development') {
  console.log('API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: APP_ENV
  });
}

// Rest of the file remains the same...
```

---

### 4. Backend Configuration Changes

#### Multi-stage Dockerfile

**File**: `backend/Dockerfile`

```dockerfile
FROM python:3.12-slim as base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for faster package management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./
COPY uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Development stage
FROM base as development

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM base as production

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### FastAPI Application Configuration

**File**: `backend/main.py` (updated)

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import api_router
import logging

# Environment configuration
APP_ENV = os.getenv("APP_ENV", "development")
DEBUG = os.getenv("BACKEND_DEBUG", "false").lower() == "true"
LOG_LEVEL = os.getenv("BACKEND_LOG_LEVEL", "info").upper()

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with environment-specific configuration
app = FastAPI(
    title="Event Horizon API",
    version="1.0.0",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,  # Disable docs in production
    redoc_url="/redoc" if DEBUG else None,
)

# Configure CORS based on environment
cors_origins_str = os.getenv(
    "BACKEND_CORS_ORIGINS",
    '["http://localhost:5173", "http://127.0.0.1:5173"]'
)

# Parse CORS origins from JSON string
import json
try:
    cors_origins = json.loads(cors_origins_str)
except json.JSONDecodeError:
    logger.warning(f"Failed to parse CORS origins, using defaults")
    cors_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

logger.info(f"Starting Event Horizon API in {APP_ENV} mode")
logger.info(f"CORS origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get('/')
def root():
    return {
        'msg': 'Event Horizon API is running',
        'environment': APP_ENV,
        'debug': DEBUG
    }

@app.get('/health')
def health_check():
    return {
        'status': 'healthy',
        'environment': APP_ENV
    }

@app.on_event("startup")
async def startup_event():
    logger.info(f"Application started in {APP_ENV} mode")
    if DEBUG:
        logger.debug("Debug mode is enabled")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down")
```

#### Database Configuration

**File**: `backend/database.py` (updated)

```python
import os
import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# Database connection
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/event_horizon"
)

APP_ENV = os.getenv("APP_ENV", "development")

logger.info(f"Database configuration for {APP_ENV} environment")

class Database:
    def __init__(self):
        self.conn = None
    
    def connect(self):
        if not self.conn:
            try:
                self.conn = psycopg.connect(DATABASE_URL)
                logger.info(f"Connected to database: {DATABASE_URL.split('@')[1]}")
                
                # Register the UUID loader for this connection
                from psycopg.adapt import Loader
                
                class UuidTextLoader(Loader):
                    def load(self, data):
                        if isinstance(data, memoryview):
                            return bytes(data).decode('utf-8')
                        return data.decode('utf-8')
                
                self.conn.adapters.register_loader("uuid", UuidTextLoader)
            except Exception as e:
                logger.error(f"Failed to connect to database: {e}")
                raise
        return self.conn
    
    # Rest of the class remains the same...
    # (keep existing execute_query, execute_insert, execute_update, execute_delete methods)

# Create a singleton instance
db = Database()
```

---

### 5. Caddy Configuration

#### Development Caddyfile

**File**: `caddy/Caddyfile.dev`

```
{
    # Disable automatic HTTPS for local development
    auto_https off
}

# Local development
:80 {
    # API routes go to backend
    @api path /api/*
    handle @api {
        reverse_proxy backend:8000
    }

    # Everything else goes to Vite dev server
    handle {
        reverse_proxy frontend:5173
    }
}
```

#### Production Caddyfile

**File**: `caddy/Caddyfile.prod`

```
{
    email alex.retana@live.com
}

# Production domain (frontend + backend)
event-horizon.retanatech.com {
    # API routes go to backend
    @api path /api/*
    handle @api {
        reverse_proxy backend:8000
    }

    # Static files from frontend container
    handle {
        reverse_proxy frontend:80
    }

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
    }

    # Logging
    log {
        output file /var/log/caddy/access.log
    }
}

# n8n subdomain
eh-n8n.retanatech.com {
    reverse_proxy n8n:5678
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
    }
}
```

---

### 6. Database Initialization

#### Updated Database Dockerfile

**File**: `database/Dockerfile` (update)

```dockerfile
FROM postgres:16

# Copy initialization scripts
COPY postgresql-ddl/*.sql /docker-entrypoint-initdb.d/
COPY init-db.sh /docker-entrypoint-initdb.d/00-init-db.sh

# Make script executable
RUN chmod +x /docker-entrypoint-initdb.d/00-init-db.sh

EXPOSE 5432
```

#### Environment-aware Initialization Script

**File**: `database/init-db.sh` (updated)

```bash
#!/bin/bash
set -e

echo "Initializing database for environment: ${APP_ENV:-development}"

# Run DDL scripts in order
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \echo 'Running database initialization scripts...'
EOSQL

# Check if we should seed mock data
if [ "${DATABASE_SEED_MOCK_DATA:-false}" = "true" ]; then
    echo "Seeding mock data for development environment..."
    
    # Run sample data script
    if [ -f /docker-entrypoint-initdb.d/7-sample-data-ddl.sql ]; then
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
            -f /docker-entrypoint-initdb.d/7-sample-data-ddl.sql
        echo "Mock data seeded successfully"
    fi
else
    echo "Skipping mock data seeding for production environment"
fi

echo "Database initialization complete"
```

---

### 7. n8n Configuration

**File**: `n8n/Dockerfile` (update)

No significant changes needed, but ensure environment variables are properly passed.

**File**: `n8n/entrypoint.sh` (update for environment awareness)

```bash
#!/bin/bash
set -e

SETUP_MARKER="/data/.n8n_setup_complete"
APP_ENV=${APP_ENV:-development}

echo "Starting n8n container in ${APP_ENV} mode..."

# Environment-specific setup logic
if [ "$APP_ENV" = "production" ]; then
    echo "Production mode: ensuring secure configuration..."
    # Add production-specific checks/setup here
fi

# Rest of the script remains the same...
```

---

### 8. Discord Bot Configuration

**File**: `discord-bot/src/bot.py` (update)

```python
import os
import logging

# Environment configuration
APP_ENV = os.getenv("APP_ENV", "development")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO" if APP_ENV == "production" else "DEBUG")

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info(f"Starting Discord bot in {APP_ENV} mode")

# Rest of your bot code...
```

---

### 9. Deployment Scripts

#### Development Startup Script

**File**: `scripts/start-dev.sh`

```bash
#!/bin/bash

echo "Starting Event Horizon in DEVELOPMENT mode..."

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "Error: .env.development not found"
    echo "Please create it from .env.development.example"
    exit 1
fi

# Stop any running containers
docker compose down

# Start services in development mode
docker compose \
    -f docker-compose.yml \
    -f docker-compose.dev.yml \
    up --build

echo "Development environment started"
```

#### Production Deployment Script

**File**: `scripts/deploy-prod.sh`

```bash
#!/bin/bash

echo "Deploying Event Horizon in PRODUCTION mode..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production not found"
    exit 1
fi

# Check if credentials exist
if [ ! -f .env.credentials ]; then
    echo "Error: .env.credentials not found"
    exit 1
fi

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Build and deploy
echo "Building and starting services..."
docker compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up -d --build

# Show running services
docker compose ps

echo "Production deployment complete"
echo "Services available at:"
echo "  - Frontend: https://event-horizon.retanatech.com"
echo "  - n8n: https://eh-n8n.retanatech.com"
```

#### Local Production Test Script

**File**: `scripts/test-prod-local.sh`

```bash
#!/bin/bash

echo "Starting Event Horizon in PRODUCTION mode (local test)..."

# Use production config but with local overrides
docker compose \
    -f docker-compose.yml \
    -f docker-compose.prod.yml \
    up --build

echo "Local production test started"
echo "Access at http://localhost"
```

---

## Migration Steps

### Phase 1: Setup Environment Files

1. Create `.env.development` and `.env.production` files
2. Update `.env.infrastructure` to remove environment-specific values
3. Update `.gitignore` to exclude sensitive environment files

### Phase 2: Update Docker Configuration

1. Split `docker-compose.yml` into base + environment-specific files
2. Test development configuration locally
3. Test production configuration locally

### Phase 3: Update Service Configurations

1. Update frontend Dockerfiles and Vite config
2. Update backend configuration
3. Update Caddy configuration files
4. Update database initialization scripts

### Phase 4: Testing

1. Test development mode locally
2. Test production mode locally
3. Deploy to production environment
4. Verify all services work correctly

### Phase 5: Documentation

1. Update README with environment instructions
2. Document deployment procedures
3. Create troubleshooting guide

---

## Environment Variables Summary

### Critical Environment Variables

| Variable | Dev Value | Prod Value | Purpose |
|----------|-----------|------------|---------|
| `APP_ENV` | development | production | Primary environment indicator |
| `NODE_ENV` | development | production | Node.js environment |
| `DEBUG` | true | false | Enable debug features |
| `VITE_API_URL` | http://localhost:8000 | https://event-horizon.retanatech.com | API endpoint |
| `BACKEND_RELOAD` | true | false | Enable hot-reload |
| `BACKEND_LOG_LEVEL` | debug | info | Logging verbosity |
| `DATABASE_SEED_MOCK_DATA` | true | false | Seed development data |
| `RESTART_POLICY` | no | unless-stopped | Container restart behavior |

---

## Testing Strategy

### Development Mode Testing

```bash
# Start in dev mode
./scripts/start-dev.sh

# Verify services
curl http://localhost/health
curl http://localhost/api/health

# Check logs
docker compose logs -f backend
docker compose logs -f frontend
```

### Production Mode Testing (Local)

```bash
# Start in production mode locally
./scripts/test-prod-local.sh

# Verify build
docker compose ps
curl http://localhost/health

# Check that static files are served
curl -I http://localhost/
```

### Production Deployment Testing

```bash
# SSH to droplet
ssh your-droplet

# Deploy
./scripts/deploy-prod.sh

# Verify
curl https://event-horizon.retanatech.com/health
```

---

## Rollback Plan

If issues occur in production:

1. **Quick Rollback**: 
   ```bash
   docker compose down
   git checkout <previous-commit>
   ./scripts/deploy-prod.sh
   ```

2. **Keep Running on Old Version**: Simply don't deploy new code

3. **Emergency Fix**: Hot-patch critical issues and redeploy

---

## Security Considerations

### Development Mode

- Permissive CORS
- Debug endpoints enabled
- Verbose logging
- No production secrets required

### Production Mode

- Restrictive CORS (only production domains)
- Debug endpoints disabled
- Minimal logging
- Strong passwords required
- HTTPS enforced
- Security headers enabled

---

## Performance Optimizations

### Development Mode

- Hot module replacement
- Source maps enabled
- No minification
- No code splitting

### Production Mode

- Optimized builds
- Code minification
- Tree shaking
- Code splitting
- Gzip compression
- Multiple workers for uvicorn

---

## Monitoring and Logging

### Development Mode

- Console logging
- Verbose debug output
- Real-time error display

### Production Mode

- File-based logging
- Log rotation
- Error tracking (consider adding Sentry)
- Health check endpoints

---

## Next Steps

After implementing this plan:

1. **Add CI/CD Pipeline**: Automate testing and deployment
2. **Add Monitoring**: Implement Prometheus/Grafana
3. **Add Staging Environment**: Create a middle ground between dev and prod
4. **Add Secrets Management**: Use Docker secrets or Vault
5. **Add Backup Strategy**: Automate database backups for production

---

## Conclusion

This configuration strategy provides:

- ✅ Clear separation between development and production
- ✅ Environment-specific optimizations
- ✅ Easy local testing of production builds
- ✅ Simplified deployment process
- ✅ Maintainable configuration structure
- ✅ Security best practices

The implementation should be done incrementally, testing each component before moving to the next.