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

# Model to use on Groq
GROQ_MODEL = "llama-3.3-70b-versatile"

# Tool schemas adhering to the OpenAI / Groq function calling specification
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
                        "type": "string",
                        "description": "When the task is due: 'today', 'tomorrow', 'next week', or 'YYYY-MM-DD'",
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["P1", "P2", "P3", "P4"],
                        "description": "P1 (Urgent), P2 (High), P3 (Medium), P4 (Low)",
                    },
                    "project_name": {
                        "type": "string",
                        "description": "Name of the project category (e.g. 'Work', 'Personal'). If null, places in Inbox.",
                    },
                    "tags": {
                        "type": "string",
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
                        "type": "string",
                        "description": "Hex color code for the project badge (e.g. '#1d4ed8')",
                    },
                    "description": {
                        "type": "string",
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
                        "type": "string",
                        "description": "Filter by project name (optional)",
                    },
                },
            },
        },
    },
]


def build_system_prompt() -> str:
    """Construct context-aware system instructions for the LLM."""
    today_str = date.today().isoformat()
    day_name = date.today().strftime("%A")

    return (
        f"You are the autonomous AI Copilot for the AI-Controlled To-Do Platform.\n"
        f"Today is {day_name}, {today_str}.\n\n"
        "Your mission is to understand user natural language commands and execute the appropriate database tools.\n"
        "- If the user asks to add tasks (even multiple), call 'create_task' for each one.\n"
        "- If the user says 'done with X' or 'finish X', call 'complete_task'.\n"
        "- If the user asks to reschedule overdue tasks, call 'reschedule_tasks'.\n"
        "- If the user asks what they have to do, call 'list_tasks'.\n"
        "- If the user mentions notes or meeting items, extract the action items and create tasks.\n"
        "Always be concise, proactive, and helpful."
    )


def execute_agent_command(prompt: str, db: Session) -> Dict[str, Any]:
    """Execute a natural language command through Groq LLM tool calling.

    If Groq API key is not configured, provides a helpful prompt explaining how to configure it.
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

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=0.1,
        )
    except Exception as e:
        return {
            "status": "error",
            "message": f"Groq API call failed: {str(e)}",
            "executed_actions": [],
            "reply": f"Error contacting AI model: {str(e)}",
        }

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    executed_actions = []

    # If the model chose to call tools:
    if tool_calls:
        # Append assistant's tool-call request to message history
        messages.append(response_message)

        for tool_call in tool_calls:
            function_name = tool_call.function.name
            try:
                function_args = json.loads(tool_call.function.arguments)
            except json.JSONDecodeError:
                function_args = {}

            # Execute tool if mapped
            if function_name in TOOL_MAP:
                tool_func = TOOL_MAP[function_name]
                tool_result = tool_func(db=db, **function_args)
                executed_actions.append({
                    "tool": function_name,
                    "arguments": function_args,
                    "result": tool_result,
                })

                # Log action to database audit log
                try:
                    log_entry = AgentActionLog(
                        prompt=prompt,
                        action_type=function_name,
                        parameters=json.dumps(function_args),
                        result=json.dumps(tool_result),
                        status=tool_result.get("status", "success"),
                    )
                    db.add(log_entry)
                    db.commit()
                except Exception:
                    db.rollback()

                # Provide tool result back to message thread
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": json.dumps(tool_result),
                })

        # Ask the model for a natural summary after tool execution
        try:
            second_response = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=0.2,
            )
            final_reply = second_response.choices[0].message.content or "Actions executed successfully."
        except Exception:
            final_reply = f"Successfully executed {len(executed_actions)} action(s)."

        return {
            "status": "success",
            "executed_actions": executed_actions,
            "reply": final_reply,
        }

    # If the user asked a general question without requiring tools:
    return {
        "status": "success",
        "executed_actions": [],
        "reply": response_message.content or "Understood.",
    }
