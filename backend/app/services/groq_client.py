"""Groq LLM Client and Autonomous Agent Engine.

Handles natural language command processing, tool calling schema definitions,
and execution loops using the ultra-fast Groq LPU inference engine.
"""

import json
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
                        "description": "The view to navigate to: 'inbox', 'today', 'week', 'dashboard', 'notes', 'upcoming', 'completed', or 'all'.",
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
]


def build_system_prompt() -> str:
    """Construct context-aware system instructions for the LLM."""
    today_str = date.today().isoformat()
    day_name = date.today().strftime("%A")

    return (
        f"You are the autonomous AI Copilot and UI Controller for the AI-Controlled To-Do Platform.\n"
        f"Today is {day_name}, {today_str}.\n\n"
        "Your mission is to understand user natural language commands and execute the appropriate database and UI tools.\n"
        "IMPORTANT - WEB APPLICATION UI CONTROL:\n"
        "You HAVE FULL CAPABILITY to control the web application interface via the 'ui_control' tool!\n"
        "- If the user asks to open the command menu / cmd palette / menu (e.g., 'open cmd menu', 'open command menu', 'cmd palette'), call 'ui_control' with action='open_command_palette'.\n"
        "- If the user asks to open the add task modal/form/dialog, call 'ui_control' with action='open_add_task_modal'.\n"
        "- If the user asks to open the project creation modal, call 'ui_control' with action='open_create_project_modal'.\n"
        "- If the user asks to show or switch to Today, Week, Dashboard, Inbox, Upcoming, Completed, or a specific Project, call 'ui_control' with action='navigate_view' and the respective view ('today', 'week', 'dashboard', 'inbox', etc.) or project_name.\n"
        "- If the user asks to see progress, consistency, analytics, charts, or streaks, call 'ui_control' with action='navigate_view' and view='dashboard'.\n"
        "- If the user asks to filter tasks by priority (e.g. 'filter by P1'), call 'ui_control' with action='filter_priority'.\n"
        "- If the user asks to search for tasks, call 'ui_control' with action='search_tasks'.\n"
        "- If the user asks to close modals or dialogs, call 'ui_control' with action='close_modals'.\n\n"
        "DATABASE ACTIONS:\n"
        "- If the user asks to add tasks, call 'create_task'.\n"
        "- If the user says 'done with X' or 'finish X', call 'complete_task'.\n"
        "- If the user asks to reschedule overdue tasks, call 'reschedule_tasks'.\n"
        "- If the user asks what they have to do, call 'list_tasks'.\n\n"
        "MULTIPLE / COMPOUND COMMANDS:\n"
        "The user CAN and OFTEN WILL give MULTIPLE commands collectively in a single prompt (e.g. 'Create task deploy api due tomorrow, switch to today view, and open the cmd menu').\n"
        "YOU MUST CALL ALL CORRESPONDING TOOLS TOGETHER IN A SINGLE TURN.\n"
        "Always be concise, proactive, and confirm what was opened, navigated, or created."
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

