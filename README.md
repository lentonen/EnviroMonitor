# EnviroMonitor

EnviroMonitor is a beginner-friendly open data monitoring project for learning how real data systems are built.

The long-term goal is to collect environmental data from public APIs, store it in a database, expose it through a backend service, and visualize it in a web dashboard. The repository now contains two active slices of that roadmap:

- a Python backend milestone that fetches weather data for Helsinki from Open-Meteo and stores it in PostgreSQL
- a React dashboard foundation that provides the first frontend shell for future weather and earthquake visualizations

This project is intentionally small, but it uses the same building blocks that appear in larger production systems:

- external API calls
- environment-based configuration
- database persistence
- schema migrations
- automated tests
- containerized local infrastructure
- frontend state and UI composition

## Project Overview

This project is designed to help junior developers understand the full path from external data source to working application.

By the end of the larger project, contributors will have built a complete pipeline consisting of:

- external data ingestion
- backend API service
- database storage
- frontend visualization
- containerized local development

The project simulates a simplified monitoring dashboard similar to the kind of systems used in analytics platforms, operational dashboards, and monitoring tools.

## What We Are Building

We are building a small platform that automatically collects and displays real-world environmental events.

The planned system tracks two public data sources:

- Earthquakes from the United States Geological Survey feed
- Weather information from the Open-Meteo API

Planned earthquake data includes:

- location
- magnitude
- depth
- time of occurrence

Planned weather data includes:

- temperature
- wind speed
- precipitation
- forecast information

The intended end state is a backend and dashboard where users can explore environmental activity in near real time.

## Who This Project Is For

This repository is a good starting point if you want to learn:

- how Python backend projects are organized
- how data moves from an external API into a database
- how database schema migrations work
- how frontend dashboards are structured
- how to run and test services locally
- how to contribute small changes safely

You do not need prior Python experience to start reading the code.

## Current Status

Implemented today:

- Python backend service
- Open-Meteo weather ingestion for Helsinki
- PostgreSQL storage
- Alembic migration setup
- automated backend tests for ingestion behavior
- React 19 + Vite + TypeScript frontend foundation
- dashboard shell with Leaflet map and shared query setup

Not implemented yet:

- earthquake ingestion
- backend API for reading stored data
- live frontend integration with backend data
- full end-to-end containerized application deployment

## Repository Layout

- [backend](C:/dev/EnviroMonitor/backend): Python backend service root
- [backend/src/enviro_monitor](C:/dev/EnviroMonitor/backend/src/enviro_monitor): backend application code
- [backend/alembic](C:/dev/EnviroMonitor/backend/alembic): database migration setup
- [backend/tests](C:/dev/EnviroMonitor/backend/tests): backend automated tests
- [frontend](C:/dev/EnviroMonitor/frontend): React dashboard app
- [docker-compose.yml](C:/dev/EnviroMonitor/docker-compose.yml): local frontend container entrypoint

Important backend modules:

- [main.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/main.py): application entrypoint
- [config.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/config.py): environment-based settings
- [open_meteo.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/clients/open_meteo.py): API client
- [ingest_weather.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/services/ingest_weather.py): business logic
- [weather_repository.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/repositories/weather_repository.py): database writes
- [weather.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/models/weather.py): ORM model

Important frontend integration points:

- `frontend/src/features/earthquakes/api/fetch-earthquakes.ts`
- `frontend/src/features/weather/api/fetch-weather.ts`
- `frontend/src/shared/api/query-client.ts`

## Tech Stack

Backend:

- Python 3.14.3
- `uv` for dependency management and command execution
- SQLAlchemy 2.x
- Alembic
- PostgreSQL 17
- pytest

Frontend:

- React 19
- Vite
- TypeScript
- TanStack Query
- Leaflet
- shadcn/ui + Tailwind v4
- Vitest
- Playwright

## Backend Quick Start

Prerequisites:

- Python 3.14.3
- `uv`
- Docker Desktop

From the repository root:

1. Start PostgreSQL:

```powershell
docker compose up -d db
```

1. Move into the backend directory:

```powershell
cd backend
```

1. Create your local environment file:

```powershell
Copy-Item .env.example .env
```

1. Install dependencies:

```powershell
uv sync
```

1. Apply the database migration:

```powershell
uv run alembic upgrade head
```

1. Run one ingestion cycle:

```powershell
uv run python -m enviro_monitor.main once
```

1. Run tests:

```powershell
uv run pytest
```

If all of the above work, your local backend setup is healthy.

## Frontend Quick Start

From the repository root:

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

Frontend tests:

