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

from locations import WEATHER_LOCATIONS

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
        locations: list[tuple[float, float, str]] | None = None,
    ) -> None:
        self._client = client
        self._repository = repository
        self._locations = locations or WEATHER_LOCATIONS

    def _is_valid_location(self, location: tuple[float, float, str]) -> bool:
        """Check if the given location is valid."""
        latitude, longitude, timezone = location
        if not (-90 <= latitude <= 90) or type(latitude) is not float or latitude is None:
            return False    
        if not (-180 <= longitude <= 180) or type(longitude) is not float or longitude is None:
            return False
        if not timezone or type(timezone) is not str or timezone.strip() == "":
            return False  


    def ingest(self) -> int:
        """Fetch weather data, map it to rows, and store it.

        Returns:
            int: Number of rows affected by the upsert operation.
        """
        all_records = []
        all_results = []

        if not self._locations:
            logger.warning("weather_ingestion_no_locations", extra={"event_data": {}})
            return 0

        for location in self._locations:
            if not self._is_valid_location(location):
                logger.warning("weather_ingestion_invalid_location", extra={"event_data": {"location": location}})
                continue
            result = self._client.fetch_weather(location) 
            all_results.append(result)
            records = list(self._build_records(result))
            all_records.extend(records)

        upserted_count = self._repository.insert_many(all_records)

        logger.info(
            "weather_ingestion_completed",
            extra={
                "event_data": {
                    "locations": [(result.payload.latitude, result.payload.longitude, result.payload.timezone) for result in all_results],
                    "record_count": len(all_records),
                    "upserted_count": upserted_count,
                },
            },
        )
        return upserted_count

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
