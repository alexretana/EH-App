# Frameworks

Frontend: Javascript; React, Tailswindcss v4, shadcn, framer motion (ui animations), react bits (background animations/optional), npm/ pnpm, (package magager)

Color Format: Use oklch, not rga. It's easier to edit colors meanifully with oklch.

Backend: Python; psycopg, fastapi, uvicorn, uv (package manager)

Database: Postgresql

# Scope

This is a prototype we're making. This means that redesigns to database do not require data migration scripts. Rather, there should a mock data generator which should be updated to align with the change.

# Validation

To test out the backend, construct http requests and send them using curl. There is a vite proxy set up so you can hit the frontend's '/api' route to reach the backend.

to validate the frontend you run

```bash
cd frontend && npx tsc --noEmit
```

And debug any errors it presents.

Never use the playwright tool unless asked to. You can suggest it to the user, but you should never start using playwright without user permission.

# Trouble Shooting


Leverage context7 mcp tool to look up docs when you're unsure about how to implement something, or have made multiple mistakes trying to implement a feature.


# Server Execution

The server is managed using a docker-compose file.

You can use docker and docker compose commands to 

- Check the status of relevant containers
- Stop containers
- Start containers
- Restart containers
- Stop composes
- Start composes
- Restart composes
- check images built
- rebuild images

When you start container/composes, also do so in detached mode.




IMPORTANT: You are working from a github codespace. Leverage this knowledge however relavant.