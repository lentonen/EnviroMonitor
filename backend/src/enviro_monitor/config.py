"""
Application configuration (environment-driven settings).

This module defines strongly-typed settings loaded from environment variables and/or a
local `.env` file (see `Settings.model_config`). It centralizes runtime configuration
such as:

- Database connection URL (`DATABASE_URL`)
- Open-Meteo API base URL (`OPEN_METEO_BASE_URL`)
- Default coordinates/timezone for polling weather (defaults to Helsinki, Finland)
- Polling interval and request timeouts

The rest of the backend should prefer calling `get_settings()` instead of instantiating
`Settings()` directly so configuration is parsed/validated once per process.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field, PositiveInt
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Runtime configuration loaded from environment variables.

    Notes:
    - Each field uses `alias=...` so the expected environment variable names are
      explicit and stable.
    - Defaults are provided for non-secret values (e.g. Helsinki coordinates), while
      required values like `DATABASE_URL` must be supplied.
    - Values are validated at startup (e.g. `poll_interval_seconds` must be positive).
    """

    database_url: str = Field(alias="DATABASE_URL")
    open_meteo_base_url: str = Field(default="https://api.open-meteo.com/v1", alias="OPEN_METEO_BASE_URL")
    weather_latitude: float = Field(default=60.1699, alias="WEATHER_LATITUDE")
    weather_longitude: float = Field(default=24.9384, alias="WEATHER_LONGITUDE")
    weather_timezone: str = Field(default="Europe/Helsinki", alias="WEATHER_TIMEZONE")
    poll_interval_seconds: PositiveInt = Field(default=900, alias="POLL_INTERVAL_SECONDS")
    request_timeout_seconds: float = Field(default=30.0, alias="REQUEST_TIMEOUT_SECONDS", gt=0)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the process-wide settings instance.

    `lru_cache(maxsize=1)` ensures settings are created/validated only once and then
    reused across imports/requests (avoids repeatedly parsing the environment).
    """

    return Settings()
