"""Groq LLM Client and Autonomous Agent Engine.

Handles natural language command processing, tool calling schema definitions,
and execution loops using the ultra-fast Groq LPU inference engine.
"""

import json
import re
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.log import AgentActionLog
from app.services.agent_tools import TOOL_MAP

# Tool schemas adhering to the OpenAI / Groq function calling specification
# Using nullable types (["string", "null"]) for optional parameters to ensure strict compliance
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "create_task",
            "description": "Create a new to-do task. Use this whenever the user wants to add, create, or schedule a task.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Clear and concise title of the task",
                    },
                    "due_date": {
                        "type": ["string", "null"],
                        "description": "When the task is due: 'today', 'tomorrow', 'next week', or 'YYYY-MM-DD'",
                    },
                    "priority": {
                        "type": ["string", "null"],
                        "description": "Task priority: 'P1' (Urgent), 'P2' (High), 'P3' (Medium), or 'P4' (Low). Defaults to 'P4' if omitted or null.",
                    },
                    "project_name": {
                        "type": ["string", "null"],
                        "description": "Name of the project category (e.g. 'Work', 'Personal'). If null or omitted, places in Inbox.",
                    },
                    "tags": {
                        "type": ["string", "null"],
                        "description": "Comma-separated tags (e.g. 'finance, tax')",
                    },
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "complete_task",
            "description": "Mark an existing task as completed by its title or ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {
                        "type": "string",
                        "description": "The task title (or keyword) or numeric task ID to complete.",
                    }
                },
                "required": ["task_identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Permanently remove a task from the database by its title or ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "task_identifier": {
                        "type": "string",
                        "description": "The task title (or keyword) or numeric task ID to delete.",
                    }
                },
                "required": ["task_identifier"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "reschedule_tasks",
            "description": "Reschedule tasks to a new date based on a filter ('overdue', 'today', or a task title keyword).",
            "parameters": {
                "type": "object",
                "properties": {
                    "filter_criteria": {
                        "type": "string",
                        "description": "Which tasks to reschedule: 'overdue', 'today', or a specific task title keyword.",
                    },
                    "new_due_date": {
                        "type": "string",
                        "description": "The new target date ('tomorrow', 'next monday', or 'YYYY-MM-DD').",
                    },
                },
                "required": ["filter_criteria", "new_due_date"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_project",
            "description": "Create a new project grouping category.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Project title (e.g. 'Cybersecurity', 'Mobile App')",
                    },
                    "color": {
                        "type": ["string", "null"],
                        "description": "Hex color code for the project badge (e.g. '#1d4ed8')",
                    },
                    "description": {
                        "type": ["string", "null"],
                        "description": "Optional summary of what this project is about.",
                    },
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "Inspect the user's tasks to answer questions or review what needs to be done.",
            "parameters": {
                "type": "object",
                "properties": {
                    "view": {
                        "type": "string",
                        "enum": ["all", "inbox", "today", "upcoming", "completed"],
                        "description": "View filter",
                    },
                    "project_name": {
                        "type": ["string", "null"],
                        "description": "Filter by project name (optional)",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "ui_control",
            "description": "Control the web application interface: open command menu/palette, open modals, navigate views, apply priority filters, or search tasks. Use this whenever the user wants to open, view, show, navigate, or filter anything in the UI.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": [
                            "open_command_palette",
                            "close_command_palette",
                            "open_add_task_modal",
                            "open_create_project_modal",
                            "open_notes",
                            "open_sprint",
                            "open_ml_lab",
                            "open_focus_chamber",
                            "navigate_view",
                            "filter_priority",
                            "search_tasks",
                            "clear_search",
                            "close_modals",
                        ],
                        "description": "The UI action to execute in the webapp.",
                    },
                    "view": {
                        "type": ["string", "null"],
                        "description": "The view to navigate to: 'inbox', 'today', 'week', 'dashboard', 'sprint', 'notes', 'upcoming', 'completed', or 'all'.",
                    },
                    "project_name": {
                        "type": ["string", "null"],
                        "description": "The name of the project to open/select if navigating to a project.",
                    },
                    "priority": {
                        "type": ["string", "null"],
                        "description": "Priority filter to apply: 'P1', 'P2', 'P3', 'P4', or 'all'.",
                    },
                    "search_query": {
                        "type": ["string", "null"],
                        "description": "Search keyword if action is search_tasks.",
                    },
                },
                "required": ["action"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "save_code_to_note",
            "description": "Save code architectures, ML training scripts, mathematical formulas, or documentation into the user's persistent Notes Workspace.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the note (e.g. 'PyTorch Training Loop with Gradient Clipping')",
                    },
                    "code_or_content": {
                        "type": "string",
                        "description": "Code snippet or technical explanation to save.",
                    },
                    "language": {
                        "type": ["string", "null"],
                        "description": "Programming language ('python', 'bash', 'javascript', 'latex', etc.)",
                    },
                    "tags": {
                        "type": ["string", "null"],
                        "description": "Comma-separated tags for easy search (e.g. 'pytorch, training, ml')",
                    },
                },
                "required": ["title", "code_or_content"],
            },
        },
    },
]


