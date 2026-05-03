from __future__ import annotations

"""Tests for the weather ingestion service.

This test file focuses on the service layer only. It does not call the real
Open-Meteo API or a real PostgreSQL database. Instead, it uses small fake
objects ("stubs") so the test stays fast and predictable.
"""

from datetime import UTC, datetime

from sqlalchemy.dialects import postgresql

from enviro_monitor.clients.open_meteo import FetchResult, OpenMeteoResponse
from enviro_monitor.repositories.weather_repository import (
    WeatherObservationCreate,
    WeatherObservationRepository,
)
from enviro_monitor.services.ingest_weather import WeatherIngestionService


class StubClient:
    """Fake client used by tests instead of the real HTTP client."""

    def __init__(self, result: FetchResult) -> None:
        self._result = result

    def fetch_weather(self, location) -> FetchResult:
        return self._result


class StubRepository(WeatherObservationRepository):
    """Fake repository that stores inserted rows in memory for assertions."""

    def __init__(self) -> None:  # type: ignore[super-init-not-called]
        self.records = []

    def insert_many(self, records):  # type: ignore[override]
        self.records.extend(records)
        return len(records)


class CaptureSession:
    """Tiny fake session used to inspect the generated SQL statement."""

    def __init__(self) -> None:
        self.statement = None

    def execute(self, statement):
        self.statement = statement

        class Result:
            def scalars(self):
                class Scalars:
                    @staticmethod
                    def all():
                        return [1]

                return Scalars()

        return Result()

    def commit(self) -> None:
        pass


class RowcountMinusOneSession:
    """Simulate a driver that cannot report rowcount for an upsert."""

    def __init__(self, returned_ids: list[int]) -> None:
        self.returned_ids = returned_ids

    def execute(self, statement):
        class Result:
            rowcount = -1

            def __init__(self, returned_ids: list[int]) -> None:
                self._returned_ids = returned_ids

            def scalars(self):
                class Scalars:
                    def __init__(self, returned_ids: list[int]) -> None:
                        self._returned_ids = returned_ids

                    def all(self) -> list[int]:
                        return self._returned_ids

                return Scalars(self._returned_ids)

        return Result(self.returned_ids)

    def commit(self) -> None:
        pass


def test_ingest_builds_current_and_forecast_records() -> None:
    """One API payload should become one current row plus two forecast rows."""

    raw_payload = {
        "name": "Helsinki",
        "latitude": 60.1699,
        "longitude": 24.9384,
        "timezone": "Europe/Helsinki",
        "current": {
            "time": "2026-04-08T08:00:00Z",
            "temperature_2m": 5.1,
            "wind_speed_10m": 12.3,
            "precipitation": 0.0,
        },
        "hourly": {
            "time": ["2026-04-08T09:00:00Z", "2026-04-08T10:00:00Z"],
            "temperature_2m": [5.3, 5.5],
            "wind_speed_10m": [13.0, 14.2],
            "precipitation": [0.1, 0.0],
        },
    }
    result = FetchResult(
        fetched_at=datetime(2026, 4, 8, 8, 30, tzinfo=UTC),
        payload=OpenMeteoResponse.model_validate(raw_payload),
        raw_payload=raw_payload,
    )
    repository = StubRepository()
    service = WeatherIngestionService(client=StubClient(result), repository=repository, locations=[raw_payload])

    upserted_count = service.ingest()
    assert upserted_count == 3
    assert len(repository.records) == 3
    assert repository.records[0].record_type == "current"
    assert repository.records[1].record_type == "forecast"
    assert repository.records[2].observation_time == datetime(2026, 4, 8, 10, 0, tzinfo=UTC)


def test_with_invalid_data() -> None:
    """False payload should not make it into the database. The service should log a warning and continue with the next location."""

    raw_payload = {
        "latitude": 60.1699,
        "longitude": 24.9384,
        "timezone": "Europe/Helsinki",
        "current": {
            "time": "2026-04-08T08:00:00Z",
            "temperature_2m": 5.1,
            "wind_speed_10m": 12.3,
            "precipitation": 0.0,
        },
        "hourly": {
            "time": ["2026-04-08T09:00:00Z", "2026-04-08T10:00:00Z"],
            "temperature_2m": [5.3, 5.5],
            "wind_speed_10m": [13.0, 14.2],
            "precipitation": [0.1, 0.0],
        },
    }
    result = FetchResult(
        fetched_at=datetime(2026, 4, 8, 8, 30, tzinfo=UTC),
        payload=OpenMeteoResponse.model_validate(raw_payload),
        raw_payload=raw_payload,
    )
    repository = StubRepository()

    correct_location_data = {
    "name": "Oulu",
    "latitude": 60.1699,
    "longitude": 24.9384,
    "timezone": "Europe/Helsinki"
    }

    false_latitude_location = {
        "name": "lat_error", 
        "latitude": 220.1699, 
        "longitude": 24.9384, 
        "timezone": "Europe/Helsinki"
    }

    false_longitude_location = {
        "name": "long_error",
        "latitude": 60.1699, 
        "longitude": 224.9384, 
        "timezone": "Europe/Helsinki"
    }

    empty_timezone_location = {
        "name": "timezone_error", 
        "latitude": 60.1699, 
        "longitude": 24.9384, 
        "timezone": ""
    }

    false_timezone_location = {
        "name": "timezone_error",       
        "latitude": 60.1699, 
        "longitude": 24.9384,               
        "timezone": "Europe/Helsinkii"
    }
     
    test_locations = [
        correct_location_data, 
        false_latitude_location, 
        false_longitude_location, 
        empty_timezone_location,
        false_timezone_location
    ]
    
    service = WeatherIngestionService(client=StubClient(result), repository=repository, locations=test_locations)

    upserted_count = service.ingest()

    assert upserted_count == 3
    assert len(repository.records) == 3

