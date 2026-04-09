import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const queryKeys = {
  earthquakes: {
    all: ['earthquakes'] as const,
    feed: (feed: string) => [...queryKeys.earthquakes.all, feed] as const,
  },
  weather: {
    all: ['weather'] as const,
    stations: (region: string) => [...queryKeys.weather.all, region] as const,
  },
}
