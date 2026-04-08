from __future__ import annotations

"""Open-Meteo API client.

This module is responsible only for talking to the external weather API and
validating the response shape. It does not know anything about the database.

High-level flow:
1. Build query parameters from the application settings
2. Call the `/forecast` endpoint
3. Parse the JSON response
4. Validate it with Pydantic models
5. Return a typed result object for the service layer
"""

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

import httpx
from pydantic import BaseModel, ConfigDict, Field, ValidationError

from enviro_monitor.config import Settings


class CurrentWeatherPayload(BaseModel):
    """Validated shape of the `current` section from Open-Meteo."""

    time: datetime
    temperature_2m: float | None = None
    wind_speed_10m: float | None = None
    precipitation: float | None = None


class HourlyWeatherPayload(BaseModel):
    """Validated shape of the `hourly` section from Open-Meteo."""

    time: list[datetime]
    temperature_2m: list[float | None] = Field(default_factory=list)
    wind_speed_10m: list[float | None] = Field(default_factory=list)
    precipitation_probability: list[float | None] = Field(default_factory=list)
    precipitation: list[float | None] = Field(default_factory=list)


class OpenMeteoResponse(BaseModel):
    """Top-level response model used by the rest of the backend.

    `extra="allow"` means unknown fields from the API are tolerated. That is
    useful because Open-Meteo may return more data than this project needs.
    """

    model_config = ConfigDict(extra="allow")

    latitude: float
    longitude: float
    timezone: str
    current: CurrentWeatherPayload
    hourly: HourlyWeatherPayload


@dataclass(slots=True)
class FetchResult:
    """Result returned by the client layer.

    `payload` is the validated/typed representation.
    `raw_payload` keeps the original JSON for auditing and future debugging.
    `fetched_at` records when our backend made the request.
    """

    fetched_at: datetime
    payload: OpenMeteoResponse
    raw_payload: dict[str, Any]


class OpenMeteoError(RuntimeError):
    """Raised when the API response cannot be validated as expected."""

    pass


class OpenMeteoClient:
    """Small wrapper around `httpx.Client` for Open-Meteo requests."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.Client(base_url=settings.open_meteo_base_url, timeout=settings.request_timeout_seconds)

    def fetch_weather(self) -> FetchResult:
        """Fetch current weather and a short hourly forecast for one location."""

        params = {
            "latitude": self._settings.weather_latitude,
            "longitude": self._settings.weather_longitude,
            "timezone": self._settings.weather_timezone,
            # Open-Meteo expects comma-separated field names in the query string.
            "current": ",".join(["temperature_2m", "wind_speed_10m", "precipitation"]),
            "hourly": ",".join(["temperature_2m", "wind_speed_10m", "precipitation"]),
            "forecast_days": 1,
        }
        response = self._client.get("/forecast", params=params)
        # Raise an exception for 4xx/5xx responses instead of silently continuing.
        response.raise_for_status()
        raw_payload = response.json()
        try:
            parsed = OpenMeteoResponse.model_validate(raw_payload)
        except ValidationError as exc:
            # Re-raise a project-specific error so callers do not need to depend
            # on Pydantic's exception types directly.
            raise OpenMeteoError("Open-Meteo response validation failed") from exc
        return FetchResult(
            fetched_at=datetime.now(UTC),
            payload=parsed,
            raw_payload=raw_payload,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "OpenMeteoClient":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
