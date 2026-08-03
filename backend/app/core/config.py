"""
MessMate - Application Configuration
Loads settings from environment variables. Supports Supabase for DB and auth.
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MessMate"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_JWKS_URL: str = ""

    # Database – Supabase PostgreSQL connection string
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/messmate_db"

    # JWT (for our own token signing, used alongside Supabase auth)
    SECRET_KEY: str = "super-secret-key-change-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis (optional)
    REDIS_URL: Optional[str] = None

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
