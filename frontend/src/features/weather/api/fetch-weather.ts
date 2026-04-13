import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-client'
import { type WeatherObservation } from '@/features/weather/model/weather.types'

const mockWeatherObservations: WeatherObservation[] = [
  {
    stationId: 'wx-sfo',
    observedAt: new Date(1775725954000).toISOString(),
    temperatureC: 14,
    windSpeedMs: 7,
    humidityPercent: 73,
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  },
  {
    stationId: 'wx-sea',
    observedAt: new Date(1775726554000).toISOString(),
    temperatureC: 10,
    windSpeedMs: 6,
    humidityPercent: 81,
    coordinates: {
      latitude: 47.6062,
      longitude: -122.3321,
    },
  },
]

export async function fetchWeather(): Promise<WeatherObservation[]> {
  return mockWeatherObservations
}

export const weatherQueryOptions = queryOptions({
  queryKey: queryKeys.weather.stations('us'),
  queryFn: fetchWeather,
})
