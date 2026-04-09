# EnviroMonitor

Real-time open data dashboard for environmental signals.

## Repository layout

- `frontend`: React 19 + Vite + TypeScript dashboard foundation
- `docker-compose.yml`: local container orchestration entrypoint

## Frontend quick start

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Run with Docker Compose

```bash
docker compose up frontend --build
```

## Frontend tests

```bash
cd frontend
pnpm test
pnpm test:e2e
```

## Frontend foundation features

- shadcn/ui + Tailwind v4 styling baseline
- Leaflet map rendered in a dashboard shell
- React Suspense loading animation for lazy-loaded map feature
- TanStack Query provider and query key structure for upcoming API integration

## Next integration points

- Earthquakes: `frontend/src/features/earthquakes/api/fetch-earthquakes.ts`
- Weather: `frontend/src/features/weather/api/fetch-weather.ts`
- Shared query setup: `frontend/src/shared/api/query-client.ts`
