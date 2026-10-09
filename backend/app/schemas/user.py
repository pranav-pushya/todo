"""Pydantic schemas for User Authentication and Profiles."""

from datetime import datetime
from typing import Optional
import re
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRegister(BaseModel):
    """Schema for registering a new user."""

    email: str = Field(..., min_length=5, max_length=255, description="Valid user email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique alphanumeric username")
    password: str = Field(..., min_length=6, max_length=128, description="User password (min 6 chars)")
    full_name: Optional[str] = Field(None, max_length=100, description="User's display or full name")
    bio: Optional[str] = Field(None, max_length=1000, description="Short developer bio or status")
    role: Optional[str] = Field("Fullstack Developer", max_length=50, description="Developer role or title")
    github_username: Optional[str] = Field(None, max_length=100, description="GitHub profile handle")
    avatar_url: Optional[str] = Field(None, max_length=500, description="Custom avatar image URL")

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, v):
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("username", mode="before")
    @classmethod
    def clean_username(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("github_username", mode="before")
    @classmethod
    def clean_github(cls, v):
        if not v or not isinstance(v, str):
            return None
        cleaned = v.strip()
        for prefix in ("https://github.com/", "http://github.com/", "github.com/"):
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):]
        cleaned = cleaned.lstrip("@").strip("/ ")
        return cleaned or None


class UserLogin(BaseModel):
    """Schema for logging in with either email or username."""

    email_or_username: str = Field(..., min_length=3, description="Registered email address or username")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email_or_username", mode="before")
    @classmethod
    def clean_identifier(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile fields."""

    full_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=1000)
    role: Optional[str] = Field(None, max_length=50)
    github_username: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    theme_preference: Optional[str] = Field(None, max_length=50)

    @field_validator("github_username", mode="before")
    @classmethod
    def clean_github(cls, v):
        if not v or not isinstance(v, str):
            return None
        cleaned = v.strip()
        for prefix in ("https://github.com/", "http://github.com/", "github.com/"):
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):]
        cleaned = cleaned.lstrip("@").strip("/ ")
        return cleaned or None



class UserPasswordChange(BaseModel):
    """Schema for securely changing password."""

    current_password: str = Field(..., min_length=1, description="Existing account password")
    new_password: str = Field(..., min_length=6, max_length=128, description="New account password")


class UserForgotPassword(BaseModel):
    """Schema for requesting a password recovery code."""

    email_or_username: str = Field(..., min_length=3, description="Registered email or username")

    @field_validator("email_or_username", mode="before")
    @classmethod
    def clean_identifier(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class UserForgotPasswordResponse(BaseModel):
    """Schema returned after a recovery code is generated."""

    status: str = "success"
    message: str
    email: str
    recovery_code: Optional[str] = None


class UserResetPassword(BaseModel):
    """Schema for resetting password using the 6-digit recovery code."""

    email_or_username: str = Field(..., min_length=3, description="Registered email or username")
    recovery_code: str = Field(..., min_length=4, max_length=50, description="Verification recovery code")
    new_password: str = Field(..., min_length=6, max_length=128, description="New account password")

    @field_validator("email_or_username", mode="before")
    @classmethod
    def clean_identifier(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("recovery_code", mode="before")
    @classmethod
    def clean_code(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


class UserProfileResponse(BaseModel):
    """Schema for returning user profile data to frontend."""

    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str = "Fullstack Developer"
    github_username: Optional[str] = None
    theme_preference: str = "dark"
    is_active: bool = True
    created_at: datetime
    tasks_count: Optional[int] = 0
    projects_count: Optional[int] = 0
    notes_count: Optional[int] = 0
    sprints_count: Optional[int] = 0
    experiments_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema returned upon successful authentication containing JWT and profile."""

    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class FirebaseSyncRequest(BaseModel):
    """Schema for syncing a Firebase authenticated user with the backend SQLite database."""

    id_token: str = Field(..., description="Firebase RS256 ID Token")
    full_name: Optional[str] = Field(None, max_length=100)
    role: Optional[str] = Field("Fullstack Developer", max_length=50)
    bio: Optional[str] = Field(None, max_length=1000)
    github_username: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
