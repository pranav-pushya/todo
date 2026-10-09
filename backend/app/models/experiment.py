"""SQLAlchemy ORM model for AI/ML Experiment Runs and Training Webhooks."""

from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class ExperimentRun(Base):
    """Tracks training runs, model evaluations, and webhook callbacks from PyTorch, TensorFlow, etc."""

    __tablename__ = "experiment_runs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    model_name = Column(String(255), nullable=False, index=True)
    framework = Column(String(50), default="PyTorch", nullable=False)
    status = Column(String(50), default="success", nullable=False)  # success, failed, running
    current_epoch = Column(Integer, nullable=True)
    total_epochs = Column(Integer, nullable=True)
    metrics_json = Column(Text, nullable=True)  # JSON-encoded metrics dictionary
    training_time_seconds = Column(Float, nullable=True)
    dataset_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    # Relationships
    task = relationship("Task", back_populates="experiments")

    def __repr__(self) -> str:
        return f"<ExperimentRun(id={self.id}, model='{self.model_name}', status='{self.status}')>"