def get_database_context(db: Optional[Session]) -> str:
    """Extract a concise snapshot of active tasks, projects, and sprint to ground the LLM."""
    if not db:
        return ""
    try:
        from app.models.task import Task
        from app.models.project import Project
        from app.models.sprint import Sprint

        # 1. Projects
        projects = db.query(Project).all()
        proj_names = [p.title for p in projects]

        # 2. Active tasks (limit to top 30 uncompleted tasks)
        active_tasks = (
            db.query(Task)
            .filter(Task.completed == False)
            .order_by(Task.priority.asc(), Task.due_date.asc(), Task.id.desc())
            .limit(30)
            .all()
        )
        total_active = db.query(Task).filter(Task.completed == False).count()
        total_done = db.query(Task).filter(Task.completed == True).count()

        # 3. Active sprint
        active_sprint = db.query(Sprint).filter(Sprint.is_active == True).first()

        lines = [
            "CURRENT WORKSPACE SNAPSHOT (LIVE DATABASE):",
            f"- Total Tasks: {total_active} active, {total_done} completed.",
            f"- Existing Projects: {', '.join(proj_names) if proj_names else 'None (default Inbox)'}",
        ]

        if active_sprint:
            lines.append(f"- Active Sprint: '{active_sprint.title}' (Ends: {active_sprint.end_date})")

        if active_tasks:
            lines.append("- Active Tasks (Use exact ID when completing or deleting):")
            for t in active_tasks:
                proj_name = t.project.title if t.project else "Inbox"
                due_info = f", Due: {t.due_date}" if t.due_date else ""
                lines.append(f"  * [ID: {t.id}] \"{t.title}\" ({t.priority}{due_info}, Project: {proj_name})")
        else:
            lines.append("- Active Tasks: No active tasks.")

        return "\n".join(lines)
    except Exception as e:
        return f"Database context unavailable: {str(e)}"


