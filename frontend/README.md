# EnviroMonitor Frontend

Frontend foundation for EnviroMonitor dashboards.

## Stack

- React 19
- TypeScript + Vite
- shadcn/ui + Tailwind CSS v4
- Leaflet + react-leaflet
- TanStack Query

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Build

```bash
pnpm build
```

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
pnpm test:e2e
```

## Docker

From repository root:

```bash
docker compose up frontend --build
```

## Project structure

- `src/app`: app shell and providers
- `src/features/map`: map rendering
- `src/features/earthquakes`: earthquake domain and API placeholders
- `src/features/weather`: weather domain and API placeholders
- `src/shared/api`: query client and HTTP helper

## API integration starting points

- `src/features/earthquakes/api/fetch-earthquakes.ts`
- `src/features/weather/api/fetch-weather.ts`
- `src/shared/api/query-client.ts`
