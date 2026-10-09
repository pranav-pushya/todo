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

from app.crud.user import (
    get_user_by_id,
    get_user_by_email,
    get_user_by_username,
    get_user_by_email_or_username,
    create_user,
    authenticate_user,
    update_user_profile,
    change_user_password,
    get_user_profile_dict,
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
    "get_user_by_id",
    "get_user_by_email",
    "get_user_by_username",
    "get_user_by_email_or_username",
    "create_user",
    "authenticate_user",
    "update_user_profile",
    "change_user_password",
    "get_user_profile_dict",
]

