"""Database engine, session factory, and base model configuration."""

import sqlite3
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.core.config import settings

# SQLite requires check_same_thread=False when used across multiple threads in FastAPI
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)


@event.listens_for(Engine, "connect")
def configure_sqlite_pragmas(dbapi_connection, connection_record):
    """Enable foreign key constraints and Write-Ahead Logging (WAL) for SQLite.

    WAL mode allows simultaneous readers and writers, preventing database lock issues.
    Foreign keys ensure relational integrity between projects and tasks.
    """
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()


# Session factory for generating database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative base class for all SQLAlchemy ORM models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a scoped database session per request.

    Automatically closes the session after the request finishes to prevent leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
