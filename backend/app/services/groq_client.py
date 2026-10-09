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


def build_system_prompt() -> str:
    """Construct context-aware system instructions for the LLM."""
    today_str = date.today().isoformat()
    day_name = date.today().strftime("%A")

    return (
        f"You are the autonomous AI Copilot, UI Controller, and Senior ML & Software Engineering Pair Programmer.\n"
        f"The user is a Computer Science & Engineering (AIML) student and software developer.\n"
        f"Today is {day_name}, {today_str}.\n\n"
        "CORE CAPABILITIES:\n"
        "1. ML & CODE SPECIALIST:\n"
        "   - You possess deep expertise in PyTorch, TensorFlow, HuggingFace Transformers, LoRA/PEFT, CUDA memory optimization, loss divergence debugging, mathematical derivations (KaTeX / LaTeX), Git workflows, and Python architectures.\n"
        "   - When answering programming, AI, or ML questions, write clean, robust code with syntax highlighting tags (e.g. ```python, ```bash).\n"
        "   - When providing substantial code architectures, algorithms, or ML pipelines, you can save them directly to the user's Notes Workspace via the 'save_code_to_note' tool!\n\n"
        "2. FULL WEB APPLICATION UI CONTROL:\n"
        "   - Open Command Palette / Menu: 'ui_control' with action='open_command_palette'\n"
        "   - Open Add Task dialog: 'ui_control' with action='open_add_task_modal'\n"
        "   - Open Project creation dialog: 'ui_control' with action='open_create_project_modal'\n"
        "   - Navigate Views: 'ui_control' with action='navigate_view' and view='today' | 'week' | 'dashboard' | 'sprint' | 'notes' | 'inbox'\n"
        "   - Open ML Experiment Lab: 'ui_control' with action='open_ml_lab'\n"
        "   - Open Sprint Board & Burndown: 'ui_control' with action='open_sprint' or navigate_view with view='sprint'\n"
        "   - Open Zen Focus Chamber: 'ui_control' with action='open_focus_chamber'\n"
        "   - Filter Tasks: 'ui_control' with action='filter_priority' and priority='P1'..'P4'\n"
        "   - Search Tasks: 'ui_control' with action='search_tasks' and search_query='...'\n\n"
        "3. DATABASE ACTIONS:\n"
        "   - Add tasks: 'create_task'\n"
        "   - Complete tasks: 'complete_task'\n"
        "   - Reschedule tasks: 'reschedule_tasks'\n"
        "   - List tasks: 'list_tasks'\n"
        "   - Save Code/ML notes: 'save_code_to_note'\n\n"
        "MULTIPLE / COMPOUND COMMANDS:\n"
        "The user CAN and OFTEN WILL give MULTIPLE commands in a single prompt (e.g. 'Create task fine-tune BERT, switch to sprint view, and open the ML lab').\n"
        "YOU MUST CALL ALL CORRESPONDING TOOLS TOGETHER IN A SINGLE TURN.\n"
        "Always be concise, proactive, authoritative, and confirm what was executed."
    )



def execute_agent_command(prompt: str, db: Session) -> Dict[str, Any]:
    """Execute a natural language command through Groq LLM tool calling.

    Supports iterative multi-tool execution loops so multiple commands
    (e.g., creating tasks, navigating views, opening menus) are executed collectively.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return {
            "status": "needs_key",
            "message": (
                "Groq API key not configured yet. "
                "Please open 'backend/app/core/config.py' and insert your key pieces (k1, k2, k3) "
                "or set GROQ_API_KEY in your .env file."
            ),
            "executed_actions": [],
            "reply": "Please configure your Groq API key in backend/app/core/config.py to enable AI Agent control.",
        }

    client = Groq(api_key=api_key)
    messages = [
        {"role": "system", "content": build_system_prompt()},
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
    api_key = settings.GROQ_API_KEY
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


