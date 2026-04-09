import { queryOptions } from '@tanstack/react-query'
import { getJson } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-client'
import { type WeatherObservation } from '@/features/weather/model/weather.types'

const weatherFeedUrl = '/api/weather/noaa'

export async function fetchWeather(): Promise<WeatherObservation[]> {
  return getJson<WeatherObservation[]>(weatherFeedUrl)
}

export const weatherQueryOptions = queryOptions({
  queryKey: queryKeys.weather.stations('us'),
  queryFn: fetchWeather,
})
