# Event Horizon PostgreSQL Database
# Uses the same base image as specified in docker-compose.yml

FROM postgres:16-alpine

# Set metadata
LABEL maintainer="Event Horizon Team"
LABEL description="PostgreSQL database with Event Horizon schema"

# Copy DDL files to the initialization directory
# PostgreSQL will automatically execute scripts in /docker-entrypoint-initdb.d/
COPY postgresql-ddl/ /docker-entrypoint-initdb.d/postgresql-ddl/

# Copy and set permissions for initialization script
COPY init-db.sh /docker-entrypoint-initdb.d/00-init-db.sh
RUN chmod +x /docker-entrypoint-initdb.d/00-init-db.sh

# The postgres:16-alpine image will automatically run scripts in
# /docker-entrypoint-initdb.d/ in alphabetical order on first container start
# Our script is prefixed with 00- to ensure it runs first

# Expose PostgreSQL port (default)
EXPOSE 5432

# Health check to ensure database is ready
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-postgres} || exit 1