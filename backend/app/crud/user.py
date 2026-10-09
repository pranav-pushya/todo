"""Database CRUD operations for User Accounts & Profiles."""

import secrets
from datetime import datetime, timezone, timedelta
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


def generate_password_reset_code(
    db: Session, email_or_username: str
) -> Tuple[bool, Optional[str], Optional[User], str]:
    """Generate a 6-digit recovery code valid for 15 minutes."""
    user = get_user_by_email_or_username(db, email_or_username)
    if not user:
        return False, None, None, f"No account found with username or email '{email_or_username}'."

    # Generate secure 6-digit numeric recovery code
    recovery_code = f"{secrets.randbelow(900000) + 100000}"
    user.reset_token = recovery_code
    user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.commit()
    db.refresh(user)
    return True, recovery_code, user, "Recovery code generated successfully."


def reset_password_with_code(
    db: Session, email_or_username: str, recovery_code: str, new_password: str
) -> Tuple[bool, Optional[User], str]:
    """Validate 6-digit recovery code and update user's password."""
    user = get_user_by_email_or_username(db, email_or_username)
    if not user:
        return False, None, "User not found."

    if not user.reset_token or not user.reset_token_expires_at:
        return False, None, "No active password recovery request found. Please request a new code."

    # Check expiration
    now = datetime.now(timezone.utc)
    expires = user.reset_token_expires_at
    if expires.tzinfo is None:
        expired = datetime.utcnow() > expires
    else:
        expired = now > expires

    if expired:
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()
        return False, None, "Recovery code has expired (valid for 15 minutes). Please request a new one."

    # Check code match
    if user.reset_token.strip() != recovery_code.strip():
        return False, None, "Invalid recovery code. Please check and try again."

    # Update password and clear code
    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    db.refresh(user)
    return True, user, "Password has been successfully reset."


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


def sync_firebase_user(
    db: Session,
    firebase_payload: dict,
    full_name: Optional[str] = None,
    role: Optional[str] = "Fullstack Developer",
    bio: Optional[str] = None,
    github_username: Optional[str] = None,
    avatar_url: Optional[str] = None,
) -> User:
    """Find or create a local SQLite user record matching a verified Firebase account."""
    firebase_uid = firebase_payload.get("sub") or firebase_payload.get("user_id")
    email = (firebase_payload.get("email") or f"{firebase_uid}@firebase.user").lower().strip()
    name = full_name or firebase_payload.get("name")
    picture = avatar_url or firebase_payload.get("picture")

    # 1. Try finding by firebase_uid
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if user:
        if name and not user.full_name:
            user.full_name = name
        if picture and not user.avatar_url:
            user.avatar_url = picture
        db.commit()
        db.refresh(user)
        return user

    # 2. Try finding by email (in case user already registered earlier)
    user_by_email = db.query(User).filter(func.lower(User.email) == email).first()
    if user_by_email:
        user_by_email.firebase_uid = firebase_uid
        if name and not user_by_email.full_name:
            user_by_email.full_name = name
        if picture and not user_by_email.avatar_url:
            user_by_email.avatar_url = picture
        db.commit()
        db.refresh(user_by_email)
        return user_by_email

    # 3. Create a new user with unique username
    base_username = (email.split("@")[0] or "dev").replace(".", "_")[:40]
    username = base_username
    counter = 1
    while db.query(User).filter(func.lower(User.username) == username.lower()).first():
        username = f"{base_username}_{counter}"
        counter += 1

    new_user = User(
        email=email,
        username=username,
        firebase_uid=firebase_uid,
        full_name=name or username,
        hashed_password=None,
        avatar_url=picture,
        bio=bio or "Developer using Firebase Authentication.",
        role=role or "Fullstack Developer",
        github_username=github_username,
        theme_preference="dark",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

