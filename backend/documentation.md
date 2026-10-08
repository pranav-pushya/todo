# Backend Documentation & Step-by-Step Learning Guide

Welcome to the backend documentation for the **AI-Controlled To-Do Platform**. This document is designed to be beginner-friendly. It explains the project architecture, the overall implementation plan, and breaks down every single step with **what was done**, **how it was done**, and **why it was done**.

---

## 1. 📁 Target File Structure

Below is the complete target file layout for the backend. Each folder and file has a specific responsibility:

```text
d:\Coding\Projects\todo\backend/
├── .venv/                         # Virtual environment (isolated Python packages)
├── requirements.txt               # List of all Python libraries required by this project
├── main.py                       # The entry door of the API server (starts FastAPI & CORS)
├── test_api.py                   # Automated script to test and verify all backend endpoints
├── documentation.md              # This living documentation guide
└── app/
    ├── __init__.py                # Marks 'app' as a Python package
    ├── api/                       # API routes (HTTP endpoints like GET, POST, DELETE)
    │   ├── __init__.py
    │   ├── router.py             # Master router combining all sub-routers
    │   └── v1/                   # Version 1 of our API
    │       ├── __init__.py
    │       ├── projects.py       # URLs for creating, viewing, and deleting projects
    │       └── tasks.py          # URLs for managing to-do tasks (Inbox, Today, etc.)
    ├── core/                      # Core configuration and database engine
    │   ├── __init__.py
    │   ├── config.py             # Settings (database name, split AI API keys)
    │   └── database.py           # SQLite connection setup and session generator
    ├── crud/                      # "Create, Read, Update, Delete" database operations
    │   ├── __init__.py
    │   ├── project.py            # Code that queries or updates the Projects table
    │   └── task.py               # Code that queries or updates the Tasks table
    ├── models/                    # Database table definitions (SQLAlchemy ORM)
    │   ├── __init__.py            # Exports Project, Task, AgentActionLog
    │   ├── project.py            # 'projects' database table layout
    │   ├── task.py               # 'tasks' database table layout
    │   └── log.py                # 'agent_action_logs' table (AI action history)
    ├── schemas/                   # Pydantic schemas (data format validation & types)
    │   ├── __init__.py
    │   ├── common.py             # Shared types (Priority P1, P2, P3, P4)
    │   ├── project.py            # Rules for how Project data must look
    │   └── task.py               # Rules for how Task data must look
    └── services/                  # Business logic & AI Agent tools
        ├── __init__.py
        ├── agent_tools.py        # Python functions the AI Agent can call
        └── groq_client.py        # Connects to Groq LLM using the split API key
```

---

## 2. 🗺️ Full Backend Implementation Plan

The backend build is split into two major phases:

### Phase 1: Backend Foundation (FastAPI + Database)
- **Step 1: Environment & Dependency Initialization** *(Completed)*
  - Create project folder structure and package init files.
  - Define `requirements.txt`.
  - Create an isolated virtual environment (`.venv`).
  - Install dependencies and test imports.
- **Step 2: Core Configuration & Database Session** *(Completed)*
  - Create `app/core/config.py` with split API key variables (`k1`, `k2`, `k3`).
  - Create `app/core/database.py` with SQLite connection, WAL mode, and session dependency.
- **Step 3: Database ORM Models (`app/models/`)** *(Completed)*
  - Define `Project` model (id, title, description, color, archived, timestamps).
  - Define `Task` model (id, project_id, title, description, due_date, priority, completed, tags).
  - Define `AgentActionLog` model (history of AI agent commands).
  - Configure cascade deletion and verify SQLite tables.
- **Step 4: Pydantic Validation Schemas (`app/schemas/`)** *(Completed)*
  - Define input schemas (data coming from the user/frontend).
  - Define response schemas (data sent back to the frontend).
  - Define priority enum (`P1` - Urgent, `P2` - High, `P3` - Medium, `P4` - Low).
