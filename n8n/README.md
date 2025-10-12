# n8n Automated Setup

This directory contains an automated setup system for n8n that creates credentials, imports workflows, and activates them automatically when the container starts.

## Overview

The automated setup system includes:

- **Python setup script** (`setup_n8n.py`) - Creates credentials and imports workflows via n8n's REST API
- **Custom Dockerfile** - Builds a custom n8n image with the setup script built-in
- **Entrypoint script** (`entrypoint.sh`) - Orchestrates the setup process when the container starts
- **Environment configuration** (`.env.example`) - Template for all required credentials and settings

## How It Works

1. **Container Startup**: When the n8n container starts, the entrypoint script launches n8n in the background
2. **Health Check**: The script waits for n8n to be ready (health check endpoint responding)
3. **Setup Execution**: The Python setup script runs automatically (only on first start)
4. **Credential Creation**: All required credentials are created from environment variables
5. **Workflow Import**: Workflows are imported with proper credential mappings
6. **Workflow Activation**: All imported workflows are automatically activated
7. **Setup Completion**: A marker file is created to prevent re-running setup on restart

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credential values:

- **N8N_API_KEY**: Generate a secure API key for n8n
- **Google Calendar OAuth2**: Set up OAuth2 credentials in Google Cloud Console
- **OpenRouter API**: Get your API key from OpenRouter
- **Perplexity API**: Get your API key from Perplexity
- **PostgreSQL**: Database connection details (usually defaults work for Docker setup)
- **Redis**: Redis connection details (usually defaults work for Docker setup)
- **SMTP**: Email server credentials for notifications

### 2. Update docker-compose.yml

The n8n service in `docker-compose.yml` has been updated to use the custom build:

```yaml
n8n:
  build:
    context: ./n8n
    dockerfile: Dockerfile
  # ... other configuration
```

### 3. Start the Services

```bash
docker-compose up -d
```

The n8n container will automatically:
- Start n8n
- Create all credentials from your `.env` file
- Import all workflows
- Activate all workflows

### 4. Access n8n

Open http://localhost:5678 in your browser to access your fully configured n8n instance.

## Workflows Included

The system automatically configures three workflows:

### 1. EventHorizonArchivistAgent
- **Purpose**: Knowledge base management and research
- **Credentials**: Perplexity API, PostgreSQL, Redis, OpenRouter
- **Features**: Conversational and tool responder agent modes

### 2. EventHorizonDayScheduler
- **Purpose**: Daily workday planning with human-in-the-loop approval
- **Credentials**: Google Calendar, PostgreSQL, OpenRouter, Redis, SMTP
- **Features**: Schedule proposal, approval workflow, calendar event creation

### 3. EventHorizonPlanner
- **Purpose**: Multi-agent project planning system with routing
- **Credentials**: PostgreSQL, OpenRouter, Perplexity, Redis
- **Features**: Master Routing Agent, Project Validation Agent, Goal Management Agent, Task Management Agent

## Environment Variables Reference

### Required Credentials

| Variable | Description | Example |
|----------|-------------|---------|
| `N8N_API_KEY` | n8n API key for setup script | `your-secure-api-key-here` |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | `your-google-oauth-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | `your-google-oauth-client-secret` |
| `GOOGLE_ACCESS_TOKEN` | Google OAuth2 access token | `your-google-access-token` |
| `GOOGLE_REFRESH_TOKEN` | Google OAuth2 refresh token | `your-google-refresh-token` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |
| `PERPLEXITY_API_KEY` | Perplexity API key | `pplx-...` |
| `POSTGRES_HOST` | PostgreSQL host | `postgres` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_DB` | PostgreSQL database | `event_horizon` |
| `POSTGRES_USER` | PostgreSQL user | `event_horizon_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `eventhorizon` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `REDIS_PASSWORD` | Redis password (optional) | `your-redis-password` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | `your-app-password` |

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_SSL_MODE` | PostgreSQL SSL mode | `disable` |
| `REDIS_DATABASE` | Redis database number | `0` |
| `SMTP_SECURE` | Use SSL/TLS for SMTP | `false` |

## Troubleshooting

### Setup Script Not Running

Check the container logs:

```bash
docker-compose logs n8n
```

Look for:
- "n8n is ready!" message
- "Running automated setup script..." message
- Any error messages during credential creation

### Credentials Not Created

If credentials fail to create:
1. Verify your `.env` file has correct values
2. Check that the n8n API key is set properly
3. Ensure all required environment variables are present

### Workflows Not Importing

If workflows fail to import:
1. Check that credential creation succeeded first
2. Verify workflow JSON files exist and are valid
3. Check n8n container logs for import errors

### Manual Setup

If automated setup fails, you can run the setup script manually:

```bash
# Enter the container
docker-compose exec n8n bash

# Run the setup script manually
cd /tmp
python3 setup_n8n.py
```

## Development

### Modifying the Setup Script

The `setup_n8n.py` script is modular:

- `CREDENTIAL_TYPES`: Defines credential types and their configurations
- `get_credential_data()`: Extracts credential data from environment variables
- `create_credential()`: Creates individual credentials via n8n API
- `import_workflow()`: Imports workflow JSON files
- `activate_workflow()`: Activates imported workflows

### Adding New Workflows

1. Add workflow JSON file to the `n8n/` directory
2. Add filename to `WORKFLOW_FILES` list in `setup_n8n.py`
3. If new credential types are needed, add them to `CREDENTIAL_TYPES`
4. Update `.env.example` with any new environment variables

### Adding New Credential Types

1. Add credential type to `CREDENTIAL_TYPES` dictionary
2. Implement credential data extraction in `get_credential_data()`
3. Update `.env.example` with required environment variables

## Security Considerations

- Never commit the `.env` file to version control
- Use strong, unique API keys and passwords
- Regularly rotate API keys and credentials
- Use HTTPS for all external API calls where possible
- Consider using Docker secrets or external secret management in production

## Support

For issues with:
- **n8n itself**: Check the [n8n documentation](https://docs.n8n.io/)
- **This automation system**: Check container logs and this README
- **Credential setup**: Refer to the respective service documentation