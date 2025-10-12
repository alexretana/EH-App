# Use the same n8n base image as in docker-compose.yml
FROM n8nio/n8n:latest

# Set working directory
WORKDIR /tmp

# Install Python and pip for the setup script
USER root
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python requests library
RUN pip3 install requests

# Copy the setup script and workflow files
COPY setup_n8n.py .
COPY *.json .

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Switch back to n8n user
USER node

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]