from __future__ import annotations

"""SQLAlchemy ORM model definitions.

An ORM model maps a Python class to a database table. In this file,
`WeatherObservation` represents one row in the `weather_observations` table.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import BigInteger, DateTime, Float, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from enviro_monitor.db.base import Base


class WeatherObservation(Base):
    """Database model for stored weather observations and forecast rows.

    This table stores both:
    - the current weather snapshot
    - hourly forecast records

    `record_type` is used to distinguish those row types.
    """

    __tablename__ = "weather_observations"
    __table_args__ = (
        UniqueConstraint(
            "source",
            "latitude",
            "longitude",
            "observation_time",
            "record_type",
            name="uq_weather_observations_source_location_time_type",
        ),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    # Source metadata
    source: Mapped[str] = mapped_column(String(50))
    record_type: Mapped[str] = mapped_column(String(20))

    # Location metadata
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    # Original timezone context from the source API. `observation_time` is
    # stored in UTC; this keeps the source timezone for display and auditing.
    timezone: Mapped[str] = mapped_column(String(100))

    # Canonical observation timestamp stored as a UTC instant.
    observation_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    temperature_c: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed_kmh: Mapped[float | None] = mapped_column(Float, nullable=True)
    precipitation_mm: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Audit/debugging data
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    raw_payload: Mapped[dict[str, Any]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
