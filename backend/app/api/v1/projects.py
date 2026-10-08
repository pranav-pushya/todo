"""Project REST API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.project import (
    create_project,
    delete_project,
    get_project_by_id,
    get_project_by_title,
    get_projects,
    to_project_response,
    update_project,
)
from app.crud.task import to_task_response
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=List[ProjectResponse])
def read_projects(
    include_archived: bool = Query(False, description="Include archived projects"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve all projects with task completion counts."""
    return get_projects(db=db, include_archived=include_archived, skip=skip, limit=limit)


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def add_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
):
    """Create a new project. Rejects duplicate project names (case-insensitive)."""
    existing = get_project_by_title(db=db, title=project_in.title)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A project named '{project_in.title}' already exists.",
        )
    project = create_project(db=db, project_in=project_in)
    return to_project_response(project)


@router.get("/{project_id}", response_model=ProjectResponse)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    """Get project details by ID."""
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )
    return to_project_response(project)


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
def read_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
):
    """Get all tasks belonging directly to a specific project."""
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )
    return [to_task_response(t) for t in project.tasks]


@router.patch("/{project_id}", response_model=ProjectResponse)
def modify_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
):
    """Update project title, description, color, or archive status."""
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )
    updated = update_project(db=db, db_project=project, project_in=project_in)
    return to_project_response(updated)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    """Delete a project and all of its associated tasks."""
    project = get_project_by_id(db=db, project_id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID {project_id} not found.",
        )
    delete_project(db=db, db_project=project)
    return None
