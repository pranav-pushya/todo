"""Pydantic schemas for Agile Sprints and Burndown charts."""

from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SprintCreate(BaseModel):
    """Schema to initialize a new Sprint."""

    title: str = Field(..., min_length=1, max_length=255, description="Sprint Name (e.g. Sprint 1 - Core Model)")
    goal: Optional[str] = Field(None, max_length=1000, description="Sprint objective")
    start_date: Optional[date] = Field(default_factory=date.today)
    end_date: date = Field(..., description="Target completion date")


class SprintResponse(BaseModel):
    """Structured sprint summary response."""

    id: int
    title: str
    goal: Optional[str] = None
    start_date: date
    end_date: date
    is_active: bool
    total_tasks: int = 0
    completed_tasks: int = 0
    remaining_tasks: int = 0
    days_left: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class BurndownPoint(BaseModel):
    """Daily data point on the burndown chart."""

    day_index: int
    date: str
    ideal_remaining: float
    actual_remaining: float
    completed_on_day: int


class BurndownResponse(BaseModel):
    """Complete burndown analysis response."""

    sprint: SprintResponse
    burndown_series: List[BurndownPoint]
    velocity_tasks_per_day: float
    status_prediction: str  # 'ahead', 'on_track', 'behind'
