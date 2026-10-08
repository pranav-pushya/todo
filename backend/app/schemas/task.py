"""Pydantic validation schemas for Tasks."""

from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PriorityEnum


class TaskBase(BaseModel):
    """Base schema holding common task fields."""

    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed task description")
    due_date: Optional[date] = Field(None, description="Due date (YYYY-MM-DD)")
    priority: PriorityEnum = Field(PriorityEnum.P4, description="Priority level: P1, P2, P3, or P4")
    project_id: Optional[int] = Field(None, description="Parent project ID (null = Inbox)")
    tags: Optional[str] = Field("", description="Comma-separated tags (e.g. 'work, urgent')")


class TaskCreate(TaskBase):
    """Schema used to create a new task."""
    pass


class TaskUpdate(BaseModel):
    """Schema for updating a task. All fields are optional to support partial updates."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[PriorityEnum] = None
    project_id: Optional[int] = None
    completed: Optional[bool] = None
    tags: Optional[str] = None


class TaskResponse(TaskBase):
    """Schema returned to frontend clients when tasks are queried."""

    id: int
    completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # Optional metadata from joined parent project
    project_title: Optional[str] = None
    project_color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
