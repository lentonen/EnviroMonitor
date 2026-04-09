import { queryOptions } from '@tanstack/react-query'
import { queryKeys } from '@/shared/api/query-client'
import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'
import { mapUsgsGeoJsonToEarthquakeEvents } from '@/features/earthquakes/api/map-usgs-geojson'
import { type UsgsEarthquakeGeoJson } from '@/features/earthquakes/model/usgs-geojson.types'
import { getJson } from '@/shared/api/http-client'

function hasValidFeatureShape(feature: unknown): boolean {
  if (!feature || typeof feature !== 'object') {
    return false
  }

  const candidate = feature as {
    id?: unknown
    properties?: { time?: unknown }
    geometry?: { coordinates?: unknown }
  }

  if (typeof candidate.id !== 'string' || typeof candidate.properties?.time !== 'number') {
    return false
  }

  if (!Array.isArray(candidate.geometry?.coordinates) || candidate.geometry.coordinates.length < 3) {
    return false
  }

  return candidate.geometry.coordinates.slice(0, 3).every((value) => typeof value === 'number')
}

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  try {
    const payload = await getJson<UsgsEarthquakeGeoJson>('/api/earthquakes/usgs')
    const sanitizedPayload: UsgsEarthquakeGeoJson = {
      ...payload,
      features: payload.features.filter(hasValidFeatureShape),
    }
    return mapUsgsGeoJsonToEarthquakeEvents(sanitizedPayload)
  } catch {
    return []
  }
}

export const earthquakesQueryOptions = queryOptions({
  queryKey: queryKeys.earthquakes.feed('usgs'),
  queryFn: fetchEarthquakes,
})
