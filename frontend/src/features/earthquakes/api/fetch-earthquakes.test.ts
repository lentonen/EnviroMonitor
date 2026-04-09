import { describe, expect, it } from 'vitest'
import { fetchEarthquakes } from '@/features/earthquakes/api/fetch-earthquakes'
import { realShapedUsgsFixture } from '@/features/earthquakes/api/usgs-earthquakes.fixture'

describe('fetchEarthquakes integration', () => {
  it('maps fixture payload to earthquake events', async () => {
    const result = await fetchEarthquakes()

    expect(result).toHaveLength(realShapedUsgsFixture.features.length)
    expect(result[0]).toMatchObject({
      id: 'usabc123',
      magnitude: 4.8,
      place: 'Near San Francisco, CA',
      coordinates: {
        latitude: 37.8,
        longitude: -122.4,
        depthKm: 5.1,
      },
    })
    expect(result[1]).toMatchObject({
      id: 'usdef456',
      magnitude: 5.2,
      place: 'Near Seattle, WA',
      coordinates: {
        latitude: 47.61,
        longitude: -122.33,
        depthKm: 42.2,
      },
    })

    expect(Date.parse(result[0].occurredAt)).not.toBeNaN()
    expect(Date.parse(result[1].occurredAt)).not.toBeNaN()
  })
})
