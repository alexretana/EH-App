# Environment Variables Management Guide

## Overview

This document describes the centralized environment variable management system for the Event Horizon application. This system ensures consistent, secure, and maintainable configuration across all services.

## Architecture

### Core Principles

1. **Single Source of Truth**: All environment variables are defined in root-level `.env` files
2. **Environment Separation**: Clear distinction between development, testing, and production
3. **Security First**: Sensitive values are never committed to version control
4. **Validation**: Required variables are validated before service startup
5. **Consistency**: All services use the same environment configuration pattern

## File Structure

```
/
├── .env.example                  # Template with all variables and documentation
├── .env.infrastructure           # Static infrastructure variables (can be committed)
├── .env.credentials.example      # Template for application credentials
├── .env.third-party.example      # Template for third-party service credentials
├── .env.credentials              # Application-specific credentials (gitignored)
├── .env.third-party              # Third-party service credentials (gitignored)
├── .env.development              # Legacy development file (deprecated)
├── .env.production               # Production environment (gitignored, create when needed)
├── .gitignore                    # Ensures sensitive .env files are not committed
├── docker-compose.yml            # References multiple .env files via env_file directive
└── scripts/
    └── validate-env.sh           # Validates environment configuration
```

## Environment Files

### `.env.example`

The template file containing:
- All available environment variables
- Documentation for each variable
- Placeholder values
- Notes about required external services

**This file IS committed to version control** and serves as documentation.

### `.env.infrastructure`

Contains static infrastructure configuration that rarely changes:
- Database connection details
- Service ports and hosts
- Internal service URLs
- Docker configuration

**This file CAN be committed to version control** as it contains no sensitive secrets.

### `.env.credentials`

Contains application-specific credentials that may change between environments:
- n8n instance configuration
- Discord bot credentials
- Internal credential IDs

**This file should NOT be committed to version control** as it contains sensitive information.

### `.env.third-party`

Contains credentials for external third-party services:
- Google API credentials
- SMTP email credentials
- OpenRouter API keys
- Perplexity API keys

**This file should NOT be committed to version control** as it contains sensitive third-party credentials.

### `.env.production`

Production environment configuration (optional):
- Overrides for any of the above variables
- Production-specific settings

**This file is NEVER committed to version control** and must be created manually or via deployment automation.

### `.env.development` (DEPRECATED)

This file is kept for backward compatibility but should not be used in new deployments.
The functionality has been split into the three separate files above.

## Getting Started

### Initial Setup

1. **Review the example file**:
   ```bash
   cat .env.example
   ```

2. **Copy the infrastructure file** (already created with sensible defaults):
   ```bash
   # .env.infrastructure is already available with static configuration
   ```

3. **Create your credentials files**:
   ```bash
   # Create application credentials file from template
   cp .env.credentials.example .env.credentials
   # Edit to add your Discord bot token, n8n settings, etc.
   nano .env.credentials
   
   # Create third-party credentials file from template
   cp .env.third-party.example .env.third-party
   # Edit to add your Google API keys, SMTP credentials, etc.
   nano .env.third-party
   ```

4. **Validate configuration**:
   ```bash
   ./scripts/validate-env.sh
   ```

5. **Start services**:
   ```bash
   docker compose up -d
   ```

### For Production Deployment

1. **Create production environment files**:
   ```bash
   # Infrastructure can often be reused directly
   cp .env.infrastructure .env.infrastructure.production
   
   # Create production-specific credentials from templates
   cp .env.credentials.example .env.credentials.production
   cp .env.third-party.example .env.third-party.production
   ```

2. **Fill in production values**:
   ```bash
   nano .env.credentials.production
   nano .env.third-party.production
   # Update all placeholder values with production credentials
   ```

3. **Create production docker-compose override**:
   ```bash
   # Create docker-compose.prod.yml that overrides the env_file paths
   nano docker-compose.prod.yml
   ```

4. **Validate and deploy**:
   ```bash
   ./scripts/validate-env.sh
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## Variable Categories

### Infrastructure Variables (.env.infrastructure)

These variables define the static infrastructure setup and rarely change:
- **Database Configuration**: PostgreSQL connection details, ports, hosts
- **Service Configuration**: Backend/frontend/n8n ports and hosts
- **Redis Configuration**: Redis connection details
- **Docker Configuration**: Restart policies and container settings

### Application Credentials (.env.credentials)

These credentials are specific to your application instance:
- **n8n Configuration**: Instance ID, API keys, base URLs, webhook URLs
- **Discord Bot**: Bot token and channel ID
- **Internal Credential IDs**: References to credentials stored in n8n

### Third-Party Credentials (.env.third-party)

These are credentials for external services tied to app registrations:
- **Google APIs**: OAuth2 credentials, access/refresh tokens
- **SMTP Email**: AWS SES or other email service credentials
- **AI Services**: OpenRouter, Perplexity, and other AI API keys
- **Other External Services**: Any third-party API credentials

## Service Configuration

### How Services Access Variables

All services are configured in [`docker-compose.yml`](../docker-compose.yml) to use multiple `env_file` directives:

```yaml
services:
  backend:
    env_file:
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
    # Service can now access all variables from all three files
    # Variables in later files override earlier ones if there are conflicts
