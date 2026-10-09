"""API routes for AI/ML Experiment Runs and Training Webhook Integration."""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.experiment import (
    delete_experiment,
    get_experiments,
    process_experiment_webhook,
    to_experiment_response,
)
from app.crud.task import to_task_response
from app.schemas.experiment import ExperimentResponse, ExperimentWebhookPayload

router = APIRouter(prefix="/ml", tags=["ML Experiments & Webhooks"])


@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Receive AI/ML training webhook callback from PyTorch, TensorFlow, Colab, etc.",
)
def handle_ml_webhook(
    payload: ExperimentWebhookPayload,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Ingest model training callbacks.

    - Automatically completes the linked task if status is 'success'
    - Creates a new task if none matching exists
    - Stores full metrics dictionary (val_loss, accuracy, mAP, etc.)
    """
    experiment, task = process_experiment_webhook(db, payload)

    return {
        "message": f"Webhook processed successfully for model '{payload.model_name}'",
        "experiment": to_experiment_response(experiment),
        "task": to_task_response(task) if task else None,
        "auto_completed": task.completed if task else False,
    }


@router.get(
    "/experiments",
    response_model=List[ExperimentResponse],
    summary="List recent AI/ML experiment runs",
)
def list_experiments(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Retrieve all logged model training experiment runs."""
    return get_experiments(db, limit=limit)


@router.delete(
    "/experiments/{experiment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an experiment run record",
)
def remove_experiment(
    experiment_id: int,
    db: Session = Depends(get_db),
):
    """Remove an experiment run from database."""
    success = delete_experiment(db, experiment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Experiment #{experiment_id} not found",
        )
    return None
