"""SQLAlchemy ORM model for AI Agent execution logs."""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Integer, String, Text

from app.core.database import Base


def utcnow():
    """Return current UTC timestamp without timezone offset issues."""
    return datetime.now(timezone.utc)


class AgentActionLog(Base):
    """Audit log storing actions executed autonomously by the AI Agent."""

    __tablename__ = "agent_action_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prompt = Column(Text, nullable=False)
    action_type = Column(String(100), nullable=False, index=True)
    parameters = Column(Text, nullable=True)  # JSON-encoded arguments
    result = Column(Text, nullable=True)      # Human-readable result or JSON
    status = Column(String(50), default="success", nullable=False, index=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<AgentActionLog(id={self.id}, action='{self.action_type}', status='{self.status}')>"
