"""Pydantic schemas for Notes."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class NoteBase(BaseModel):
    """Base fields shared across note schemas."""

    title: str = Field(default="Untitled Note", max_length=255, description="Note title")
    content: Optional[str] = Field(default="", description="Markdown or text note content")
    color: Optional[str] = Field(default="#1d4ed8", max_length=50, description="Accent hex color")
    pinned: Optional[bool] = Field(default=False, description="Whether the note is pinned to top")
    tags: Optional[str] = Field(default="", max_length=255, description="Comma-separated tags")


class NoteCreate(NoteBase):
    """Payload for creating a new note."""

    pass


class NoteUpdate(BaseModel):
    """Payload for updating an existing note."""

    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    color: Optional[str] = Field(None, max_length=50)
    pinned: Optional[bool] = None
    tags: Optional[str] = Field(None, max_length=255)


class NoteResponse(NoteBase):
    """Response payload containing full note details."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
