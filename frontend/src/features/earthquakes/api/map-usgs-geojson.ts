import {
  type UsgsEarthquakeFeature,
  type UsgsEarthquakeGeoJson,
} from '@/features/earthquakes/model/usgs-geojson.types'
import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'

function toIsoTimestamp(epochMs: number): string {
  return new Date(epochMs).toISOString()
}

function mapFeatureToEvent(feature: UsgsEarthquakeFeature): EarthquakeEvent {
  const [longitude, latitude, depthKm] = feature.geometry.coordinates

  return {
    id: feature.id,
    magnitude: feature.properties.mag ?? 0,
    place: feature.properties.place ?? 'Unknown location',
    occurredAt: toIsoTimestamp(feature.properties.time),
    coordinates: {
      latitude,
      longitude,
      depthKm,
    },
  }
}

export function mapUsgsGeoJsonToEarthquakeEvents(payload: UsgsEarthquakeGeoJson): EarthquakeEvent[] {
  return payload.features.map(mapFeatureToEvent)
}
