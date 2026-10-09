"""Master API router combining all v1 endpoints."""

from fastapi import APIRouter
from app.api.v1.agent import router as agent_router
from app.api.v1.projects import router as projects_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.notes import router as notes_router
from app.api.v1.ml import router as ml_router
from app.api.v1.sprints import router as sprints_router

api_router = APIRouter()

# Mount endpoints
api_router.include_router(projects_router)
api_router.include_router(tasks_router)
api_router.include_router(notes_router)
api_router.include_router(agent_router)
api_router.include_router(ml_router)
api_router.include_router(sprints_router)


