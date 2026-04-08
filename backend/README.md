# EnviroMonitor Backend

Minimal Python backend that ingests Helsinki weather data from Open-Meteo into PostgreSQL.

## Prerequisites

- Python 3.14.3 available to `uv`
- Docker Desktop
- `uv` installed

## Quick start

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL:
   `docker compose up -d db`
3. Install dependencies:
   `uv sync`
4. Run migrations:
   `uv run alembic upgrade head`
5. Run one ingestion cycle:
   `uv run python -m enviro_monitor.main once`
6. Run the polling loop:
   `uv run python -m enviro_monitor.main loop`

If the migration fails with PostgreSQL authentication errors, recreate the Docker volume from the repository root so Postgres picks up the current auth settings:

`docker compose down -v`

`docker compose up -d db`

Then rerun:

`uv run alembic upgrade head`

## What it does

- Fetches current weather for Helsinki from Open-Meteo
- Fetches a short hourly forecast window
- Stores normalized rows in PostgreSQL
- Prevents duplicate rows on repeated ingestion runs

## Default configuration

- Latitude: `60.1699`
- Longitude: `24.9384`
- Timezone: `Europe/Helsinki`
- Poll interval: `900` seconds
- PostgreSQL host port: `55432`

These defaults can be overridden through `.env`.

## Environment variables

- `DATABASE_URL`
- `OPEN_METEO_BASE_URL`
- `WEATHER_LATITUDE`
- `WEATHER_LONGITUDE`
- `WEATHER_TIMEZONE`
- `POLL_INTERVAL_SECONDS`
- `REQUEST_TIMEOUT_SECONDS`

## Commands

- `uv run python -m enviro_monitor.main once`
- `uv run python -m enviro_monitor.main loop`
- `uv run pytest`
- `docker exec -it enviro-monitor-postgres psql -U enviro_monitor -d enviro_monitor`

## Database

The service writes to the `weather_observations` table created by Alembic migrations.

Important columns:

- `source`
- `record_type`
- `observation_time`
- `temperature_c`
- `wind_speed_kmh`
- `precipitation_mm`
- `raw_payload`

To inspect the database directly from the running container:

`docker exec -it enviro-monitor-postgres psql -U enviro_monitor -d enviro_monitor`

Useful commands in `psql`:

- `\dt`
- `\d weather_observations`
- `SELECT count(*) FROM weather_observations;`
- `SELECT * FROM weather_observations ORDER BY observation_time DESC LIMIT 10;`

To connect from pgAdmin, use:

- Host: `localhost`
- Port: `55432`
- Database: `enviro_monitor`
- Username: `enviro_monitor`
- Password: `enviro_monitor`

## Troubleshooting

- If PostgreSQL is not running, start it from the repository root with `docker compose up -d db`.
- If migrations fail, confirm `DATABASE_URL` in `.env` matches the Docker Compose database settings.
- If authentication still fails, remove the existing Docker volume with `docker compose down -v` and start the database again.
- If API calls fail, verify outbound internet access and check `OPEN_METEO_BASE_URL`.
