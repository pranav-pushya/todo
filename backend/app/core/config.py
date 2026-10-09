"""Application configuration and environment settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for backend services, database, and AI agent."""

    # Project metadata
    PROJECT_NAME: str = "Kortex API"
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
        "https://kortex-246.web.app",
        "https://kortex-246.firebaseapp.com",
    ]

    # JWT Authentication & Security Settings
    JWT_SECRET_KEY: str = "todo_super_secret_jwt_key_secure_production_ready_sha256_hash_9823147"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days token validity


    # Groq AI Configuration (loaded securely from .env or environment)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    k1: str = ""
    k2: str = ""
    k3: str = ""

    def get_api_key(self) -> str:
        """Resolve Groq API key from GROQ_API_KEY or split pieces."""
        if self.GROQ_API_KEY and self.GROQ_API_KEY.strip():
            return self.GROQ_API_KEY.strip()
        parts = (self.k1 + self.k2 + self.k3).strip()
        return parts

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
