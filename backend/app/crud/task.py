"""CRUD operations for Task models with Inbox, Today, and Upcoming views."""

from datetime import date, datetime, timezone
from typing import List, Optional
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.common import PriorityEnum, TaskViewFilter
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate


def to_task_response(task: Task) -> TaskResponse:
    """Helper to convert a Task ORM instance into TaskResponse with project details."""
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        priority=PriorityEnum(task.priority),
        project_id=task.project_id,
        completed=task.completed,
        completed_at=task.completed_at,
        tags=task.tags or "",
        created_at=task.created_at,
        updated_at=task.updated_at,
        project_title=task.project.title if task.project else None,
        project_color=task.project.color if task.project else None,
    )


def get_tasks(
    db: Session,
    view: Optional[str] = None,
    project_id: Optional[int] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
) -> List[TaskResponse]:
    """Retrieve tasks with optional view filters, project scoping, and sorting."""
    today = date.today()
    query = db.query(Task)

    # 1. Apply View Filter
    if view == TaskViewFilter.INBOX or view == "inbox":
        query = query.filter(Task.project_id.is_(None), Task.completed.is_(False))
    elif view == TaskViewFilter.TODAY or view == "today":
        query = query.filter(Task.due_date == today, Task.completed.is_(False))
    elif view == TaskViewFilter.UPCOMING or view == "upcoming":
        query = query.filter(Task.due_date > today, Task.completed.is_(False))
    elif view == TaskViewFilter.COMPLETED or view == "completed":
        query = query.filter(Task.completed.is_(True))

    # 2. Project Filter
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    # 3. Priority Filter
    if priority is not None:
        query = query.filter(Task.priority == priority)

    # 4. Search Keyword Filter
    if search:
        query = query.filter(Task.title.ilike(f"%{search.strip()}%"))

    # Priority sort ordering: P1 (1) -> P2 (2) -> P3 (3) -> P4 (4)
    priority_order = case(
        (Task.priority == "P1", 1),
        (Task.priority == "P2", 2),
        (Task.priority == "P3", 3),
        (Task.priority == "P4", 4),
        else_=5,
    )

    tasks = (
        query.order_by(
            Task.completed.asc(),
            priority_order.asc(),
            Task.due_date.asc().nullslast(),
            Task.created_at.desc(),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [to_task_response(t) for t in tasks]


def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
    """Retrieve a single Task ORM instance by ID."""
    return db.query(Task).filter(Task.id == task_id).first()


def create_task(db: Session, task_in: TaskCreate) -> Task:
    """Create and persist a new Task."""
    db_task = Task(
        title=task_in.title.strip(),
        description=task_in.description,
        due_date=task_in.due_date,
        priority=task_in.priority.value if hasattr(task_in.priority, "value") else str(task_in.priority),
        project_id=task_in.project_id,
        tags=task_in.tags or "",
        completed=False,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, db_task: Task, task_in: TaskUpdate) -> Task:
    """Update an existing task with partial modifications."""
    update_data = task_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "title" and value is not None:
            value = value.strip()
        elif field == "priority" and value is not None:
            value = value.value if hasattr(value, "value") else str(value)
        elif field == "completed" and value is not None:
            if value and not db_task.completed:
                db_task.completed_at = datetime.now(timezone.utc)
            elif not value:
                db_task.completed_at = None
        setattr(db_task, field, value)

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def toggle_task_completion(db: Session, db_task: Task) -> Task:
    """Toggle a task's completed status between True and False."""
    db_task.completed = not db_task.completed
    if db_task.completed:
        db_task.completed_at = datetime.now(timezone.utc)
    else:
        db_task.completed_at = None

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, db_task: Task) -> None:
    """Remove a task from the database."""
    db.delete(db_task)
    db.commit()
