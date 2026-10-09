"""Autonomous AI Agent Tools.

Functions executed by the agent engine when the Groq LLM calls function tools.
Directly interfaces with SQLite through SQLAlchemy to modify tasks and projects.
"""

import re
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.crud.note import create_note
from app.crud.project import create_project, get_project_by_title
from app.crud.task import (
    create_task,
    delete_task,
    get_task_by_id,
    get_tasks,
    to_task_response,
    update_task,
)
from app.models.project import Project
from app.models.task import Task
from app.schemas.common import PriorityEnum
from app.schemas.note import NoteCreate
from app.schemas.project import ProjectCreate
from app.schemas.task import TaskCreate, TaskUpdate


def parse_date_string(date_str: Optional[str]) -> Optional[date]:
    """Parse natural language date strings like 'today', 'tomorrow' or ISO 'YYYY-MM-DD'."""
    if not date_str:
        return None

    cleaned = date_str.strip().lower()
    today = date.today()

    if cleaned == "today":
        return today
    if cleaned in ("tomorrow", "tmrw"):
        return today + timedelta(days=1)
    if cleaned in ("day after tomorrow",):
        return today + timedelta(days=2)
    if cleaned in ("next week",):
        return today + timedelta(days=7)

    # Attempt standard ISO parsing: YYYY-MM-DD
    try:
        return datetime.strptime(cleaned, "%Y-%m-%d").date()
    except ValueError:
        pass

    # Attempt MM/DD or DD/MM format
    for fmt in ("%Y/%m/%d", "%d-%m-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue

    return None


def tool_create_task(
    db: Session,
    title: str,
    due_date: Optional[str] = None,
    priority: str = "P4",
    project_name: Optional[str] = None,
    tags: str = "",
) -> Dict[str, Any]:
    """Tool: Create a new task.

    If project_name is provided and doesn't exist, automatically creates the project.
    """
    project_id = None
    if project_name and project_name.strip():
        proj = get_project_by_title(db, project_name.strip())
        if not proj:
            # Auto-create project so the AI command never fails
            proj = create_project(db, ProjectCreate(title=project_name.strip()))
        project_id = proj.id

    # Normalize priority
    pri_clean = priority.upper().strip()
    if pri_clean not in ("P1", "P2", "P3", "P4"):
        pri_clean = "P4"

    parsed_due = parse_date_string(due_date)

    task_in = TaskCreate(
        title=title.strip(),
        due_date=parsed_due,
        priority=PriorityEnum(pri_clean),
        project_id=project_id,
        tags=tags or "",
    )
    task = create_task(db, task_in)

    return {
        "status": "success",
        "action": "create_task",
        "task_id": task.id,
        "title": task.title,
        "priority": task.priority,
        "due_date": str(task.due_date) if task.due_date else None,
        "project": project_name if project_name else "Inbox",
    }


def find_task_smartly(db: Session, identifier: str, only_uncompleted: bool = False) -> Optional[Task]:
    """Robustly find a task by ID, formatted string, or fuzzy title."""
    if not identifier:
        return None
    cleaned = str(identifier).strip().strip("'\"#").strip()

    # 1. Direct digit check e.g. "5"
    if cleaned.isdigit():
        t = get_task_by_id(db, int(cleaned))
        if t and (not only_uncompleted or not t.completed):
            return t

    # 2. Extract digits from patterns like "task 5", "task #5", "id 5", "item 5"
    m = re.search(r'\b(?:task|id|item)?\s*#?(\d+)\b', cleaned, re.IGNORECASE)
    if m:
        t = get_task_by_id(db, int(m.group(1)))
        if t and (not only_uncompleted or not t.completed):
            return t

    # 3. Exact title match
    q = db.query(Task)
    if only_uncompleted:
        q = q.filter(Task.completed == False)
    t = q.filter(Task.title.ilike(cleaned)).first()
    if t:
        return t

    # 4. Substring match
    t = q.filter(Task.title.ilike(f"%{cleaned}%")).first()
    if t:
        return t

    # 5. Token match without stopwords
    stopwords = {"task", "the", "a", "an", "karo", "kardo", "delete", "complete", "finish", "done", "hatao", "ko", "se"}
    words = [w for w in re.split(r'[\s\-_]+', cleaned) if len(w) > 2 and w.lower() not in stopwords]
    for w in words:
        candidate = q.filter(Task.title.ilike(f"%{w}%")).first()
        if candidate:
            return candidate

    return None


def tool_complete_task(db: Session, task_identifier: str) -> Dict[str, Any]:
    """Tool: Complete a task by ID or by title search."""
    task = find_task_smartly(db, task_identifier, only_uncompleted=True)

    if not task:
        # Check if it was already completed
        already_done = find_task_smartly(db, task_identifier, only_uncompleted=False)
        if already_done and already_done.completed:
            return {
                "status": "info",
                "message": f"Task #{already_done.id} '{already_done.title}' was already completed.",
            }
        return {
            "status": "error",
            "message": f"Could not find any active task matching '{task_identifier}'.",
        }

    task.completed = True
    task.completed_at = datetime.now(timezone.utc)
    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "status": "success",
        "action": "complete_task",
        "task_id": task.id,
        "title": task.title,
        "completed": True,
    }