def build_system_prompt(db: Optional[Session] = None) -> str:
    """Construct context-aware system instructions for the LLM."""
    today_str = date.today().isoformat()
    day_name = date.today().strftime("%A")
    db_context = get_database_context(db) if db else ""

    return (
        f"You are the autonomous AI Copilot, UI Controller, and Senior ML & Software Engineering Pair Programmer.\n"
        f"The user is a Computer Science & Engineering (AIML) student and software developer.\n"
        f"Today is {day_name}, {today_str}.\n\n"
        f"{db_context}\n\n"
        "CORE RULES & BEHAVIOR:\n"
        "1. DISTINGUISH BETWEEN QUESTIONS VS ACTIONS:\n"
        "   - TECHNICAL / ML / PROGRAMMING QUESTIONS: When the user asks a question (e.g. 'how to fix cuda oom', 'explain backpropagation', 'write a binary search in python', 'what is peft lora'):\n"
        "     DO NOT call 'create_task' or 'ui_control'! Provide a comprehensive, accurate technical answer with syntax-highlighted code blocks (```python, ```bash, etc.) directly in your response.\n"
        "   - EXPLICIT ACTION COMMANDS: Only call 'create_task' when the user explicitly requests to add, create, schedule, or note down a to-do item (e.g., 'create task', 'add to-do', 'remind me to...').\n"
        "   - NOTE CREATION: When the user asks to save an architecture, code snippet, or guide into their notes, call 'save_code_to_note'.\n\n"
        "2. UNDERSTAND HINDI / HINGLISH SEAMLESSLY:\n"
        "   The user frequently uses Hindi / Hinglish phrasing:\n"
        "   - 'kholo', 'dikhao', 'chalu karo', 'le jao' -> 'ui_control' (e.g., 'ml lab kholo' -> action='open_ml_lab', 'zen mode kholo' -> action='open_focus_chamber', 'sprint board dikhao' -> action='open_sprint')\n"
        "   - 'banao', 'add karo', 'likh do', 'daalo' -> 'create_task'\n"
        "   - 'khatam', 'complete kardo', 'ho gaya', 'done karo', 'mark done' -> 'complete_task'\n"
        "   - 'hatao', 'delete kardo', 'nikal do', 'cancel karo' -> 'delete_task'\n"
        "   - 'notes me daal do', 'note bana do' -> 'save_code_to_note'\n\n"
        "3. ACCURATE TASK RESOLUTION (USE LIVE DB SNAPSHOT):\n"
        "   - Use the live task list provided above to identify tasks by ID or title.\n"
        "   - When the user says 'complete task 3' or 'delete the report task', pass the exact numeric ID ('3') or exact title into 'task_identifier'.\n"
        "   - If a task is not in the active list, it might already be completed or nonexistent.\n\n"
        "4. FULL WEB APPLICATION UI CONTROL:\n"
        "   - Open Command Palette / Menu: 'ui_control' with action='open_command_palette'\n"
        "   - Open Add Task dialog: 'ui_control' with action='open_add_task_modal'\n"
        "   - Open Project creation dialog: 'ui_control' with action='open_create_project_modal'\n"
        "   - Navigate Views: 'ui_control' with action='navigate_view' and view='today' | 'week' | 'dashboard' | 'sprint' | 'notes' | 'inbox' | 'all'\n"
        "   - Open ML Experiment Lab: 'ui_control' with action='open_ml_lab'\n"
        "   - Open Sprint Board & Burndown: 'ui_control' with action='open_sprint' or navigate_view with view='sprint'\n"
        "   - Open Zen Focus Chamber: 'ui_control' with action='open_focus_chamber'\n"
        "   - Filter Tasks: 'ui_control' with action='filter_priority' and priority='P1'..'P4'\n"
        "   - Search Tasks: 'ui_control' with action='search_tasks' and search_query='...'\n\n"
        "5. MULTIPLE / COMPOUND COMMANDS:\n"
        "   If the user specifies multiple actions (e.g. 'delete task 2, create task study transformers, and open the ml lab'), execute ALL corresponding tools in a single turn.\n\n"
        "Be concise, helpful, and confirm what was executed."
    )



