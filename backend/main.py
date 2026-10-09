"""Main FastAPI Application Entry Point.

Configures CORS, lifespan startup events, database table initialization,
and mounts all REST API routes for Web and Mobile clients.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.router import api_router
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal


def auto_migrate_sqlite():
    """Ensure newly added columns exist in SQLite tables on startup and seed default developer profile."""
    with engine.connect() as conn:
        # 1. Migrate tasks.sprint_id if missing
        task_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(tasks)")).fetchall()]
        if "sprint_id" not in task_cols:
            conn.execute(text("ALTER TABLE tasks ADD COLUMN sprint_id INTEGER REFERENCES sprints(id) ON DELETE SET NULL"))
            conn.commit()

        # 2. Migrate notes.task_id and format if missing
        note_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(notes)")).fetchall()]
        if "task_id" not in note_cols:
            conn.execute(text("ALTER TABLE notes ADD COLUMN task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL"))
            conn.commit()
        if "format" not in note_cols:
            conn.execute(text("ALTER TABLE notes ADD COLUMN format VARCHAR(20) DEFAULT 'markdown'"))
            conn.commit()

        # 3. Migrate user_id across tasks, projects, notes, sprints, experiment_runs
        for tbl in ["tasks", "projects", "notes", "sprints", "experiment_runs"]:
            cols = [r[1] for r in conn.execute(text(f"PRAGMA table_info({tbl})")).fetchall()]
            if "user_id" not in cols:
                conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE"))
                conn.commit()

        # 3b. Migrate users reset_token and firebase_uid columns if missing
        user_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(users)")).fetchall()]
        if "firebase_uid" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128)"))
            conn.commit()
        if "reset_token" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(100)"))
            conn.commit()
        if "reset_token_expires_at" not in user_cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME"))
            conn.commit()

        # 4. Seed default developer demo user if users table is empty
        user_count = conn.execute(text("SELECT count(*) FROM users")).scalar()
        if user_count == 0:
            from app.core.security import hash_password
            default_pwd = hash_password("demo123")
            conn.execute(
                text(
                    """
                    INSERT INTO users (email, username, full_name, hashed_password, bio, role, github_username, avatar_url, theme_preference, is_active, created_at, updated_at)
                    VALUES (:email, :username, :full_name, :pwd, :bio, :role, :gh, :avatar, :theme, 1, datetime('now'), datetime('now'))
                    """
                ),
                {
                    "email": "demo@example.com",
                    "username": "demo_user",
                    "full_name": "Demo Engineer",
                    "pwd": default_pwd,
                    "bio": "Building autonomous Kortex workflows, sprint planning, and ML experiments.",
                    "role": "Fullstack AI Developer",
                    "gh": "demo-engineer",
                    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    "theme": "dark",
                }
            )
            conn.commit()

            demo_user_id = conn.execute(text("SELECT id FROM users WHERE username = 'demo_user'")).scalar()
            if demo_user_id:
                # Link existing orphaned records to demo user
                for tbl in ["tasks", "projects", "notes", "sprints", "experiment_runs"]:
                    conn.execute(text(f"UPDATE {tbl} SET user_id = :uid WHERE user_id IS NULL"), {"uid": demo_user_id})
                conn.commit()



@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown.

    Automatically ensures all SQLite database tables exist on server boot.
    """
    # Startup: Ensure all ORM models are registered as tables in SQLite
    Base.metadata.create_all(bind=engine)
    auto_migrate_sqlite()
    yield
    # Shutdown logic (if any) can be placed here


# Initialize the FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-ready backend API for the Kortex Platform. "
        "Supports projects, tasks, smart views (Inbox, Today, Upcoming), "
        "and autonomous AI Agent tool execution."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows the React Web App (Vite on :5173) and React Native Mobile App (Expo)
# to make API requests without being blocked by browser security policies.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def root_status():
    """Welcome endpoint pointing developers and clients to the interactive Swagger UI."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME}!",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health", tags=["Health"], status_code=status.HTTP_200_OK)
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"], status_code=status.HTTP_200_OK)
def health_check():
    """Health check endpoint verifying server uptime and database connectivity."""
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "version": settings.VERSION,
    }


# Mount all Version 1 API routes (/api/v1/projects and /api/v1/tasks)
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

