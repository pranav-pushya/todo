"""Pydantic schemas for AI/ML experiment runs and webhooks."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ExperimentWebhookPayload(BaseModel):
    """Payload sent by training scripts (PyTorch, TensorFlow, Colab, HuggingFace, etc.)."""

    task_id: Optional[int] = Field(default=None, description="ID of an existing task to link and complete")
    task_title: Optional[str] = Field(default=None, description="Title of task to link or auto-create")
    model_name: str = Field(..., description="Name of the model e.g. yolov8n, llama-3-8b, resnet50")
    framework: Optional[str] = Field(default="PyTorch", description="Framework e.g. PyTorch, TensorFlow, HuggingFace")
    status: Optional[str] = Field(default="success", description="Status: 'success', 'failed', or 'running'")
    current_epoch: Optional[int] = Field(default=None, description="Completed epoch count")
    total_epochs: Optional[int] = Field(default=None, description="Total target epochs")
    metrics: Optional[Dict[str, Any]] = Field(default=None, description="Metrics dict e.g. {'val_loss': 0.04, 'accuracy': 0.98}")
    training_time_seconds: Optional[float] = Field(default=None, description="Elapsed training duration in seconds")
    dataset_name: Optional[str] = Field(default=None, description="Dataset identifier")


class ExperimentResponse(BaseModel):
    """Structured response for an experiment run."""

    id: int
    task_id: Optional[int] = None
    task_title: Optional[str] = None
    model_name: str
    framework: str
    status: str
    current_epoch: Optional[int] = None
    total_epochs: Optional[int] = None
    metrics: Optional[Dict[str, Any]] = None
    training_time_seconds: Optional[float] = None
    dataset_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
