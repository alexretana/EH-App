# Frameworks

Frontend: Javascript; Solid.js + vite, Tailswindcss, npm/ pnpm (package magager)

Backend: Python; psycopg, fastapi, uvicorn, uv (package manager)

Database: Postgresql

# Scope

This is a prototype we're making. This means that redesigns to database do not require data migration scripts. Rather, there should a mock data generator which should be updated to align with the change.

# Validation

To test out the backend, construct http requests and send them using curl. There is a vite proxy set up so you can hit the frontend's '/api' route to reach the backend.

For the frontend, use a playwright mcp tool (open a browser if one isn't available to you) to visit the website, interact with it, and read the console logs to check for mistakes.

Note that you can use gh to get information on open ports and generated urls to travel to.

If you need to start a new browser, use the browser_close tool commnad.
**DO NOT** try to kill playwright with pkill

# Trouble Shooting

The logs for the frontend and backend are sent to logs/nohup.out. Read it's tail to get information about the most recent runs.

Leverage context7 mcp tool to look up docs when you're unsure about how to implement something, or have made multiple mistakes trying to implement a feature.

# Server Execution

The root directory contains a package.json and pnpm-workspace.yml that define both the frontend (Vite + SolidJS) and backend (FastAPI + Uvicorn) workspaces.
Running pnpm run dev in the root starts both servers concurrently (assuming dependencies for both have been installed and managed).

## Start Server (Detached Mode)

Always run the server in detached mode so it persists after your terminal session ends. Use nohup:

```bash
nohup pnpm run dev > nohup.out 2>&1 &
```


- nohup ensures the process doesn’t terminate when you close the terminal.

- > nohup.out 2>&1 logs both stdout and stderr to nohup.out.

- The trailing & runs it in the background.

To verify it’s running:

```bash
ps aux | grep "pnpm run dev"
```

## Stop Server

Find and kill the running detached process:

```bash
pkill -f "pnpm run dev"
```

If you want to be more selective, list the PID first:

```bash
ps aux | grep "pnpm run dev"
kill <PID>
```

Restart Server

Safely restart by chaining the above steps:

```bash
pkill -f "pnpm run dev"
sleep 2
nohup pnpm run dev > nohup.out 2>&1 &
```


---


IMPORTANT: You are working from a github codespace. Leverage this knowledge however relavant.