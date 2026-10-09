"""SQLAlchemy ORM model for Notes."""

from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    """Return current UTC timestamp without timezone offset issues."""
    return datetime.now(timezone.utc)


class Note(Base):
    """Represents a note document in the Notes workspace."""

    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True, default="Untitled Note")
    content = Column(Text, nullable=True, default="")
    color = Column(String(50), nullable=False, default="#1d4ed8")  # Accent / category color
    pinned = Column(Boolean, default=False, nullable=False, index=True)
    tags = Column(String(255), default="", nullable=False)  # Comma-separated tags
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    task = relationship("Task", back_populates="notes")

    def __repr__(self) -> str:
        return f"<Note(id={self.id}, title='{self.title}', task_id={self.task_id}, pinned={self.pinned})>"
