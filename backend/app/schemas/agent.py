"""Pydantic schemas for AI Agent commands and audit logs."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AgentCommandRequest(BaseModel):
    """Request payload containing natural language command for the AI agent."""

    prompt: str = Field(..., min_length=1, max_length=2000, description="Natural language command or prompt")


class AgentExecutedAction(BaseModel):
    """Details of an individual tool executed by the agent."""

    tool: str = Field(..., description="Name of the tool executed (e.g. create_task)")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Arguments passed to the tool")
    result: Dict[str, Any] = Field(default_factory=dict, description="Result output from the tool execution")


class AgentCommandResponse(BaseModel):
    """Response payload returned after processing the agent command."""

    status: str = Field(..., description="'success', 'needs_key', or 'error'")
    reply: str = Field(..., description="Conversational explanation of the outcome")
    executed_actions: List[AgentExecutedAction] = Field(
        default_factory=list,
        description="List of database actions executed",
    )
    message: Optional[str] = Field(None, description="Optional diagnostic or guidance note")


class AgentLogResponse(BaseModel):
    """Audit log item representing an agent execution record."""

    id: int
    prompt: str
    action_type: str
    parameters: Optional[str] = None
    result: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
