# Event Horizon App - DevPod Setup

This guide provides instructions for using DevPod with the Event Horizon App project. DevPod allows you to create reproducible development environments in the cloud or locally, using the same devcontainer configuration.

## 🚀 Quick Start with DevPod

### Prerequisites

1. **Install DevPod**: Choose one of the following options:
   - **Desktop App (Recommended)**: Download from [devpod.sh](https://devpod.sh/) for a GUI experience
   - **CLI**: Install via command line for terminal-based workflow

2. **Commit DevContainer Files to GitHub** (IMPORTANT!):
   
   Before using DevPod, you must commit the devcontainer configuration files to your repository:
   
   ```bash
   # Add all the new devcontainer and devpod files
   git add .devcontainer/
   git add devpod.yaml
   git add README-DEVPOD.md
   git add README.md
   
   # Commit the changes
   git commit -m "Add DevContainer and DevPod configuration"
   
   # Push to GitHub
   git push origin main
   ```
   
   **Why this is required**: DevPod needs to access these configuration files from your GitHub repository to set up the development environment correctly.

3. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd EH-App
   ```

### Basic Usage

#### Option A: Using the DevPod Desktop App (Recommended)

The DevPod desktop app provides a user-friendly GUI for managing workspaces.

1. **Launch the DevPod Desktop App**
   - Open the application from your Applications folder or Start menu
   - Sign in with your preferred provider (GitHub, GitLab, etc.)

2. **Add a New Workspace**
   - Click "Add Workspace" or "New Workspace"
   - Choose "Clone from Git Repository"
   - Enter your repository URL or browse locally
   - Select the cloned `EH-App` folder

3. **Configure Workspace Settings**
   - **IDE**: Choose VS Code (recommended) or your preferred IDE
   - **Provider**:
     - For local development: "Docker" or "Local"
     - For cloud: Select AWS, GCP, DigitalOcean, etc.
   - **Machine Type**: Choose based on your needs (t3.medium or larger recommended)
   - **Region**: Select your preferred region (for cloud providers)

4. **Create and Start Workspace**
   - Click "Create" or "Start"
   - Wait for the workspace to be provisioned (first time may take several minutes)
   - The app will show progress and logs

5. **Open in IDE**
   - Once ready, click "Open in VS Code" (or your chosen IDE)
   - The IDE will open with your project loaded

6. **Start Development Services**
   - Open the terminal in VS Code (`Ctrl+`` or `View > Terminal`)
   - Run the development services:
     ```bash
     ./start-dev.sh
     ```

7. **Access Applications**
   - The services will be available at:
     - **Frontend**: http://localhost:5173
     - **Backend API**: http://localhost:8000
     - **API Documentation**: http://localhost:8000/docs
     - **n8n**: http://localhost:5678

8. **Manage Workspace**
   - Use the DevPod desktop app to:
     - Stop/start workspaces
     - Monitor resource usage
     - View logs
     - Delete workspaces when done

#### Option B: Using the DevPod CLI

For those who prefer terminal-based workflows.

1. **Start a DevPod workspace**

```bash
# Start a new DevPod workspace (will use VS Code by default)
devpod up

# Or specify VS Code explicitly
devpod up --ide vscode

# For cloud providers, specify the provider
devpod up --provider aws
devpod up --provider gcp
devpod up --provider digital-ocean
```

2. **Connect to your workspace**

```bash
# Connect via SSH (if not using IDE integration)
devpod ssh

# Or open directly in VS Code
devpod up --ide vscode
```

3. **Start the development services**

Once connected to your DevPod workspace, run:

```bash
# Start all development services
./start-dev.sh
```

4. **Access the applications**

The services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **n8n**: http://localhost:5678

## 🔧 Advanced DevPod Configuration

### Using Different IDEs

```bash
# VS Code (default)
devpod up --ide vscode

# JetBrains IDEs
devpod up --ide goland
devpod up --ide intellij
devpod up --ide pycharm

# Browser-based IDE
devpod up --ide browser

# No IDE (SSH only)
devpod up --ide none
```

### Cloud Provider Setup

#### AWS

```bash
# Configure AWS credentials first
aws configure

# Start workspace on AWS
devpod up --provider aws

# Or with specific instance type
devpod up --provider aws --machine-type t3.large
```

#### Google Cloud

```bash
# Configure GCP credentials first
gcloud auth application-default login

# Start workspace on GCP
devpod up --provider gcp

# Or with specific machine type
devpod up --provider gcp --machine-type e2-standard-2
```

#### DigitalOcean

```bash
# Configure DigitalOcean token
devpod provider add digital-ocean

# Start workspace on DigitalOcean
devpod up --provider digital-ocean
```

### Workspace Management

#### Desktop App Management

Using the DevPod desktop app:

