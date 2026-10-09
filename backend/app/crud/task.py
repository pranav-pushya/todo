"""CRUD operations for Task models with Inbox, Today, and Upcoming views."""

from datetime import date, datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.models.task import Task, Subtask
from app.schemas.common import PriorityEnum, TaskViewFilter
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate, SubtaskResponse


def to_task_response(task: Task) -> TaskResponse:
    """Helper to convert a Task ORM instance into TaskResponse with project and subtask details."""
    subtasks_list = [
        SubtaskResponse(
            id=s.id,
            task_id=s.task_id,
            title=s.title,
            completed=s.completed,
            estimated_minutes=s.estimated_minutes,
            created_at=s.created_at,
        )
        for s in (task.subtasks or [])
    ]

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
        subtasks=subtasks_list,
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
    elif view == TaskViewFilter.WEEK or view == "week":
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        query = query.filter(Task.due_date >= start_of_week, Task.due_date <= end_of_week, Task.completed.is_(False))
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


def get_task_analytics(db: Session) -> dict:
    """Compute productivity metrics, completion streaks, and daily/weekly consistency."""
    today = date.today()
    all_tasks = db.query(Task).all()

    total_tasks = len(all_tasks)
    completed_tasks = sum(1 for t in all_tasks if t.completed)
    pending_tasks = total_tasks - completed_tasks
    overdue_tasks = sum(1 for t in all_tasks if not t.completed and t.due_date and t.due_date < today)

    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    priority_distribution = {
        "P1": sum(1 for t in all_tasks if t.priority == "P1"),
        "P2": sum(1 for t in all_tasks if t.priority == "P2"),
        "P3": sum(1 for t in all_tasks if t.priority == "P3"),
        "P4": sum(1 for t in all_tasks if t.priority == "P4"),
    }

    # Map dates to completed count
    completed_date_counts = {}
    due_date_counts = {}

    for t in all_tasks:
        if t.completed and t.completed_at:
            comp_date = t.completed_at.date() if hasattr(t.completed_at, "date") else None
            if comp_date:
                completed_date_counts[comp_date] = completed_date_counts.get(comp_date, 0) + 1
        elif t.completed and t.due_date:
            completed_date_counts[t.due_date] = completed_date_counts.get(t.due_date, 0) + 1

        if t.due_date:
            due_date_counts[t.due_date] = due_date_counts.get(t.due_date, 0) + 1

    # Daily consistency for past 7 days (including today)
    daily_consistency = []
    for offset in range(6, -1, -1):
        target_day = today - timedelta(days=offset)
        c_count = completed_date_counts.get(target_day, 0)
        d_count = due_date_counts.get(target_day, 0)
        daily_consistency.append({
            "date": target_day.isoformat(),
            "day": target_day.strftime("%a"),
            "completed": c_count,
            "total_due": d_count,
            "is_today": offset == 0,
        })

    # Weekly consistency for past 4 weeks
    weekly_consistency = []
    week_names = ["3 Wks Ago", "2 Wks Ago", "Last Week", "This Week"]
    for w_idx in range(4):
        w_start = today - timedelta(days=(3 - w_idx) * 7 + today.weekday())
        w_end = w_start + timedelta(days=6)
        w_completed = sum(
            count for d, count in completed_date_counts.items()
            if w_start <= d <= w_end
        )
        weekly_consistency.append({
            "label": week_names[w_idx],
            "start": w_start.isoformat(),
            "end": w_end.isoformat(),
            "completed": w_completed,
            "is_current": w_idx == 3,
        })

    # Calculate streak (consecutive days with >= 1 completion)
    streak = 0
    check_day = today
    if completed_date_counts.get(check_day, 0) > 0:
        streak += 1
        check_day -= timedelta(days=1)
        while completed_date_counts.get(check_day, 0) > 0:
            streak += 1
            check_day -= timedelta(days=1)
    else:
        check_day = today - timedelta(days=1)
        while completed_date_counts.get(check_day, 0) > 0:
            streak += 1
            check_day -= timedelta(days=1)

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate,
        "current_streak": streak,
        "priority_distribution": priority_distribution,
        "daily_consistency": daily_consistency,
        "weekly_consistency": weekly_consistency,
    }


def add_subtask(
    db: Session,
    task_id: int,
    title: str,
    estimated_minutes: int = 15,
) -> Subtask:
    """Create and persist a subtask under a parent task."""
    subtask = Subtask(
        task_id=task_id,
        title=title.strip(),
        completed=False,
        estimated_minutes=estimated_minutes,
    )
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    return subtask


def toggle_subtask(
    db: Session,
    task_id: int,
    subtask_id: int,
) -> Optional[Subtask]:
    """Toggle a subtask's completion status."""
    subtask = db.query(Subtask).filter(
        Subtask.id == subtask_id,
        Subtask.task_id == task_id,
    ).first()
    if not subtask:
        return None

    subtask.completed = not subtask.completed
    db.commit()
    db.refresh(subtask)
    return subtask


def delete_subtask(
    db: Session,
    task_id: int,
    subtask_id: int,
) -> bool:
    """Delete a subtask."""
    subtask = db.query(Subtask).filter(
        Subtask.id == subtask_id,
        Subtask.task_id == task_id,
    ).first()
    if not subtask:
        return False

    db.delete(subtask)
    db.commit()
    return True


