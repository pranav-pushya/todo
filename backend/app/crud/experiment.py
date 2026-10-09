"""CRUD operations for AI/ML experiment runs and webhook integration."""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.experiment import ExperimentRun
from app.models.task import Task
from app.schemas.experiment import ExperimentResponse, ExperimentWebhookPayload


def to_experiment_response(exp: ExperimentRun) -> ExperimentResponse:
    """Convert an ExperimentRun ORM instance into an ExperimentResponse Pydantic schema."""
    metrics = None
    if exp.metrics_json:
        try:
            metrics = json.loads(exp.metrics_json)
        except Exception:
            metrics = {}

    return ExperimentResponse(
        id=exp.id,
        task_id=exp.task_id,
        task_title=exp.task.title if exp.task else None,
        model_name=exp.model_name,
        framework=exp.framework,
        status=exp.status,
        current_epoch=exp.current_epoch,
        total_epochs=exp.total_epochs,
        metrics=metrics,
        training_time_seconds=exp.training_time_seconds,
        dataset_name=exp.dataset_name,
        created_at=exp.created_at,
    )


def process_experiment_webhook(
    db: Session,
    payload: ExperimentWebhookPayload,
) -> Tuple[ExperimentRun, Optional[Task]]:
    """Process incoming ML training webhook callback and optionally auto-complete task."""
    task = None

    # 1. Resolve task by ID if provided
    if payload.task_id:
        task = db.query(Task).filter(Task.id == payload.task_id).first()

    # 2. Or resolve task by title if provided
    if not task and payload.task_title:
        task = (
            db.query(Task)
            .filter(Task.title.ilike(f"%{payload.task_title.strip()}%"), Task.completed == False)
            .first()
        )

    # 3. If no matching task was found, auto-create one!
    if not task:
        title = payload.task_title or f"Train {payload.model_name}"
        task = Task(
            title=title,
            description=f"Auto-generated via ML Training Webhook for {payload.model_name} ({payload.framework})",
            priority="P2",
            tags="ml,training",
            completed=False,
        )
        db.add(task)
        db.flush()

    # 4. If training status is success, auto-complete the task!
    if payload.status == "success":
        task.completed = True
        task.completed_at = datetime.now(timezone.utc)
        # Mark all pending subtasks as completed as well
        if task.subtasks:
            for st in task.subtasks:
                st.completed = True
    elif payload.status == "failed":
        task.priority = "P1"
        if not task.description:
            task.description = ""
        task.description += f"\n[!] Training Run Failed for {payload.model_name}"

    # 5. Persist the ExperimentRun record
    metrics_str = json.dumps(payload.metrics) if payload.metrics else None

    experiment = ExperimentRun(
        task_id=task.id if task else None,
        model_name=payload.model_name,
        framework=payload.framework or "PyTorch",
        status=payload.status or "success",
        current_epoch=payload.current_epoch,
        total_epochs=payload.total_epochs,
        metrics_json=metrics_str,
        training_time_seconds=payload.training_time_seconds,
        dataset_name=payload.dataset_name,
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    if task:
        db.refresh(task)

    return experiment, task


def get_experiments(db: Session, limit: int = 50) -> List[ExperimentResponse]:
    """Retrieve recent experiment runs ordered by creation date descending."""
    runs = (
        db.query(ExperimentRun)
        .order_by(ExperimentRun.created_at.desc())
        .limit(limit)
        .all()
    )
    return [to_experiment_response(r) for r in runs]


def delete_experiment(db: Session, experiment_id: int) -> bool:
    """Delete an experiment run record."""
    exp = db.query(ExperimentRun).filter(ExperimentRun.id == experiment_id).first()
    if not exp:
        return False
    db.delete(exp)
    db.commit()
    return True
