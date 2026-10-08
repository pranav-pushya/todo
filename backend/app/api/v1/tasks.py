"""Task REST API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.project import get_project_by_id
from app.crud.task import (
    create_task,
    delete_task,
    get_task_by_id,
    get_tasks,
    to_task_response,
    toggle_task_completion,
    update_task,
)
from app.schemas.common import PriorityEnum, TaskViewFilter
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    view: Optional[TaskViewFilter] = Query(None, description="Filter by inbox, today, upcoming, or completed"),
    project_id: Optional[int] = Query(None, description="Filter by parent project ID"),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority: P1, P2, P3, P4"),
    search: Optional[str] = Query(None, description="Search keyword in title"),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve tasks with smart view filtering, project assignment, or priority."""
    return get_tasks(
        db=db,
        view=view.value if view else None,
        project_id=project_id,
        priority=priority.value if priority else None,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def add_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
):
    """Create a new task. If project_id is provided, verifies that the project exists."""
    if task_in.project_id is not None:
        project = get_project_by_id(db=db, project_id=task_in.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID {task_in.project_id} does not exist.",
            )
    task = create_task(db=db, task_in=task_in)
    return to_task_response(task)


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve single task details by ID."""
    task = get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )
    return to_task_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def modify_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
):
    """Update task details (supports partial fields: title, due_date, priority, etc.)."""
    task = get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )

    if task_in.project_id is not None:
        project = get_project_by_id(db=db, project_id=task_in.project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent project with ID {task_in.project_id} does not exist.",
            )

    updated = update_task(db=db, db_task=task, task_in=task_in)
    return to_task_response(updated)


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Toggle a task's completion status (marks complete or incomplete with timestamp)."""
    task = get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )
    toggled = toggle_task_completion(db=db, db_task=task)
    return to_task_response(toggled)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    """Permanently delete a task."""
    task = get_task_by_id(db=db, task_id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found.",
        )
    delete_task(db=db, db_task=task)
    return None
