"""SQLAlchemy ORM model for Agile Sprints and Burndown tracking."""

from datetime import date, datetime, timezone
from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Sprint(Base):
    """Represents a time-boxed Agile Sprint for a developer or team."""

    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    goal = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationship to tasks in this sprint
    tasks = relationship("Task", back_populates="sprint")

    def __repr__(self) -> str:
        return f"<Sprint(id={self.id}, title='{self.title}', active={self.is_active})>"