- **Step 5: Database CRUD Layer (`app/crud/`)** *(Completed)*
  - Write helper functions to query, insert, update, and delete database records cleanly.
  - Add filters for **Inbox**, **Today**, **Upcoming**, and **Completed**.
- **Step 6: REST API Routers (`app/api/v1/`)** *(Next)*
  - Create `/api/v1/projects` endpoints.
  - Create `/api/v1/tasks` endpoints.
- **Step 7: Application Server & CORS (`backend/main.py`)**
  - Set up FastAPI app, include routers, configure CORS for Web & Mobile.
- **Step 8: Automated Verification (`backend/test_api.py`)**
  - Run automated tests to verify database creation, CRUD actions, and Swagger UI at `http://localhost:8000/docs`.

### Phase 2: Autonomous AI Agent with Tool Calling
- **Step 9: Groq LLM Setup & Tool Definitions**
  - Build `app/services/agent_tools.py` with functions for `create_task`, `complete_task`, `delete_task`, `extract_tasks_from_text`, and `create_project`.
- **Step 10: Agent Command Endpoint**
  - Expose `/api/v1/agent/command` allowing natural language input to control the app.

---

## 3. 📝 Progress Log: Step-by-Step Breakdown

### 🟢 Step 1: Environment & Dependency Initialization (COMPLETED)

#### A. What was done:
1. Created the full directory hierarchy inside `backend/` (`api/v1`, `core`, `crud`, `models`, `schemas`, `services`).
2. Created `__init__.py` files inside every folder. In Python, an `__init__.py` file tells Python that a folder should be treated as an importable module/package.
3. Created `backend/requirements.txt` with locked version constraints for all libraries.
4. Created an isolated virtual environment (`.venv`) using Python 3.14.
5. Upgraded `pip` (Python package manager) to version `26.2.1`.
6. Installed all 26 dependency packages into `.venv`.
7. Ran an automated import verification test to confirm everything was installed and working properly.

