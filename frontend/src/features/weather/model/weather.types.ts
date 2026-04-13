export type WeatherObservation = {
  stationId: string
  observedAt: string
  temperatureC: number
  windSpeedMs: number
  humidityPercent: number
  coordinates: {
    latitude: number
    longitude: number
  }
}

export type WeatherFeedMeta = {
  provider: 'NOAA'
  cadence: 'near real-time'
}
