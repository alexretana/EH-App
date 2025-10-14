# Use the same n8n base image as in docker-compose.yml
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /tmp

# Install required packages (Alpine uses apk, not apt-get)
USER root
RUN apk add --no-cache \
    gettext \
    curl \
    bash

# Create scripts directory
RUN mkdir -p /scripts

# Copy setup scripts
COPY scripts/generate-creds.sh /scripts/generate-creds.sh
COPY scripts/setup-workflows.sh /scripts/setup-workflows.sh
RUN chmod +x /scripts/*.sh

# Copy workflow and credential files to /data directory structure
# These will be available when the container starts
COPY workflow&creds /data/workflow&creds

# Fix permissions for the entire /data directory so node user can write
# This is critical for creating the setup marker file
RUN chown -R node:node /data

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch back to n8n user
USER node

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]