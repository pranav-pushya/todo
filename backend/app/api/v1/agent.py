"""AI Agent REST API endpoints.

Exposes natural language command execution, direct tool invocation,
and autonomous execution audit logs.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.log import AgentActionLog
from app.schemas.agent import (
    AgentCommandRequest,
    AgentCommandResponse,
    AgentLogResponse,
)
from app.services.agent_tools import TOOL_MAP
from app.services.groq_client import execute_agent_command

router = APIRouter(prefix="/agent", tags=["AI Agent"])


@router.post("/command", response_model=AgentCommandResponse)
def handle_agent_command(
    command_in: AgentCommandRequest,
    db: Session = Depends(get_db),
):
    """Process a natural language command using the Groq LLM agent engine.

    The model dynamically decides which database tools to call,
    executes them against SQLite, and returns a natural language summary.
    """
    result = execute_agent_command(prompt=command_in.prompt, db=db)
    return AgentCommandResponse(**result)


@router.get("/logs", response_model=List[AgentLogResponse])
def get_agent_logs(
    limit: int = Query(50, ge=1, le=200, description="Number of recent logs to fetch"),
    db: Session = Depends(get_db),
):
    """Retrieve audit history of actions performed autonomously by the AI agent."""
    logs = (
        db.query(AgentActionLog)
        .order_by(AgentActionLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return logs


@router.post("/tool/{tool_name}")
def direct_tool_execution(
    tool_name: str,
    parameters: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """Directly execute a registered agent tool with parameters.

    Useful for instant UI shortcuts, testing, and deterministic automation.
    """
    if tool_name not in TOOL_MAP:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool '{tool_name}' is not recognized. Available tools: {list(TOOL_MAP.keys())}",
        )

    tool_func = TOOL_MAP[tool_name]
    try:
        result = tool_func(db=db, **parameters)
        return result
    except TypeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid arguments for tool '{tool_name}': {str(e)}",
        )