```bash
cd frontend
pnpm test
pnpm test:e2e
```

## Run Frontend With Docker Compose

The current root `docker-compose.yml` starts the frontend development container:

```bash
docker compose up frontend --build
```

This is separate from the backend PostgreSQL setup documented above.

## What The Backend Does

Right now the backend implements the first ingestion slice:

1. reads configuration from `.env`
2. calls the Open-Meteo API
3. validates the response with Pydantic
4. converts the response into database rows
5. inserts or updates weather records in PostgreSQL

Important behavior:

- `current` weather is stored as a row
- hourly forecast rows are also stored
- if the same forecast timestamp arrives later with new values, the row is updated so the database keeps the latest forecast

## Frontend Foundation Features

- shadcn/ui + Tailwind v4 styling baseline
- Leaflet map rendered in a dashboard shell
- React Suspense loading animation for a lazy-loaded map feature
- TanStack Query provider and query key structure for upcoming API integration

## Daily Development Commands

Backend:

```powershell
uv run python -m enviro_monitor.main once
uv run python -m enviro_monitor.main loop
uv run pytest
```

Frontend:

```bash
pnpm dev
pnpm test
pnpm test:e2e
```

Open a PostgreSQL shell inside Docker:

```powershell
docker exec -it enviro-monitor-postgres psql -U enviro_monitor -d enviro_monitor
```

## Environment Variables

The backend reads settings from [backend/.env.example](C:/dev/EnviroMonitor/backend/.env.example).

- `DATABASE_URL`: PostgreSQL connection string
- `OPEN_METEO_BASE_URL`: Open-Meteo API base URL
- `WEATHER_LATITUDE`: default latitude
- `WEATHER_LONGITUDE`: default longitude
- `WEATHER_TIMEZONE`: default timezone
- `POLL_INTERVAL_SECONDS`: delay between loop runs
- `REQUEST_TIMEOUT_SECONDS`: HTTP timeout for API requests

Current local defaults:

- location: Helsinki
- timezone: `Europe/Helsinki`
- PostgreSQL host port: `55432`

## Inspecting The Database

Open `psql` inside the running container:

```powershell
docker exec -it enviro-monitor-postgres psql -U enviro_monitor -d enviro_monitor
```

Useful commands:

```sql
\dt
\d weather_observations
SELECT count(*) FROM weather_observations;
SELECT * FROM weather_observations ORDER BY observation_time DESC LIMIT 10;
\q
```

### pgAdmin Connection

Use these values in pgAdmin:

- Host: `localhost`
- Port: `55432`
- Database: `enviro_monitor`
- Username: `enviro_monitor`
- Password: `enviro_monitor`

## How To Start Reading The Code

If you are new to Python, read the backend files in this order:

1. [main.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/main.py)
2. [config.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/config.py)
3. [open_meteo.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/clients/open_meteo.py)
4. [ingest_weather.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/services/ingest_weather.py)
5. [weather_repository.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/repositories/weather_repository.py)
6. [weather.py](C:/dev/EnviroMonitor/backend/src/enviro_monitor/models/weather.py)
7. [test_ingest_weather.py](C:/dev/EnviroMonitor/backend/tests/test_ingest_weather.py)

That path shows the full flow from app startup to API call to database insert to test coverage.

## Beginner Contribution Ideas

Join our project space in PiecesHub platform:

[https://api.pieceshub.com/api/projects/4/og](https://api.pieceshub.com/api/projects/4/og)

Good first contributions in this repo:

- improve README explanations
- add tests for edge cases
- improve error messages or logging
- add more documentation to modules
- add a small read-only API endpoint
- add support for another weather location
- start the earthquake ingestion feature
- wire frontend components to real backend data

When making changes:

- keep `.env` local and do not commit it
- run `uv run pytest` for backend changes
- run `pnpm test` for frontend changes
- prefer small pull requests focused on one behavior

## Troubleshooting

If Alembic cannot connect to PostgreSQL:

```powershell
cd C:\dev\EnviroMonitor
docker compose down -v
docker compose up -d db
cd backend
uv run alembic upgrade head
```

If your editor cannot resolve Python imports:

- make sure the interpreter is `backend\.venv\Scripts\python.exe`

If frontend dependencies are missing:

- run `pnpm install` inside `frontend`

If API calls fail:

- verify internet access
- verify `OPEN_METEO_BASE_URL`

## Notes

- Docker Compose is configured for local development convenience, not production security.
- More backend-specific operational details are documented in [backend/README.md](C:/dev/EnviroMonitor/backend/README.md).
