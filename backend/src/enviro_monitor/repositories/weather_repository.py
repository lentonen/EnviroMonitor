from __future__ import annotations

"""Database write logic for weather observations.

The repository layer keeps SQLAlchemy-specific persistence code out of the
service layer. That separation makes the business logic easier to read and test.
"""

from collections.abc import Sequence
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from enviro_monitor.models.weather import WeatherObservation


@dataclass(slots=True)
class WeatherObservationCreate:
    """Plain data object representing one row we want to insert."""

    source: str
    record_type: str
    latitude: float
    longitude: float
    timezone: str
    observation_time: datetime
    temperature_c: float | None
    wind_speed_kmh: float | None
    precipitation_mm: float | None
    fetched_at: datetime
    raw_payload: dict[str, Any]


class WeatherObservationRepository:
    """Repository responsible for writing weather rows to PostgreSQL."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def insert_many(self, records: Sequence[WeatherObservationCreate]) -> int:
        """Insert multiple records in one SQL statement.

        If a row already exists according to the unique constraint, PostgreSQL
        updates the stored weather values so the database keeps the latest
        forecast for that timestamp/location.
        """

        if not records:
            return 0

        statement = insert(WeatherObservation).values([asdict(record) for record in records])
        statement = statement.on_conflict_do_update(
            constraint="uq_weather_observations_source_location_time_type",
            set_={
                "temperature_c": statement.excluded.temperature_c,
                "wind_speed_kmh": statement.excluded.wind_speed_kmh,
                "precipitation_mm": statement.excluded.precipitation_mm,
                "timezone": statement.excluded.timezone,
                "fetched_at": statement.excluded.fetched_at,
                "raw_payload": statement.excluded.raw_payload,
            },
        )
        result = self._session.execute(statement)
        self._session.commit()
        return result.rowcount or 0
