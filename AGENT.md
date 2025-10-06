# Frameworks

Frontend: Javascript; Solid.js + vite, Tailswindcss, npm/ pnpm (package magager)

Backend: Python; psycopg3, fastapi, uvicorn, uv (package manager)

Database: Postgresql

# Scope

This is a prototype we're making. This means that redesigns to database do not require data migration scripts. Rather, there should a mock data generator which should be updated to align with the change.

# Server Execution

The root has a package.json + pnpm-workspace.yml that allows running `pnpm run dev` in the root to start up both servers (assuming both frontend and backend environment have been installed and managaed). If you read package.json, you'll see frontend and backend are lazy loaded

<!-- # Reproducibility

You always develop this as dockerized containers using dockerfiles and docker-compose.yml
This makes reproducibility and redeployment seemless. -->