def test_ingest_normalizes_local_open_meteo_timestamps_to_utc() -> None:
    """Naive local API times should be stored as explicit UTC instants."""

    raw_payload = {
        "latitude": 60.1699,
        "longitude": 24.9384,
        "timezone": "Europe/Helsinki",
        "current": {
            "time": "2026-04-08T11:00:00",
            "temperature_2m": 5.1,
            "wind_speed_10m": 12.3,
            "precipitation": 0.0,
        },
        "hourly": {
            "time": ["2026-04-08T12:00:00"],
            "temperature_2m": [5.3],
            "wind_speed_10m": [13.0],
            "precipitation": [0.1],
        },
    }
    result = FetchResult(
        fetched_at=datetime(2026, 4, 8, 8, 30, tzinfo=UTC),
        payload=OpenMeteoResponse.model_validate(raw_payload),
        raw_payload=raw_payload,
    )
    repository = StubRepository()
    service = WeatherIngestionService(client=StubClient(result), repository=repository)

    service.ingest()

    assert repository.records[0].observation_time == datetime(2026, 4, 8, 8, 0, tzinfo=UTC)
    assert repository.records[1].observation_time == datetime(2026, 4, 8, 9, 0, tzinfo=UTC)


def test_repository_upserts_existing_forecast_rows() -> None:
    """Conflicting rows should update weather values instead of being ignored."""

    session = CaptureSession()
    repository = WeatherObservationRepository(session)

    rowcount = repository.insert_many(
        [
            WeatherObservationCreate(
                source="open-meteo",
                record_type="forecast",
                latitude=60.1699,
                longitude=24.9384,
                timezone="Europe/Helsinki",
                observation_time=datetime(2026, 4, 8, 10, 0, tzinfo=UTC),
                temperature_c=7.2,
                wind_speed_kmh=11.5,
                precipitation_mm=0.4,
                fetched_at=datetime(2026, 4, 8, 9, 30, tzinfo=UTC),
                raw_payload={"example": True},
            ),
        ]
    )

    compiled = str(
        session.statement.compile(
            dialect=postgresql.dialect(),
        )
    )

    assert rowcount == 1
    assert "ON CONFLICT ON CONSTRAINT uq_weather_observations_source_location_time_type DO UPDATE" in compiled
    assert "temperature_c = excluded.temperature_c" in compiled
    assert "wind_speed_kmh = excluded.wind_speed_kmh" in compiled
    assert "precipitation_mm = excluded.precipitation_mm" in compiled
    assert "RETURNING weather_observations.id" in compiled


def test_repository_counts_returned_rows_when_rowcount_is_unknown() -> None:
    """Upsert count should not depend on rowcount when drivers return -1."""

    session = RowcountMinusOneSession(returned_ids=[101, 102])
    repository = WeatherObservationRepository(session)

    rowcount = repository.insert_many(
        [
            WeatherObservationCreate(
                source="open-meteo",
                record_type="forecast",
                latitude=60.1699,
                longitude=24.9384,
                timezone="Europe/Helsinki",
                observation_time=datetime(2026, 4, 8, 10, 0, tzinfo=UTC),
                temperature_c=7.2,
                wind_speed_kmh=11.5,
                precipitation_mm=0.4,
                fetched_at=datetime(2026, 4, 8, 9, 30, tzinfo=UTC),
                raw_payload={"example": True},
            ),
            WeatherObservationCreate(
                source="open-meteo",
                record_type="forecast",
                latitude=60.1699,
                longitude=24.9384,
                timezone="Europe/Helsinki",
                observation_time=datetime(2026, 4, 8, 11, 0, tzinfo=UTC),
                temperature_c=7.5,
                wind_speed_kmh=10.1,
                precipitation_mm=0.2,
                fetched_at=datetime(2026, 4, 8, 9, 30, tzinfo=UTC),
                raw_payload={"example": False},
            ),
        ]
    )

    assert rowcount == 2
