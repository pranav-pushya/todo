"""Common enumerations and types used across schemas."""

from enum import Enum


class PriorityEnum(str, Enum):
    """Task priority levels.

    P1: Urgent (Crucial priority)
    P2: High (Important priority)
    P3: Medium (Normal priority)
    P4: Low (Optional / backlog priority)
    """

    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class TaskViewFilter(str, Enum):
    """Views used by the UI to filter tasks."""

    ALL = "all"
    INBOX = "inbox"
    TODAY = "today"
    WEEK = "week"
    UPCOMING = "upcoming"
    COMPLETED = "completed"
