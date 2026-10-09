"""Note REST API endpoints for the Notes workspace."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.crud.note import (
    create_note,
    delete_note,
    get_note_by_id,
    get_notes,
    toggle_note_pin,
    update_note,
)
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("/", response_model=List[NoteResponse])
def read_notes(
    search: Optional[str] = Query(None, description="Search keyword in title, content, or tags"),
    pinned_only: bool = Query(False, description="Filter only pinned notes"),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve all notes sorted with pinned notes first."""
    return get_notes(db=db, search=search, pinned_only=pinned_only, skip=skip, limit=limit)


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def add_note(
    note_in: NoteCreate,
    db: Session = Depends(get_db),
):
    """Create a new note in the notes workspace."""
    return create_note(db=db, note_in=note_in)


@router.get("/{note_id}", response_model=NoteResponse)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve single note details by ID."""
    note = get_note_by_id(db=db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {note_id} not found.",
        )
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
def modify_note(
    note_id: int,
    note_in: NoteUpdate,
    db: Session = Depends(get_db),
):
    """Update note title, content, color, pinned status, or tags."""
    note = get_note_by_id(db=db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {note_id} not found.",
        )
    return update_note(db=db, db_note=note, note_in=note_in)


@router.patch("/{note_id}/pin", response_model=NoteResponse)
def toggle_pin(
    note_id: int,
    db: Session = Depends(get_db),
):
    """Toggle a note's pinned status."""
    note = get_note_by_id(db=db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {note_id} not found.",
        )
    return toggle_note_pin(db=db, db_note=note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_note(
    note_id: int,
    db: Session = Depends(get_db),
):
    """Permanently delete a note."""
    note = get_note_by_id(db=db, note_id=note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID {note_id} not found.",
        )
    delete_note(db=db, db_note=note)
    return None
