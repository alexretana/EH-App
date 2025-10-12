FROM mcr.microsoft.com/devcontainers/javascript-node:0-22

# Install Python and related tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        python3.12 \
        python3.12-pip \
        python3.12-venv \
        python3.12-dev \
        build-essential \
        libpq-dev \
        curl \
        git \
        && rm -rf /var/lib/apt/lists/*

# Install uv for Python package management
RUN pip3 install uv

# Install pnpm globally
RUN npm install -g pnpm

# Install Docker CLI (for docker-in-docker support)
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        docker.io \
        docker-compose \
    && rm -rf /var/lib/apt/lists/*

# Install PostgreSQL client
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.12 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.12 1 \
    && update-alternatives --install /usr/bin/pip pip /usr/bin/pip3.12 1

# Create non-root user (devcontainer features handle this, but keeping for reference)
# USER vscode

# Set working directory
WORKDIR /workspace

# Install global Python tools
RUN pip install black isort flake8 mypy pytest pytest-asyncio

# Install global Node.js tools
RUN npm install -g @playwright/test

# Create directories for mounting volumes
RUN mkdir -p /workspace/frontend/node_modules /workspace/backend/.venv

# Set permissions for the vscode user
RUN chown -R vscode:vscode /workspace

# Switch to non-root user
USER vscode

# Initialize Python virtual environment in backend directory
RUN if [ ! -d "/workspace/backend/.venv" ]; then \
        cd /workspace/backend && \
        python -m venv .venv; \
    fi

# Install Python dependencies if backend has requirements
RUN if [ -f "/workspace/backend/pyproject.toml" ]; then \
        cd /workspace/backend && \
        . .venv/bin/activate && \
        pip install uv && \
        uv sync; \
    fi

# Install Node.js dependencies if frontend has package.json
RUN if [ -f "/workspace/frontend/package.json" ]; then \
        cd /workspace/frontend && \
        pnpm install; \
    fi

# Expose ports
EXPOSE 5173 8000 5432 5678 54545

# Set environment variables
ENV NODE_ENV=development
ENV PYTHONPATH=/workspace/backend
ENV DATABASE_URL=postgresql://event_horizon_user:eventhorizon@postgres:5432/event_horizon

# Default command (will be overridden by devcontainer.json)
CMD ["sleep", "infinity"]