1. **View All Workspaces**
   - Open the DevPod desktop app
   - See all your workspaces in a list with status indicators
   - View resource usage, costs, and last activity

2. **Control Workspaces**
   - **Stop**: Click the stop button to pause a workspace
   - **Start**: Click the start button to resume a stopped workspace
   - **Delete**: Right-click and select "Delete" to remove a workspace
   - **Open**: Click "Open in IDE" to connect to a running workspace

3. **Monitor Resources**
   - View CPU, memory, and disk usage
   - Monitor running costs for cloud providers
   - Check workspace logs and status

4. **Settings and Configuration**
   - Access provider settings
   - Configure default machine types
   - Set up auto-shutdown timers
   - Manage SSH keys and authentication

#### CLI Management

For terminal-based workspace management:

```bash
# List all workspaces
devpod list

# Stop a workspace
devpod stop <workspace-name>

# Start a stopped workspace
devpod start <workspace-name>

# Delete a workspace
devpod delete <workspace-name>

# Get workspace information
devpod status <workspace-name>
```

## 📁 DevPod Configuration

The project uses `devpod.yaml` in the root directory, which references the existing `.devcontainer/devcontainer.json` configuration. This means:

- All the same tools and extensions are available
- The same automatic setup scripts run
- Port forwarding is configured automatically
- Environment variables are set correctly

### Key DevPod Features

1. **Automatic Port Forwarding**: All necessary ports (5173, 8000, 5432, 5678) are automatically forwarded
2. **IDE Integration**: Full VS Code integration with debugging and extensions
3. **Persistent Storage**: Database data is preserved across workspace restarts
4. **Cloud Flexibility**: Run on any supported cloud provider or locally
5. **Cost Efficiency**: Automatically shut down workspaces when not in use

## 🛠️ Development Workflow with DevPod

### 1. Daily Development

```bash
# Start your workspace
devpod up

# Once connected, start services
./start-dev.sh

# Work as usual - all tools are available
# - Code editing in VS Code
# - Terminal access for commands
# - Debugging configurations work
# - Git operations work normally

# When done for the day
devpod stop
```

### 2. Testing and Validation

```bash
# Run tests
./run-tests.sh

# Or run specific test suites
cd backend && source .venv/bin/activate && python -m pytest
cd frontend && pnpm test

# Type checking
cd frontend && npx tsc -b
cd backend && source .venv/bin/activate && mypy .
```

### 3. Database Operations

```bash
# Generate fresh mock data
./generate-mock-data.sh

# Connect to database
psql -h localhost -p 5432 -U event_horizon_user -d event_horizon

# Reset database (WARNING: deletes all data)
docker-compose -f .devcontainer/docker-compose.yml down -v postgres
```

## 🔍 Troubleshooting

### Common Issues

#### Port Forwarding Problems

```bash
# Check if ports are forwarded
devpod status

# Manually forward ports if needed
devpod ssh -L 5173:localhost:5173 -L 8000:localhost:8000
```

#### Workspace Won't Start

```bash
# Check DevPod logs
devpod logs <workspace-name>

# Recreate workspace
devpod delete <workspace-name>
devpod up
```

#### Performance Issues

```bash
# Use larger machine type
devpod up --provider aws --machine-type t3.large

# Or use local provider for better performance
devpod up --provider docker
```

### Getting Help

```bash
# Check DevPod version
devpod version

# Get help with commands
devpod --help
devpod up --help

# Check provider status
devpod provider list
```

## 💰 Cost Management

### Best Practices

1. **Stop workspaces when not in use**:
   ```bash
   devpod stop
   ```

2. **Use appropriate machine sizes**:
   ```bash
   # For development
   devpod up --machine-type t3.medium
   
   # For intensive work
   devpod up --machine-type t3.large
   ```

3. **Set up auto-shutdown** (if supported by your provider):
   ```bash
   devpod up --provider aws --idle-timeout 30m
   ```

4. **Monitor costs**:
   ```bash
   devpod list --show-costs
   ```

## 🔄 Switching Between Local and DevPod

The beauty of the devcontainer approach is that you can seamlessly switch between:

- **Local VS Code devcontainer**
- **DevPod with local Docker**
- **DevPod with cloud providers**

All use the same configuration and provide the same development experience.

### Migration Tips

1. **Settings sync**: VS Code settings will sync between environments
2. **Extensions**: All configured extensions are installed automatically
3. **Git state**: Your git work is preserved across environments
4. **Database data**: Use the mock data script to reset data when needed

## 📚 Additional Resources

- [DevPod Documentation](https://devpod.sh/docs)
- [DevPod CLI Reference](https://devpod.sh/docs/cli)
- [DevPod Providers](https://devpod.sh/docs/providers)
- [DevContainer Specification](https://containers.dev/implementors/spec/)

---

Happy coding with DevPod! 🚀