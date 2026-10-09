"""CRUD operations and Burndown algorithms for Agile Sprints."""

from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.sprint import Sprint
from app.models.task import Task
from app.schemas.sprint import (
    BurndownPoint,
    BurndownResponse,
    SprintCreate,
    SprintResponse,
)


def to_sprint_response(sprint: Sprint) -> SprintResponse:
    """Transform Sprint ORM instance into SprintResponse schema with calculated metrics."""
    tasks = sprint.tasks or []
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.completed)
    remaining_tasks = total_tasks - completed_tasks
    today = date.today()
    days_left = max(0, (sprint.end_date - today).days) if sprint.end_date >= today else 0

    return SprintResponse(
        id=sprint.id,
        title=sprint.title,
        goal=sprint.goal,
        start_date=sprint.start_date,
        end_date=sprint.end_date,
        is_active=sprint.is_active,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        remaining_tasks=remaining_tasks,
        days_left=days_left,
        created_at=sprint.created_at,
    )


def get_active_sprint(db: Session) -> Optional[Sprint]:
    """Retrieve the currently active sprint."""
    return db.query(Sprint).filter(Sprint.is_active == True).order_by(Sprint.id.desc()).first()


def get_all_sprints(db: Session, skip: int = 0, limit: int = 50) -> List[Sprint]:
    """Retrieve all sprints ordered by ID descending."""
    return db.query(Sprint).order_by(Sprint.id.desc()).offset(skip).limit(limit).all()


def get_or_create_active_sprint(db: Session) -> Sprint:
    """Retrieve the active sprint, or auto-initialize one if none exists."""
    sprint = get_active_sprint(db)
    if not sprint:
        today = date.today()
        sprint = Sprint(
            title="Sprint 1 - Core Architecture & Pipeline",
            goal="Establish core machine learning pipeline, API endpoints, and initial feature prototypes.",
            start_date=today,
            end_date=today + timedelta(days=14),
            is_active=True,
        )
        db.add(sprint)
        db.commit()
        db.refresh(sprint)

        # Auto-assign unassigned tasks to kick off the sprint
        unassigned_tasks = db.query(Task).filter(Task.sprint_id == None).limit(8).all()
        for t in unassigned_tasks:
            t.sprint_id = sprint.id
        db.commit()
        db.refresh(sprint)

    return sprint


def create_sprint(db: Session, sprint_in: SprintCreate) -> Sprint:
    """Create a new active sprint, archiving previous active sprints."""
    # Deactivate existing active sprints
    db.query(Sprint).filter(Sprint.is_active == True).update({"is_active": False})

    start_d = sprint_in.start_date or date.today()
    new_sprint = Sprint(
        title=sprint_in.title.strip(),
        goal=sprint_in.goal,
        start_date=start_d,
        end_date=sprint_in.end_date,
        is_active=True,
    )
    db.add(new_sprint)
    db.commit()
    db.refresh(new_sprint)
    return new_sprint


def assign_task_to_sprint(db: Session, sprint_id: int, task_id: int) -> Optional[Task]:
    """Associate a task with a sprint."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    task.sprint_id = sprint_id
    db.commit()
    db.refresh(task)
    return task


def complete_sprint(db: Session, sprint_id: int) -> Optional[Sprint]:
    """Mark a sprint as completed and inactive."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        return None
    sprint.is_active = False
    db.commit()
    db.refresh(sprint)
    return sprint


def compute_sprint_burndown(db: Session, sprint_id: int) -> BurndownResponse:
    """Calculate the day-by-day ideal line vs actual burndown series for a sprint."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise ValueError(f"Sprint #{sprint_id} not found")

    tasks = sprint.tasks or []
    total_tasks = len(tasks)
    today = date.today()

    start_d = sprint.start_date
    end_d = sprint.end_date
    total_days = max(1, (end_d - start_d).days)

    # Map completed dates
    completions_by_date = {}
    for t in tasks:
        if t.completed:
            c_date = t.completed_at.date() if t.completed_at else t.due_date or start_d
            completions_by_date[c_date] = completions_by_date.get(c_date, 0) + 1

    series: List[BurndownPoint] = []
    cumulative_completed = 0
    actual_on_today = total_tasks
    ideal_on_today = total_tasks

    for d_idx in range(total_days + 1):
        current_date = start_d + timedelta(days=d_idx)
        # Ideal line slope (from total_tasks down to 0)
        ideal_val = max(0.0, round(total_tasks - (d_idx / total_days) * total_tasks, 1))

        # Actual line: only plot up to today (or end date if in past)
        if current_date <= today:
            done_today = completions_by_date.get(current_date, 0)
            cumulative_completed += done_today
            actual_val = max(0.0, float(total_tasks - cumulative_completed))
            if current_date == today:
                actual_on_today = actual_val
                ideal_on_today = ideal_val
        else:
            done_today = 0
            # For future days, keep projected flat
            actual_val = max(0.0, float(total_tasks - cumulative_completed))

        series.append(
            BurndownPoint(
                day_index=d_idx,
                date=current_date.isoformat(),
                ideal_remaining=ideal_val,
                actual_remaining=actual_val,
                completed_on_day=done_today,
            )
        )

    # Velocity and status prediction
    elapsed_days = max(1, (today - start_d).days)
    velocity = round(cumulative_completed / elapsed_days, 2)

    if actual_on_today < ideal_on_today - 0.5:
        prediction = "ahead"
    elif actual_on_today > ideal_on_today + 1.0:
        prediction = "behind"
    else:
        prediction = "on_track"

    return BurndownResponse(
        sprint=to_sprint_response(sprint),
        burndown_series=series,
        velocity_tasks_per_day=velocity,
        status_prediction=prediction,
    )
