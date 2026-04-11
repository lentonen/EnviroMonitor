export type EarthquakeEvent = {
  id: string
  magnitude: number
  place: string
  occurredAt: string
  coordinates: {
    latitude: number
    longitude: number
    depthKm: number
  }
}

export type EarthquakeFeedMeta = {
  provider: 'USGS'
  cadence: 'real-time'
}
