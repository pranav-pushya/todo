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
    sprint_id = Column(
        Integer,
        ForeignKey("sprints.id", ondelete="SET NULL"),
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

    # Relationships
    project = relationship("Project", back_populates="tasks")
    sprint = relationship("Sprint", back_populates="tasks")
    subtasks = relationship(
        "Subtask",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="Subtask.id",
    )
    notes = relationship(
        "Note",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="Note.id",
    )
    experiments = relationship(
        "ExperimentRun",
        back_populates="task",
        cascade="all, delete-orphan",
        order_by="ExperimentRun.id.desc()",
    )

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', priority='{self.priority}', completed={self.completed})>"


class Subtask(Base):
    """Represents a fine-grained, bite-sized subtask under a parent Task."""

    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(String(255), nullable=False)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    estimated_minutes = Column(Integer, default=15, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    task = relationship("Task", back_populates="subtasks")

    def __repr__(self) -> str:
        return f"<Subtask(id={self.id}, task_id={self.task_id}, title='{self.title}', completed={self.completed})>"
