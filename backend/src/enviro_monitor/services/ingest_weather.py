from __future__ import annotations

"""Business logic for weather ingestion.

This layer sits between the HTTP client and the database repository.

Responsibilities:
- ask the client for fresh weather data
- convert API payloads into database-ready records
- hand those records to the repository for persistence
- emit a summary log about the ingestion run
"""

import logging
from collections.abc import Iterable
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from enviro_monitor.clients.open_meteo import FetchResult, OpenMeteoClient
from enviro_monitor.repositories.weather_repository import (
    WeatherObservationCreate,
    WeatherObservationRepository,
)

logger = logging.getLogger(__name__)


class WeatherIngestionService:
    """Application service that orchestrates one ingestion run."""

    def __init__(
        self,
        client: OpenMeteoClient,
        repository: WeatherObservationRepository,
    ) -> None:
        self._client = client
        self._repository = repository

    def ingest(self) -> int:
        """Fetch weather data, map it to rows, and store it.

        Returns:
            int: Number of rows that were newly inserted into the database.
        """

        result = self._client.fetch_weather()
        records = list(self._build_records(result))
        inserted_count = self._repository.insert_many(records)
        logger.info(
            "weather_ingestion_completed",
            extra={
                "event_data": {
                    "location": {
                        "latitude": result.payload.latitude,
                        "longitude": result.payload.longitude,
                        "timezone": result.payload.timezone,
                    },
                    "record_count": len(records),
                    "inserted_count": inserted_count,
                },
            },
        )
        return inserted_count

    def _build_records(self, result: FetchResult) -> Iterable[WeatherObservationCreate]:
        """Convert one API response into one current row and many forecast rows.

        Open-Meteo may return local timestamps without timezone offsets when a
        specific timezone is requested. Before storing them, normalize every
        observation time to an explicit UTC instant.
        """

        payload = result.payload
        source_timezone = ZoneInfo(payload.timezone)
        yield WeatherObservationCreate(
            source="open-meteo",
            record_type="current",
            latitude=payload.latitude,
            longitude=payload.longitude,
            timezone=payload.timezone,
            observation_time=self._normalize_observation_time(payload.current.time, source_timezone),
            temperature_c=payload.current.temperature_2m,
            wind_speed_kmh=payload.current.wind_speed_10m,
            precipitation_mm=payload.current.precipitation,
            fetched_at=result.fetched_at,
            raw_payload=result.raw_payload,
        )

        hourly = payload.hourly
        for index, observation_time in enumerate(hourly.time):
            # Each hourly timestamp becomes its own database row. The helper
            # method below protects us if a data array is shorter than `time`.
            yield WeatherObservationCreate(
                source="open-meteo",
                record_type="forecast",
                latitude=payload.latitude,
                longitude=payload.longitude,
                timezone=payload.timezone,
                observation_time=self._normalize_observation_time(observation_time, source_timezone),
                temperature_c=self._value_at(hourly.temperature_2m, index),
                wind_speed_kmh=self._value_at(hourly.wind_speed_10m, index),
                precipitation_mm=self._value_at(hourly.precipitation, index),
                fetched_at=result.fetched_at,
                raw_payload=result.raw_payload,
            )

    @staticmethod
    def _value_at(values: list[float | None], index: int) -> float | None:
        """Safely return a list value or `None` if the index is missing."""

        return values[index] if index < len(values) else None

    @staticmethod
    def _normalize_observation_time(value: datetime, source_timezone: ZoneInfo) -> datetime:
        """Convert source timestamps into explicit UTC datetimes.

        If the source value is naive, interpret it in the API's declared
        timezone first. If it already has timezone information, trust that
        offset and convert it to UTC.
        """

        if value.tzinfo is None:
            value = value.replace(tzinfo=source_timezone)
        return value.astimezone(UTC)
