"""CRUD operations package initialization."""

from app.crud.project import (
    create_project,
    delete_project,
    get_project_by_id,
    get_project_by_title,
    get_projects,
    to_project_response,
    update_project,
)
from app.crud.task import (
    create_task,
    delete_task,
    get_task_by_id,
    get_tasks,
    to_task_response,
    toggle_task_completion,
    update_task,
)

__all__ = [
    "get_projects",
    "get_project_by_id",
    "get_project_by_title",
    "create_project",
    "update_project",
    "delete_project",
    "to_project_response",
    "get_tasks",
    "get_task_by_id",
    "create_task",
    "update_task",
    "toggle_task_completion",
    "delete_task",
    "to_task_response",
]
