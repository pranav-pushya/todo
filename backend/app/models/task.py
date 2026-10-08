"""SQLAlchemy ORM model for To-Do Tasks."""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    """Return current UTC timestamp without timezone offset issues."""
    return datetime.now(timezone.utc)


class Task(Base):
    """Represents a to-do item.

    If project_id is None, the task lives in the user's Inbox.
    """

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True, index=True)
    priority = Column(String(10), default="P4", nullable=False, index=True)  # P1, P2, P3, P4
    completed = Column(Boolean, default=False, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    tags = Column(String(255), default="", nullable=False)  # Comma-separated tag list e.g. "bug,ui"
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    # Relationship back to the parent Project (if any)
    project = relationship("Project", back_populates="tasks")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', priority='{self.priority}', completed={self.completed})>"
