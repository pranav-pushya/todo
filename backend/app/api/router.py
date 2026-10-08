"""Master API router combining all v1 endpoints."""

from fastapi import APIRouter
from app.api.v1.projects import router as projects_router
from app.api.v1.tasks import router as tasks_router

api_router = APIRouter()

# Mount endpoints
api_router.include_router(projects_router)
api_router.include_router(tasks_router)
