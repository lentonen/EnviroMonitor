# EnviroMonitor Frontend

Frontend dashboard for live environmental monitoring data (earthquakes + weather), built with React, TypeScript, and Vite.

## What this app has

- Dashboard shell with responsive header and mobile sheet menu.
- Overview page with live metrics:
  - Active stations
  - Critical alerts
  - Total earthquakes
  - Feed status
- Interactive map with layers:
  - Earthquakes (USGS)
  - Weather stations (NOAA)
- Incident table with per-row `Show on map` action that scrolls to the map and focuses the selected event.
- Data fetching and caching via TanStack Query.
- Feature-first folder layout for earthquakes, weather, and map modules.

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Leaflet + react-leaflet
- TanStack Query
- Vitest + Testing Library
- Playwright

## Prerequisites

- Node.js 20+ (recommended)
- pnpm 9+ (or whatever version your workspace standard uses)

## How to run

From the `frontend` folder:

```bash
pnpm install
pnpm dev
```

App URL:

- [http://localhost:5173](http://localhost:5173)

## Available scripts

- `pnpm dev`: start Vite dev server
- `pnpm build`: type-check and create production build
- `pnpm preview`: preview production build locally
- `pnpm lint`: run ESLint
- `pnpm test`: run unit/integration tests once
- `pnpm test:watch`: run tests in watch mode
- `pnpm test:coverage`: run tests with coverage
- `pnpm test:e2e`: run Playwright end-to-end tests

## Testing

Run core tests:

```bash
pnpm test
```

Run coverage:

```bash
pnpm test:coverage
```

Run e2e:

```bash
pnpm test:e2e
```

## Build for production

```bash
pnpm build
pnpm preview
```

## Current data sources

At the moment, the frontend is wired to mock data in these files:

- `src/features/earthquakes/api/fetch-earthquakes.ts`
- `src/features/weather/api/fetch-weather.ts`

When moving to real APIs, these are the primary integration points:

- `src/features/earthquakes/api`
- `src/features/weather/api`
- `src/shared/api/query-client.ts`
- `src/shared/api/http-client.ts`

## Project structure

```text
frontend/
  src/
    app/                    # shell, pages, presenters
    components/ui/          # reusable UI primitives
    features/
      earthquakes/          # earthquake types, mapping, API access
      weather/              # weather types and API access
      map/                  # map container and layer rendering
    shared/
      api/                  # query keys/client and HTTP helper
```

## Docker (optional)

From repository root:

```bash
docker compose up frontend --build
```
