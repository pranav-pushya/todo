"""CRUD operations for Note models."""

import re
from typing import Any, Dict, List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.task import Task
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate


def to_note_response(note: Note) -> NoteResponse:
    """Format Note ORM model into NoteResponse schema."""
    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content or "",
        format=getattr(note, "format", "markdown") or "markdown",
        color=note.color,
        pinned=note.pinned,
        tags=note.tags or "",
        task_id=note.task_id,
        task_title=note.task.title if note.task else None,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


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
        format=note_in.format or "markdown",
        color=note_in.color or "#1d4ed8",
        pinned=bool(note_in.pinned),
        tags=note_in.tags or "",
        task_id=note_in.task_id,
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


def get_or_create_task_scratchpad(db: Session, task_id: int) -> Note:
    """Find an existing scratchpad note for a task or create a linked template note."""
    existing = db.query(Note).filter(Note.task_id == task_id).first()
    if existing:
        return existing

    task = db.query(Task).filter(Task.id == task_id).first()
    title = f"Scratchpad: {task.title}" if task else "Task Scratchpad"
    desc = task.description if (task and task.description) else "None provided"

    template = (
        f"# {title}\n\n"
        f"**Linked Task**: #{task_id} ({task.priority if task else 'P3'})\n"
        f"**Context**: {desc}\n\n"
        "## 💡 Implementation Notes & Ideas\n"
        "- \n\n"
        "## ✅ Action Checklist\n"
        "- [ ] "
    )

    new_note = Note(
        task_id=task_id,
        title=title,
        content=template,
        color="#1d4ed8",
        pinned=True,
        tags="scratchpad",
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note


def sync_note_checklists_to_tasks(db: Session, note_id: int) -> Dict[str, Any]:
    """Scan markdown checklist items (- [ ] ...) in a note and auto-create them as To-Do tasks."""
    note = get_note_by_id(db=db, note_id=note_id)
    if not note or not note.content:
        return {"created_tasks_count": 0, "tasks": []}

    # Regex matches `- [ ] text` or `* [ ] text`
    matches = re.findall(r"^[\s]*[-*]\s+\[\s*\]\s+(.+)$", note.content, flags=re.MULTILINE)
    created = []

    for item_text in matches:
        title = item_text.strip()
        if not title:
            continue

        # Prevent duplicate creation if an uncompleted task already has the identical title
        exists = db.query(Task).filter(Task.title == title, Task.completed.is_(False)).first()
        if not exists:
            task = Task(
                title=title,
                description=f"Auto-synced from Note '{note.title}'",
                priority="P3",
                tags="from-note",
            )
            db.add(task)
            db.commit()
            db.refresh(task)
            created.append({"id": task.id, "title": task.title})

    return {"created_tasks_count": len(created), "tasks": created}

