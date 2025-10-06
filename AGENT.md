# Frameworks

Frontend: Javascript; Solid.js + vite, Tailswindcss, npm/ pnpm (package magager)

Backend: Python; psycopg, fastapi, uvicorn, uv (package manager)

Database: Postgresql

# Scope

This is a prototype we're making. This means that redesigns to database do not require data migration scripts. Rather, there should a mock data generator which should be updated to align with the change.

# Server Execution

The root has a package.json + pnpm-workspace.yml that allows running `pnpm run dev` in the root to start up both servers (assuming both frontend and backend environment have been installed and managaed). If you read package.json, you'll see frontend and backend are lazy loaded

# Validation Workflow (with sandbox)

You will use github copespaces as a sandbox and use the following instructions and commands to carry out your validations:

1. Ensure Access & Identify Codespaces
gh auth status || gh auth login

# Get codespace name (store the first match)
CODESPACE=$(gh codespace list --repo <owner/repo> --json name --jq '.[0].name')


If none exists:

CODESPACE=$(gh codespace create --repo <owner/repo> --branch <branch> --machine standardLinux --json name --jq .name)

2. Push Local Changes to Remote
git add .
git commit -m "agent update"
git push


(Codespace should auto-sync, since it tracks the branch. If not, force a pull via SSH below.)

3. Remotely Update Dependencies & Restart App
# Ensure latest code pulled
gh codespace ssh -c "$CODESPACE" -- "cd /workspaces/<repo> && git pull"

# Reinstall deps if necessary
gh codespace ssh -c "$CODESPACE" -- "cd /workspaces/<repo> && corepack enable && pnpm install"

# Kill old app instances
gh codespace ssh -c "$CODESPACE" -- "pkill -f 'pnpm|uvicorn' || true"

# Relaunch in background with logging
gh codespace ssh -c "$CODESPACE" -- "cd /workspaces/<repo> && pnpm run dev > app.log 2>&1 &"

4. Retrieve Logs Back to Local for AI Analysis
gh codespace ssh -c "$CODESPACE" -- "cat /workspaces/<repo>/app.log"


(Optional: Stream live logs)

gh codespace ssh -c "$CODESPACE" -- "tail -n 100 -f /workspaces/<repo>/app.log"

5. Validate Health
gh codespace ssh -c "$CODESPACE" -- "curl -I http://localhost:5173"
gh codespace ssh -c "$CODESPACE" -- "curl -I http://localhost:8000"