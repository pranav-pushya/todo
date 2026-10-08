"""Application configuration and environment settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for backend services, database, and AI agent."""

    # Project metadata
    PROJECT_NAME: str = "AI To-Do API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # SQLite Database connection string
    # Stored in the backend directory as todo.db
    DATABASE_URL: str = "sqlite:///./todo.db"

    # CORS settings: Allow requests from Web (Vite dev server) & Mobile (Expo)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8081",  # Expo default port
        "http://localhost:19006", # Expo web default
        "*",                      # Allow all origins in development
    ]

    # Groq AI Split-Key structure
    # You can paste your key pieces here or in a .env file
    k1: str = ""
    k2: str = ""
    k3: str = ""

    @property
    def GROQ_API_KEY(self) -> str:
        """Dynamically assemble the full Groq API key from its split parts."""
        return (self.k1 + self.k2 + self.k3).strip()

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