def tool_delete_task(db: Session, task_identifier: str) -> Dict[str, Any]:
    """Tool: Permanently delete a task by ID or title search."""
    task = find_task_smartly(db, task_identifier, only_uncompleted=False)

    if not task:
        return {
            "status": "error",
            "message": f"Could not find any task matching '{task_identifier}' to delete.",
        }

    task_id = task.id
    title = task.title
    delete_task(db, task)

    return {
        "status": "success",
        "action": "delete_task",
        "deleted_task_id": task_id,
        "deleted_task": title,
    }


def tool_reschedule_tasks(
    db: Session,
    filter_criteria: str,
    new_due_date: str,
) -> Dict[str, Any]:
    """Tool: Reschedule tasks matching criteria (e.g. 'overdue', 'today', or title) to a new date."""
    parsed_new_date = parse_date_string(new_due_date)
    if not parsed_new_date:
        return {
            "status": "error",
            "message": f"Could not parse new due date '{new_due_date}'. Use 'tomorrow', 'YYYY-MM-DD', etc.",
        }

    crit = filter_criteria.strip().lower()
    today = date.today()
    query = db.query(Task).filter(Task.completed.is_(False))

    if crit == "overdue":
        query = query.filter(Task.due_date < today)
    elif crit == "today":
        query = query.filter(Task.due_date == today)
    else:
        # Search by keyword
        query = query.filter(Task.title.ilike(f"%{crit}%"))

    tasks = query.all()
    if not tasks:
        return {
            "status": "info",
            "message": f"No active tasks found matching criteria '{filter_criteria}'.",
            "rescheduled_count": 0,
        }

    titles = []
    for t in tasks:
        t.due_date = parsed_new_date
        db.add(t)
        titles.append(t.title)

    db.commit()

    return {
        "status": "success",
        "action": "reschedule_tasks",
        "rescheduled_count": len(tasks),
        "new_due_date": str(parsed_new_date),
        "tasks": titles,
    }


def tool_create_project(
    db: Session,
    name: str,
    color: str = "#1d4ed8",
    description: str = "",
) -> Dict[str, Any]:
    """Tool: Create a new project folder."""
    clean_name = name.strip()
    existing = get_project_by_title(db, clean_name)
    if existing:
        return {
            "status": "info",
            "message": f"Project '{clean_name}' already exists.",
            "project_id": existing.id,
        }

    proj = create_project(
        db,
        ProjectCreate(
            title=clean_name,
            color=color or "#1d4ed8",
            description=description or None,
        ),
    )

    return {
        "status": "success",
        "action": "create_project",
        "project_id": proj.id,
        "title": proj.title,
        "color": proj.color,
    }


def tool_list_tasks(
    db: Session,
    view: str = "all",
    project_name: Optional[str] = None,
) -> Dict[str, Any]:
    """Tool: List tasks for the AI agent to inspect current state."""
    project_id = None
    if project_name:
        proj = get_project_by_title(db, project_name.strip())
        if proj:
            project_id = proj.id

    tasks = get_tasks(db, view=view, project_id=project_id)
    summary = [
        {
            "id": t.id,
            "title": t.title,
            "due_date": str(t.due_date) if t.due_date else None,
            "priority": t.priority,
            "completed": t.completed,
            "project": t.project_title or "Inbox",
        }
        for t in tasks[:30]
    ]

    return {
        "status": "success",
        "action": "list_tasks",
        "count": len(summary),
        "tasks": summary,
    }


def tool_ui_control(
    db: Session,
    action: str,
    view: Optional[str] = None,
    project_name: Optional[str] = None,
    priority: Optional[str] = None,
    search_query: Optional[str] = None,
    theme: Optional[str] = None,
) -> Dict[str, Any]:
    """Tool: Instruct frontend web application to perform UI interactions.

    Supports opening/closing modals, command palette, navigation views, priority filters, search, and theme switching.
    """
    clean_action = action.strip().lower()
    project_id = None
    if project_name and project_name.strip():
        proj = get_project_by_title(db, project_name.strip())
        if proj:
            project_id = proj.id

    return {
        "status": "success",
        "action": "ui_control",
        "ui_action": clean_action,
        "view": view.lower() if view else None,
        "project_name": project_name,
        "project_id": project_id,
        "priority": priority.upper() if priority else None,
        "search_query": search_query,
        "theme": theme.lower().strip() if theme else None,
        "message": f"UI command executed: {clean_action}",
    }


def tool_save_code_to_note(
    db: Session,
    title: str,
    code_or_content: str,
    language: Optional[str] = "python",
    tags: str = "code, ml",
) -> Dict[str, Any]:
    """Tool: Save a code architecture, ML script, or mathematical note into the user's Notes Workspace."""
    formatted_content = f"```{language or 'python'}\n{code_or_content.strip()}\n```"
    note_in = NoteCreate(
        title=title.strip(),
        content=formatted_content,
        tags=tags or "code, ml",
        pinned=False,
    )
    note = create_note(db, note_in)
    return {
        "status": "success",
        "action": "save_code_to_note",
        "note_id": note.id,
        "title": note.title,
        "message": f"Saved code architecture note '{note.title}' into Notes Workspace",
    }


# Map tool name string to callable function
TOOL_MAP = {
    "create_task": tool_create_task,
    "complete_task": tool_complete_task,
    "delete_task": tool_delete_task,
    "reschedule_tasks": tool_reschedule_tasks,
    "create_project": tool_create_project,
    "list_tasks": tool_list_tasks,
    "ui_control": tool_ui_control,
    "save_code_to_note": tool_save_code_to_note,
}

