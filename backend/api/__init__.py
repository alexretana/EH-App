from fastapi import APIRouter
from . import projects, goals, tasks, knowledge, chat

api_router = APIRouter()

api_router.include_router(projects.router)
api_router.include_router(goals.router)
api_router.include_router(tasks.router)
api_router.include_router(knowledge.router)
api_router.include_router(chat.router)