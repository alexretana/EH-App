#!/bin/bash

echo "Rebuilding services and restarting compose..."

# Stop and remove existing containers
docker-compose down

# Rebuild the images
if [ "$1" == "backend" ]; then
    echo "Rebuilding backend only..."
    docker-compose build backend --no-cache
elif [ "$1" == "frontend" ]; then
    echo "Rebuilding frontend only..."
    docker-compose build frontend --no-cache
else
    echo "Rebuilding both backend and frontend..."
    docker-compose build backend --no-cache
    docker-compose build frontend --no-cache
fi

# Start the services in detached mode
docker-compose up -d

echo "Services rebuild complete. All services are starting up..."

# Show the status of all services
docker-compose ps

echo "Done! Backend should be available at http://localhost:8000"
echo "Frontend should be available at http://localhost:5173"