"""API routes for Agile Sprint Mode and Burndown Charts."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.sprint import (
    assign_task_to_sprint,
    complete_sprint,
    compute_sprint_burndown,
    create_sprint,
    get_all_sprints,
    get_or_create_active_sprint,
    to_sprint_response,
)
from app.crud.task import to_task_response
from app.schemas.sprint import BurndownResponse, SprintCreate, SprintResponse
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/sprints", tags=["Agile Sprints & Burndown"])


@router.get(
    "/",
    response_model=List[SprintResponse],
    summary="List all sprints",
)
def list_sprints(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Retrieve all sprints ordered by creation date descending."""
    sprints = get_all_sprints(db, skip=skip, limit=limit)
    return [to_sprint_response(s) for s in sprints]


@router.get(
    "/active",
    summary="Get current active Sprint with assigned tasks and metrics",
)
def get_current_sprint(
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve the current active sprint or initialize one."""
    sprint = get_or_create_active_sprint(db)
    tasks = [to_task_response(t) for t in sprint.tasks]
    return {
        "sprint": to_sprint_response(sprint),
        "tasks": tasks,
    }


@router.post(
    "/",
    response_model=SprintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and start a new sprint",
)
def start_sprint(
    sprint_in: SprintCreate,
    db: Session = Depends(get_db),
):
    """Start a new sprint milestone for solo development."""
    sprint = create_sprint(db, sprint_in)
    return to_sprint_response(sprint)


@router.post(
    "/{sprint_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Assign a task to a sprint",
)
def add_task_to_sprint(
    sprint_id: int,
    task_id: int,
    db: Session = Depends(get_db),
):
    """Assign task to sprint backlog."""
    task = assign_task_to_sprint(db, sprint_id, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task #{task_id} not found",
        )
    return to_task_response(task)


@router.get(
    "/{sprint_id}/burndown",
    response_model=BurndownResponse,
    summary="Compute sprint burndown chart series and velocity prediction",
)
def get_burndown_chart(
    sprint_id: int,
    db: Session = Depends(get_db),
):
    """Calculate ideal slope vs actual trajectory."""
    try:
        return compute_sprint_burndown(db, sprint_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/{sprint_id}/complete",
    response_model=SprintResponse,
    summary="Complete a sprint",
)
def finish_sprint(
    sprint_id: int,
    db: Session = Depends(get_db),
):
    """Mark sprint as done."""
    sprint = complete_sprint(db, sprint_id)
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sprint #{sprint_id} not found",
        )
    return to_sprint_response(sprint)