#### B. How it was done (commands & code explanation):
1. **Requirements File Creation**:
   We wrote [`requirements.txt`](file:///d:/Coding/Projects/todo/backend/requirements.txt):
   - `fastapi`: The web framework used to build our API endpoints quickly with automatic documentation.
   - `uvicorn[standard]`: The lightning-fast server that actually runs our FastAPI code.
   - `sqlalchemy`: The Object-Relational Mapper (ORM) that lets us interact with SQLite using Python objects instead of writing raw SQL queries.
   - `pydantic` & `pydantic-settings`: Enforces data types and validates all incoming data before it touches our database.
   - `python-dotenv`: Allows reading settings from a `.env` file.
   - `groq`: The official SDK to talk to the ultra-fast Groq LPU inference engine for our AI Agent.
   - `httpx`: A modern HTTP client used for testing our API endpoints.

2. **Creating the Virtual Environment**:
   ```powershell
   python -m venv .venv
   ```
   *Why beginner note*: A virtual environment is like a sandbox. It keeps all the packages for this project inside `backend/.venv` so they do not conflict with other Python programs on your computer.

3. **Installing Dependencies**:
   ```powershell
   .\.venv\Scripts\pip install -r requirements.txt
   ```
   This downloaded and installed FastAPI, SQLAlchemy, Pydantic, Groq, and all their sub-dependencies.

4. **Verification**:
   We ran an automated inline test command:
   ```powershell
   .\.venv\Scripts\python -c "import fastapi, sqlalchemy, pydantic, groq; print('All core modules imported successfully!')"
   ```
   Output: `All core modules imported successfully!`

---

### 🟢 Step 2: Core Configuration & Database Session Setup (COMPLETED)

#### A. What was done:
1. Created `app/core/config.py`: Centralized settings using `pydantic_settings`. Includes project metadata, SQLite URL (`sqlite:///./todo.db`), CORS whitelist for Web (Vite) and Mobile (Expo), and the requested split-key structure (`k1`, `k2`, `k3`) with a dynamic property for the Groq API key.
2. Created `app/core/database.py`: Configured the SQLAlchemy database engine with Write-Ahead Logging (WAL) and foreign key enforcement, the `SessionLocal` factory, the declarative `Base` class, and the `get_db` FastAPI dependency.
3. Verified the modules through automated execution to confirm settings loading and engine readiness.

#### B. How it was done (code explanation in simple terms):
1. **Configuration (`app/core/config.py`)**:
   - Instead of scattering configuration variables across multiple files, we centralized them into a single `Settings` class that inherits from `BaseSettings`.
   - *Split-Key Structure*:
     ```python
     k1: str = ""
     k2: str = ""
     k3: str = ""

     @property
     def GROQ_API_KEY(self) -> str:
         return (self.k1 + self.k2 + self.k3).strip()
     ```
     *Beginner explanation*: When you want to plug in your Groq API key, you can divide it across `k1`, `k2`, and `k3`. Whenever Python accesses `settings.GROQ_API_KEY`, the `@property` stitches the three pieces together into one key string on demand.
   - *CORS Whitelist*: We configured `BACKEND_CORS_ORIGINS` to allow requests from Vite's frontend (`http://localhost:5173`) and mobile ports (`8081`, `19006`).

2. **Database Engine & WAL Mode (`app/core/database.py`)**:
   - `create_engine`: Connects to our SQLite database file (`todo.db`). We passed `connect_args={"check_same_thread": False}` because FastAPI handles web requests concurrently across worker threads.
   - *WAL (Write-Ahead Logging)*: SQLite normally locks the whole database file when writing. We attached a listener (`PRAGMA journal_mode=WAL;`) that enables WAL mode. This allows readers and writers to work simultaneously without locking up.
   - *Foreign Key Enforcement*: We enabled `PRAGMA foreign_keys=ON;` so that if a project is deleted, its related tasks are properly managed.
   - *`get_db()` Dependency*:
     ```python
     def get_db() -> Generator[Session, None, None]:
         db = SessionLocal()
         try:
             yield db
         finally:
             db.close()
     ```
     *Beginner explanation*: Every time a user makes an API request (e.g. "fetch all tasks"), `get_db` opens a fresh database session. Once the request finishes, `finally: db.close()` automatically closes the connection, preventing memory leaks and database locks.

3. **Verification**:
   Executed:
   ```powershell
   .\.venv\Scripts\python -c "from app.core.config import settings; from app.core.database import engine, get_db, Base; print('Config & Database modules loaded successfully!')"
   ```
   Output:
   ```text
   Config & Database modules loaded successfully!
   Database URL: sqlite:///./todo.db
   Project Name: AI To-Do API
   ```

---

### 🟢 Step 3: Database ORM Models (COMPLETED)

#### A. What was done:
1. Created `app/models/project.py`: Defined the `Project` database model with fields for title, description, color, archived flag, and timestamps.
2. Created `app/models/task.py`: Defined the `Task` database model with priority levels (`P1`-`P4`), due date, completion status, tags, and foreign key linking to a Project (or `None` for Inbox).
3. Created `app/models/log.py`: Defined the `AgentActionLog` model to keep an audit trail of natural language commands processed by the AI agent.
4. Exported all models in `app/models/__init__.py`.
5. Created the SQLite database tables and verified that cascade deletion works automatically (deleting a project automatically deletes its child tasks).

#### B. How it was done (code explanation in simple terms):
1. **What is an ORM (Object-Relational Mapper)?**
   - In raw SQL, you write text strings like `CREATE TABLE tasks (...)` and `SELECT * FROM tasks WHERE id = 1`.
   - With an ORM like SQLAlchemy, we define ordinary Python classes that inherit from `Base`. When we create a Python object `t = Task(title="Buy Milk")`, SQLAlchemy translates that Python object into a database row automatically!

2. **Project Model (`app/models/project.py`)**:
   - `id`: Unique number identifying each project.
   - `title`: Project name (e.g. *"Work"*, *"Personal"*).
   - `color`: Hex color string defaulting to Cobalt Blue (`#1d4ed8`).
   - `is_archived`: Boolean flag to hide completed projects without deleting them.
   - `tasks`: A relationship with `cascade="all, delete-orphan"`. If a project is deleted, SQLite removes all associated tasks cleanly so no "ghost" tasks remain.

3. **Task Model (`app/models/task.py`)**:
   - `project_id`: Points to `projects.id`. If this is `None`, the task is an **Inbox** task!
   - `priority`: Stores `"P1"` (Urgent), `"P2"` (High), `"P3"` (Medium), or `"P4"` (Low).
   - `due_date`: Stores the date the task is due.
   - `completed`: True or False.
   - `tags`: Stores comma-separated tags (e.g. `"bug,frontend"`).

4. **Agent Action Log (`app/models/log.py`)**:
   - Tracks every action the AI agent performs (e.g., the user's prompt, what tool was invoked, parameters, and whether it succeeded).

5. **Verification**:
   - Generated tables in `todo.db`:
     ```powershell
     .\.venv\Scripts\python -c "from app.core.database import engine, Base; from app.models import Project, Task, AgentActionLog; Base.metadata.create_all(bind=engine); from sqlalchemy import inspect; inspector = inspect(engine); print(inspector.get_table_names())"
     ```
     Output: `['agent_action_logs', 'projects', 'tasks']`
   - Verified relational cascade delete:
     ```powershell
     .\.venv\Scripts\python -c "... p = Project(title='Test'); db.add(p); t = Task(title='Task', project_id=p.id); db.add(t); db.delete(p); ..."
     ```
     Output: `Model relationships & cascade delete verified perfectly!`

---

### 🟢 Step 4: Pydantic Validation Schemas (COMPLETED)

#### A. What was done:
1. Created `app/schemas/common.py`: Defined `PriorityEnum` (`P1`, `P2`, `P3`, `P4`) and `TaskViewFilter` (`all`, `inbox`, `today`, `upcoming`, `completed`).
2. Created `app/schemas/project.py`: Defined `ProjectBase`, `ProjectCreate`, `ProjectUpdate`, and `ProjectResponse` (including task counters `task_count` and `completed_task_count`).
3. Created `app/schemas/task.py`: Defined `TaskBase`, `TaskCreate`, `TaskUpdate` (partial updates), and `TaskResponse` (with parent project metadata).
4. Exported all schemas via `app/schemas/__init__.py`.
5. Tested and verified that valid inputs are serialized properly and invalid inputs (such as empty titles) are rejected by Pydantic before reaching the database.

#### B. How it was done (code explanation in simple terms):
1. **Why Pydantic Schemas?**
   - The ORM models from Step 3 describe the database tables on disk.
   - Pydantic schemas describe the **API contract**: what the user or mobile app is allowed to send to the server, and what the server sends back in response.
   - Pydantic validates inputs automatically: if someone sends `{ "title": "" }`, Pydantic halts the request with an HTTP 422 error and a clear message, saving the database from corrupt or malformed rows.

2. **Priority Levels (`app/schemas/common.py`)**:
   ```python
   class PriorityEnum(str, Enum):
       P1 = "P1"  # Urgent / Top priority
       P2 = "P2"  # High priority
       P3 = "P3"  # Medium priority
       P4 = "P4"  # Low / Normal priority
   ```

3. **Partial Updates (`TaskUpdate`)**:
   In `app/schemas/task.py`, all fields on `TaskUpdate` are optional (`Optional[str] = None`).
   *Beginner explanation*: If a user just wants to check off a task or rename it, they only need to send `{ "completed": true }` or `{ "title": "New Title" }`. They don't have to resend the due date, description, or project ID.

4. **ORM Mode (`from_attributes = True`)**:
   ```python
   model_config = ConfigDict(from_attributes=True)
   ```
   *Beginner explanation*: Tells Pydantic how to read data directly from a SQLAlchemy database model object and convert it into clean JSON format for the frontend.

5. **Verification**:
   - Verified valid serialization:
     ```powershell
     .\.venv\Scripts\python -c "from app.schemas import ProjectCreate, TaskCreate, PriorityEnum; ..."
     ```
     Output: Valid dicts produced.
   - Verified rejection of invalid data:
     ```powershell
     .\.venv\Scripts\python -c "... ProjectCreate(title='') ..."
     ```
     Output: `Pydantic successfully blocked invalid empty title!`

---

### 🟢 Step 5: Database CRUD Layer (COMPLETED)

#### A. What was done:
1. Created `app/crud/project.py`: Implemented reusable database functions for projects: `get_projects` (with live task counts for active vs. completed items), `get_project_by_id`, `get_project_by_title`, `create_project`, `update_project`, and `delete_project`.
2. Created `app/crud/task.py`: Implemented query helpers with intelligent filtering for **Inbox** (`project_id IS NULL`), **Today** (`due_date == today`), **Upcoming** (`due_date > today`), and **Completed** (`completed == True`). Implemented priority ordering (`P1` first), `toggle_task_completion`, timestamp tracking for `completed_at`, and task deletion.
3. Exported all CRUD operations through `app/crud/__init__.py`.
4. Verified all operations using an automated Python test script: created projects and tasks across all three views, verified counts, toggled completion, and confirmed cascade deletion.

#### B. How it was done (code explanation in simple terms):
1. **What is CRUD?**
   - **C**reate: Inserting a new row into SQLite (`db.add()`, `db.commit()`).
   - **R**ead: Querying rows from SQLite (`db.query(Task).filter(...)`).
   - **U**pdate: Changing fields on an existing row and committing changes.
   - **D**elete: Removing a row from SQLite (`db.delete()`, `db.commit()`).
   - By keeping these functions in `app/crud/`, our API routers (Step 6) and AI Agent (Phase 2) stay clean and share the exact same database logic without duplicating code.

2. **Smart View Filters (`app/crud/task.py`)**:
   ```python
   if view == "inbox":
       query = query.filter(Task.project_id.is_(None), Task.completed.is_(False))
   elif view == "today":
       query = query.filter(Task.due_date == date.today(), Task.completed.is_(False))
   elif view == "upcoming":
       query = query.filter(Task.due_date > date.today(), Task.completed.is_(False))
   elif view == "completed":
       query = query.filter(Task.completed.is_(True))
   ```
   *Beginner explanation*: When the user clicks the "Today" tab on the web or mobile app, the backend checks today's date and returns only uncompleted tasks due today. When they click "Inbox", it returns items that haven't been assigned to any project yet.

3. **Priority-Based Sorting**:
   ```python
   priority_order = case(
       (Task.priority == "P1", 1),
       (Task.priority == "P2", 2),
       (Task.priority == "P3", 3),
       (Task.priority == "P4", 4),
       else_=5,
   )
   ```
   *Beginner explanation*: Instead of showing tasks in random order, tasks with `P1` (urgent) always appear at the very top of your list, followed by `P2`, `P3`, and `P4`.

4. **Task Completion Toggle & Auto Timestamps**:
   ```python
   def toggle_task_completion(db: Session, db_task: Task) -> Task:
       db_task.completed = not db_task.completed
       if db_task.completed:
           db_task.completed_at = datetime.now(timezone.utc)
       else:
           db_task.completed_at = None
   ```
   *Beginner explanation*: When a task is checked off, `completed` becomes `True` and `completed_at` records the exact second it was finished. If the user unchecks it, `completed_at` is cleared back to `None`.

5. **Verification**:
   Executed automated test script creating Inbox, Today, and Upcoming tasks, testing dynamic task counts, toggling completion, and cascading delete:
   ```powershell
   .\.venv\Scripts\python -c "... assert projects[0].task_count == 2; ... assert t_obj.completed is True; ... delete_project(db, p); ..."
   ```
   Output: `All CRUD tests passed with 100% success!`

---

*This document will be updated after each step is completed.*