```

### Variable Precedence

When multiple environment files are used, Docker Compose loads them in order:
1. `.env.infrastructure` (loaded first)
2. `.env.credentials` (overrides infrastructure if conflicts)
3. `.env.third-party` (overrides both if conflicts)

### Service-Specific Variables

While most variables come from the root `.env` files, some services maintain additional configuration:

- **n8n**: Maintains `/n8n/.env` for workflow-specific credential IDs (generated by sanitize script)
- This file is mounted as a volume for n8n's internal use

## Validation Script

The [`validate-env.sh`](../scripts/validate-env.sh) script ensures all required variables are set:

```bash
./scripts/validate-env.sh
```

**Features**:
- Checks if `.env.development` exists
- Validates all required variables are set
- Warns about missing optional variables
- Provides clear error messages
- Exit code 0 on success, 1 on failure

**Usage in CI/CD**:
```bash
# In your deployment pipeline
./scripts/validate-env.sh || exit 1
docker compose up -d
```

## Security Best Practices

### DO ✅

1. **Always use strong, unique passwords** for production
2. **Rotate credentials regularly**
3. **Use secret management tools** (AWS Secrets Manager, HashiCorp Vault) in production
4. **Validate environment** before deployment
5. **Keep `.env.example` up-to-date** with new variables
6. **Review `.gitignore`** to ensure secrets aren't committed

### DON'T ❌

1. **Never commit actual `.env.production`** to version control
2. **Never hardcode secrets** in source code
3. **Never share credentials** via insecure channels
4. **Never use development credentials** in production
5. **Never expose environment files** in public repositories

## Troubleshooting

### Common Issues

#### "Environment file not found"

```bash
# Solution: Copy from example
cp .env.example .env.development
```

#### "Variable not set" errors

```bash
# Solution: Run validation to see what's missing
./scripts/validate-env.sh
```

#### Service can't access variables

1. Check `docker-compose.yml` has `env_file` directive
2. Verify file path is correct (relative to docker-compose.yml)
3. Ensure variable is exported in the .env file
4. Restart services: `docker compose restart`

#### Variables not updating

```bash
# Recreate containers to reload environment
docker compose down
docker compose up -d
```

## Migrating from Old Pattern

If you have existing services using different environment patterns:

1. **Identify current variables** in docker-compose.yml
2. **Add them to `.env.development`**
3. **Update docker-compose.yml** to use `env_file`
4. **Remove hardcoded values** from docker-compose.yml
5. **Remove `.env` copies** from Dockerfiles
6. **Test thoroughly** to ensure nothing breaks
7. **Update documentation**

## Advanced Usage

### Multiple Environment Files

The new structure already uses multiple environment files for better organization:

```yaml
services:
  backend:
    env_file:
      - .env.infrastructure     # Static infrastructure
      - .env.credentials        # Application credentials
      - .env.third-party        # Third-party service credentials
```

For additional flexibility, you can add environment-specific overrides:

```yaml
services:
  backend:
    env_file:
      - .env.infrastructure
      - .env.credentials
      - .env.third-party
      - .env.production         # Production overrides (optional)
      - .env.local              # Local developer overrides (gitignored)
```

Variables in later files override earlier ones.

### Variable Substitution

Docker Compose supports variable substitution:

```yaml
ports:
  - "${BACKEND_PORT:-8000}:8000"  # Use BACKEND_PORT or default to 8000
```

### Conditional Environments

Use different compose files for different environments:

```bash
# Development
docker compose -f docker-compose.yml up

# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Maintenance

### Adding New Variables

1. **Add to `.env.example`** with documentation
2. **Add to the appropriate categorized file**:
   - Infrastructure variables → `.env.infrastructure`
   - Application credentials → `.env.credentials`
   - Third-party credentials → `.env.third-party`
3. **Update validation script** if variable is required
4. **Update this documentation**
5. **Notify team members** to update their local environments

### Removing Variables

1. **Remove from all relevant `.env` files**
2. **Remove from validation script**
3. **Update documentation**
4. **Check for usage** in source code and docker-compose.yml

## References

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [12-Factor App Configuration](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Support

For questions or issues:
1. Check this documentation
2. Run `./scripts/validate-env.sh` for validation
3. Review `.env.example` for variable descriptions
4. Check service logs: `docker compose logs <service-name>`