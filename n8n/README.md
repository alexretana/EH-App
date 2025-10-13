# n8n Workflow Setup

This directory contains the n8n automation service configuration and setup scripts.

## Overview

The n8n service is configured to automatically import credentials and workflows on first-time startup. This ensures a consistent setup across different environments without manual intervention.

## Files Structure

```
n8n/
├── Dockerfile                          # n8n container configuration
├── entrypoint.sh                       # Main entrypoint orchestrating setup
├── scripts/
│   ├── generate-creds.sh              # Generates credentials from template
│   └── setup-workflows.sh             # Imports workflows and credentials
└── workflow&creds/
    ├── decrypt_creds.json.template    # Template with env var placeholders
    └── workflows/                      # Workflow definition files
        ├── EH-ProjectPlanner.json
        ├── EH-Archivist.json
        └── EH-PlanWorkday.json
```

## First-Time Setup Process

On container startup, the following sequence occurs:

1. **Generate Credentials** (`generate-creds.sh`)
   - Reads `decrypt_creds.json.template`
   - Substitutes environment variables
   - Creates `decrypt_creds.json` with actual values

2. **Start n8n Temporarily**
   - Starts n8n in background for setup operations

3. **Import Setup** (`setup-workflows.sh`)
   - Checks if setup already completed (via marker file)
   - If not completed:
     - Waits for n8n to be ready
     - Imports credentials from `decrypt_creds.json`
     - Imports each workflow from `workflow&creds/workflows/`
     - Activates all workflows
     - Creates marker file (`.n8n_setup_complete`)

4. **Restart n8n**
   - Stops temporary instance
   - Starts n8n normally with all workflows active

## Environment Variables

All sensitive credentials must be configured in your `.env` file. See `.env.example` for the complete list:

### Required Variables

```bash
# Google Calendar OAuth2
N8N_GOOGLE_CREDENTIAL_ID=NkKUuScQIKMPg4oB
N8N_GOOGLE_CLIENT_ID=your-client-id
N8N_GOOGLE_CLIENT_SECRET=your-client-secret
N8N_GOOGLE_ACCESS_TOKEN=your-access-token
N8N_GOOGLE_REFRESH_TOKEN=your-refresh-token

# SMTP Email
N8N_SMTP_CREDENTIAL_ID=7bWXaCVW2dMSCnf6
N8N_SMTP_USER=your-smtp-user
N8N_SMTP_PASSWORD=your-smtp-password
N8N_SMTP_HOST=your-smtp-host
N8N_SMTP_HOSTNAME=Your SMTP Provider Name

# OpenRouter API
N8N_OPENROUTER_CREDENTIAL_ID=yKFM8WDdpoQvNP2s
N8N_OPENROUTER_API_KEY=your-openrouter-key

# Perplexity API
N8N_PERPLEXITY_CREDENTIAL_ID=eSq2tTy0gzeDcx9N
N8N_PERPLEXITY_API_KEY=your-perplexity-key

# PostgreSQL (auto-configured from main DB settings)
N8N_POSTGRES_CREDENTIAL_ID=5F055CeN7hFwfSH4
POSTGRES_HOST=postgres
POSTGRES_DB=event_horizon
POSTGRES_USER=event_horizon_user
POSTGRES_PASSWORD=eventhorizon

# Redis
N8N_REDIS_CREDENTIAL_ID=4I9jSqxS5nAnBW2p
REDIS_HOST=redis
REDIS_PASSWORD=n8n_password
```

## Credential IDs

The credential IDs (e.g., `NkKUuScQIKMPg4oB`) are preset in the template to maintain consistency across workflows. These IDs should match those referenced in your workflow files.

## Preventing Duplicate Setups

The setup script creates a marker file (`/data/.n8n_setup_complete`) after successful completion. If this file exists on subsequent container starts, the import process is skipped entirely, preventing duplicate credentials and workflows.

### Manual Reset

To force a re-import (e.g., after major changes):

1. Stop the n8n container
2. Remove the marker file from the n8n data volume
3. Restart the container

```bash
docker compose down n8n
docker compose run --rm n8n rm /data/.n8n_setup_complete
docker compose up -d n8n
```

## Troubleshooting

### Check Setup Status

```bash
# View entrypoint logs
docker compose logs n8n

# Check if marker file exists
docker compose exec n8n ls -la /data/.n8n_setup_complete
```

### Common Issues

1. **Missing Environment Variables**
   - Error: Template variables like `${N8N_GOOGLE_CLIENT_ID}` appear in credentials
   - Solution: Ensure all required variables are set in `.env` file

2. **Credentials Already Exist**
   - Error: Duplicate credential IDs on import
   - Solution: This shouldn't happen with the marker file, but you can manually clear credentials via n8n UI or reset the database

3. **Workflows Not Activated**
   - Check n8n logs for activation errors
   - Verify credentials are imported before workflows
   - Ensure credential IDs in workflows match those in template

## Development Notes

- The setup process only runs on first startup (idempotent)
- Credential IDs are fixed to ensure workflow references remain valid
- The template uses `envsubst` for variable substitution (requires `gettext-base` package)
- All scripts run as the `node` user for proper n8n permissions