def execute_agent_command(prompt: str, db: Session) -> Dict[str, Any]:
    """Execute a natural language command through Groq LLM tool calling.

    Supports iterative multi-tool execution loops so multiple commands
    (e.g., creating tasks, navigating views, opening menus) are executed collectively.
    """
    api_key = settings.get_api_key()
    if not api_key:
        return {
            "status": "needs_key",
            "message": (
                "Groq API key not configured yet. "
                "Please set GROQ_API_KEY in your .env file."
            ),
            "executed_actions": [],
            "reply": "Please configure your Groq API key in backend/app/core/config.py to enable AI Agent control.",
        }

    client = Groq(api_key=api_key)
    messages = [
        {"role": "system", "content": build_system_prompt(db=db)},
        {"role": "user", "content": prompt},
    ]

    executed_actions = []
    final_reply = ""
    max_steps = 4

    for _ in range(max_steps):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                temperature=0.1,
            )
        except Exception as e:
            if not executed_actions:
                return {
                    "status": "error",
                    "message": f"Groq API call failed: {str(e)}",
                    "executed_actions": [],
                    "reply": f"Error contacting AI model: {str(e)}",
                }
            break

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        # If no further tools called, we've reached the final conversational response
        if not tool_calls:
            final_reply = response_message.content or ""
            break

        messages.append(response_message)

        for tool_call in tool_calls:
            function_name = tool_call.function.name
            try:
                function_args = json.loads(tool_call.function.arguments)
            except json.JSONDecodeError:
                function_args = {}

            clean_args = {k: v for k, v in function_args.items() if v is not None}

            if function_name in TOOL_MAP:
                tool_func = TOOL_MAP[function_name]
                try:
                    tool_result = tool_func(db=db, **clean_args)
                except Exception as ex:
                    tool_result = {"status": "error", "message": str(ex)}

                executed_actions.append({
                    "tool": function_name,
                    "arguments": clean_args,
                    "result": tool_result,
                })

                # Log action to database audit log
                try:
                    log_entry = AgentActionLog(
                        prompt=prompt,
                        action_type=function_name,
                        parameters=json.dumps(clean_args),
                        result=json.dumps(tool_result),
                        status=tool_result.get("status", "success"),
                    )
                    db.add(log_entry)
                    db.commit()
                except Exception:
                    db.rollback()

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_result),
                })

    if not final_reply:
        if executed_actions:
            final_reply = f"Successfully executed {len(executed_actions)} action(s)."
        else:
            final_reply = "Understood."

    return {
        "status": "success",
        "executed_actions": executed_actions,
        "reply": final_reply,
    }


def deconstruct_task_with_llm(title: str, description: Optional[str] = None) -> List[Dict[str, Any]]:
    """Use Groq LPU with Llama 3.3 to break down an overwhelming task into actionable 15-minute subtasks."""
    api_key = settings.get_api_key()
    if not api_key:
        return [
            {"title": f"Plan architecture & specs for '{title}'", "estimated_minutes": 15},
            {"title": f"Implement core logic for '{title}'", "estimated_minutes": 30},
            {"title": f"Test edge cases and verify outputs", "estimated_minutes": 20},
            {"title": f"Review, document, and clean up", "estimated_minutes": 15},
        ]

    try:
        client = Groq(api_key=api_key)
        prompt = f"Task Title: {title}\nTask Details: {description or 'None'}"
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert software engineer and productivity coach. "
                        "Break down the user's task into 3 to 5 bite-sized, sequential, actionable subtasks "
                        "(10-30 mins each). "
                        "Return ONLY a raw JSON array of objects with keys 'title' (string) and 'estimated_minutes' (integer). "
                        "Example format: [{\"title\": \"Create unit test fixtures\", \"estimated_minutes\": 15}]. "
                        "Do not return markdown code blocks, backticks, or any conversational text."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        content = (response.choices[0].message.content or "").strip()
        # Clean potential markdown codeblock formatting if model returned ```json ... ```
        content = re.sub(r"^```(?:json)?\s*", "", content, flags=re.IGNORECASE)
        content = re.sub(r"\s*```$", "", content)
        data = json.loads(content)
        if isinstance(data, list) and len(data) > 0:
            parsed = []
            for item in data:
                if isinstance(item, dict) and item.get("title"):
                    parsed.append({
                        "title": str(item["title"]).strip(),
                        "estimated_minutes": int(item.get("estimated_minutes", 15)),
                    })
            if parsed:
                return parsed
    except Exception as e:
        print(f"Groq task deconstruction error: {e}")

    # Fallback to intelligent steps if LLM fails
    return [
        {"title": f"Plan architecture & specs for '{title}'", "estimated_minutes": 15},
        {"title": f"Implement core logic for '{title}'", "estimated_minutes": 30},
        {"title": f"Test edge cases and verify outputs", "estimated_minutes": 20},
        {"title": f"Review, document, and clean up", "estimated_minutes": 15},
    ]


