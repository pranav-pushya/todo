"""SQLAlchemy ORM model for User Accounts & Profiles."""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    """Return current UTC timestamp without timezone offset issues."""
    return datetime.now(timezone.utc)


class User(Base):
    """Represents an authenticated user account with profile information."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(String(50), default="Fullstack Developer", nullable=False)
    github_username = Column(String(100), nullable=True)
    theme_preference = Column(String(50), default="dark", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships to user-owned entities
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="user", cascade="all, delete-orphan")
    experiments = relationship("ExperimentRun", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} username='{self.username}' email='{self.email}'>"
