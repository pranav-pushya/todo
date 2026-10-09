"""Database CRUD operations for User Accounts & Profiles."""

from typing import Optional, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.note import Note
from app.models.sprint import Sprint
from app.models.experiment import ExperimentRun
from app.schemas.user import UserRegister, UserUpdate


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a user by their primary key ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by their unique email address."""
    return db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Retrieve a user by their unique username."""
    return db.query(User).filter(func.lower(User.username) == username.strip().lower()).first()


def get_user_by_email_or_username(db: Session, identifier: str) -> Optional[User]:
    """Retrieve a user matching either their email address or username."""
    clean_id = identifier.strip().lower()
    return db.query(User).filter(
        (func.lower(User.email) == clean_id) | (func.lower(User.username) == clean_id)
    ).first()


def create_user(db: Session, user_in: UserRegister) -> User:
    """Create a new user account with a hashed password."""
    hashed_pwd = hash_password(user_in.password)
    new_user = User(
        email=user_in.email.strip().lower(),
        username=user_in.username.strip(),
        full_name=user_in.full_name.strip() if user_in.full_name else None,
        hashed_password=hashed_pwd,
        bio=user_in.bio.strip() if user_in.bio else None,
        role=user_in.role.strip() if user_in.role else "Fullstack Developer",
        github_username=user_in.github_username.strip() if user_in.github_username else None,
        avatar_url=user_in.avatar_url.strip() if user_in.avatar_url else None,
        theme_preference="dark",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(db: Session, email_or_username: str, password: str) -> Optional[User]:
    """Authenticate a user using their email or username and password."""
    user = get_user_by_email_or_username(db, email_or_username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_profile(db: Session, user: User, user_update: UserUpdate) -> User:
    """Update profile attributes of an existing user."""
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def change_user_password(
    db: Session, user: User, current_pwd: str, new_pwd: str
) -> Tuple[bool, str]:
    """Change user password after verifying the existing password."""
    if not verify_password(current_pwd, user.hashed_password):
        return False, "Current password does not match"
    
    user.hashed_password = hash_password(new_pwd)
    db.commit()
    db.refresh(user)
    return True, "Password changed successfully"


def get_user_profile_dict(db: Session, user: User) -> dict:
    """Serialize user profile and calculate active counts for tasks, projects, notes, etc."""
    tasks_count = db.query(func.count(Task.id)).filter(
        (Task.user_id == user.id) | (Task.user_id.is_(None))
    ).scalar() or 0
    projects_count = db.query(func.count(Project.id)).filter(
        (Project.user_id == user.id) | (Project.user_id.is_(None))
    ).scalar() or 0
    notes_count = db.query(func.count(Note.id)).filter(
        (Note.user_id == user.id) | (Note.user_id.is_(None))
    ).scalar() or 0
    sprints_count = db.query(func.count(Sprint.id)).filter(
        (Sprint.user_id == user.id) | (Sprint.user_id.is_(None))
    ).scalar() or 0
    experiments_count = db.query(func.count(ExperimentRun.id)).filter(
        (ExperimentRun.user_id == user.id) | (ExperimentRun.user_id.is_(None))
    ).scalar() or 0

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "role": user.role,
        "github_username": user.github_username,
        "theme_preference": user.theme_preference,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "tasks_count": tasks_count,
        "projects_count": projects_count,
        "notes_count": notes_count,
        "sprints_count": sprints_count,
        "experiments_count": experiments_count,
    }
