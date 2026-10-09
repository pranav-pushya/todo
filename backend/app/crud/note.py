"""CRUD operations for Note models."""

from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def get_notes(
    db: Session,
    search: Optional[str] = None,
    pinned_only: bool = False,
    skip: int = 0,
    limit: int = 200,
) -> List[Note]:
    """Retrieve notes sorted by pinned status first, then latest updated."""
    query = db.query(Note)

    if pinned_only:
        query = query.filter(Note.pinned.is_(True))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(Note.title.ilike(term), Note.content.ilike(term), Note.tags.ilike(term)))

    return (
        query.order_by(Note.pinned.desc(), Note.updated_at.desc(), Note.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_note_by_id(db: Session, note_id: int) -> Optional[Note]:
    """Retrieve a single note by ID."""
    return db.query(Note).filter(Note.id == note_id).first()


def create_note(db: Session, note_in: NoteCreate) -> Note:
    """Create and persist a new Note."""
    db_note = Note(
        title=note_in.title.strip() if note_in.title else "Untitled Note",
        content=note_in.content or "",
        color=note_in.color or "#1d4ed8",
        pinned=bool(note_in.pinned),
        tags=note_in.tags or "",
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, db_note: Note, note_in: NoteUpdate) -> Note:
    """Update fields on an existing note."""
    update_data = note_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        if field == "title" and value is not None:
            value = value.strip()
        setattr(db_note, field, value)

    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def toggle_note_pin(db: Session, db_note: Note) -> Note:
    """Toggle a note's pinned state."""
    db_note.pinned = not db_note.pinned
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, db_note: Note) -> None:
    """Delete a note."""
    db.delete(db_note)
    db.commit()
