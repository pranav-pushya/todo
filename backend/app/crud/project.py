"""CRUD operations for Project models."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


def to_project_response(project: Project) -> ProjectResponse:
    """Helper to convert a Project ORM instance into ProjectResponse with task counts."""
    active_count = sum(1 for t in project.tasks if not t.completed)
    completed_count = sum(1 for t in project.tasks if t.completed)
    return ProjectResponse(
        id=project.id,
        title=project.title,
        description=project.description,
        color=project.color,
        is_archived=project.is_archived,
        created_at=project.created_at,
        updated_at=project.updated_at,
        task_count=active_count,
        completed_task_count=completed_count,
    )


def get_projects(
    db: Session,
    include_archived: bool = False,
    skip: int = 0,
    limit: int = 100,
) -> List[ProjectResponse]:
    """Retrieve all projects with pagination and active/completed task counts."""
    query = db.query(Project)
    if not include_archived:
        query = query.filter(Project.is_archived.is_(False))
    projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    return [to_project_response(p) for p in projects]


def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
    """Retrieve a single Project ORM instance by ID."""
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_by_title(db: Session, title: str) -> Optional[Project]:
    """Retrieve a Project ORM instance by title (case-insensitive)."""
    return db.query(Project).filter(Project.title.ilike(title.strip())).first()


def create_project(db: Session, project_in: ProjectCreate) -> Project:
    """Create and persist a new Project."""
    db_project = Project(
        title=project_in.title.strip(),
        description=project_in.description,
        color=project_in.color or "#1d4ed8",
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(
    db: Session,
    db_project: Project,
    project_in: ProjectUpdate,
) -> Project:
    """Update fields on an existing Project."""
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "title" and value is not None:
            value = value.strip()
        setattr(db_project, field, value)

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, db_project: Project) -> None:
    """Delete a project and cascade-delete all its child tasks."""
    db.delete(db_project)
    db.commit()
