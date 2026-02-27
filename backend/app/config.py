"""
Krishi Sakhi — Configuration Module.

Loads environment variables with validation using pydantic-settings.
Single source of truth for all config values.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from .env file and environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    app_env: str = Field(default="development", description="Environment: development | staging | production")
    app_port: int = Field(default=8000, description="Server port")
    app_host: str = Field(default="0.0.0.0", description="Server host")

    # --- Supabase ---
    supabase_url: str = Field(default="", description="Supabase project URL")
    supabase_anon_key: str = Field(default="", description="Supabase anon/public key")
    supabase_service_role_key: str = Field(default="", description="Supabase service role key (server-side only)")

    # --- Direct PostgreSQL ---
    database_url: str = Field(default="", description="PostgreSQL connection string")

    # --- External APIs ---
    gemini_api_key: str = Field(default="", description="Google Gemini AI API key")
    openweather_api_key: str = Field(default="", description="OpenWeather API key")

    # --- Security ---
    jwt_secret: str = Field(default="", description="Supabase JWT secret for token verification")
    cors_origins: str = Field(default="http://localhost:3000", description="Comma-separated allowed origins")

    # --- Logging ---
    log_level: str = Field(default="INFO", description="Logging level: DEBUG | INFO | WARNING | ERROR")

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance.
    Call get_settings() anywhere to get the config.
    Cached so .env is only read once.
    """
    return Settings()
