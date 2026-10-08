"""Pydantic validation schemas for Projects."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    """Base schema holding shared Project attributes."""

    title: str = Field(..., min_length=1, max_length=100, description="Project title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional project summary")
    color: str = Field("#1d4ed8", description="Hex color code (defaults to Cobalt Blue)")


class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project (all fields optional)."""

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = None
    is_archived: Optional[bool] = None


class ProjectResponse(ProjectBase):
    """Schema returned when reading project data."""

    id: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    task_count: int = Field(0, description="Total active tasks in this project")
    completed_task_count: int = Field(0, description="Total completed tasks in this project")

    model_config = ConfigDict(from_attributes=True)
