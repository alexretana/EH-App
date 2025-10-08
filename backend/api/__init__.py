from fastapi import APIRouter
from . import projects, goals, tasks

api_router = APIRouter()

api_router.include_router(projects.router)
api_router.include_router(goals.router)
api_router.include_router(tasks.router)
# Temporarily disabled knowledge router due to UUID validation issues
# api_router.include_router(knowledge.router)