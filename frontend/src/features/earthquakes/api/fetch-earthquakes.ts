import { queryOptions } from '@tanstack/react-query'
import { getJson } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-client'
import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'

const usgsFeedUrl = '/api/earthquakes/usgs'

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  return getJson<EarthquakeEvent[]>(usgsFeedUrl)
}

export const earthquakesQueryOptions = queryOptions({
  queryKey: queryKeys.earthquakes.feed('usgs'),
  queryFn: fetchEarthquakes,
})
