"""SQLAlchemy ORM model for Projects."""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    """Return current UTC timestamp without timezone offset issues."""
    return datetime.now(timezone.utc)


class Project(Base):
    """Represents a project category that groups related tasks."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    title = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(20), default="#1d4ed8", nullable=False)  # Cobalt Blue default
    is_archived = Column(Boolean, default=False, index=True, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    # Cascading delete: deleting a project deletes all its associated tasks
    tasks = relationship(
        "Task",
        back_populates="project",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


    def __repr__(self) -> str:
        return f"<Project(id={self.id}, title='{self.title}', archived={self.is_archived})>"
