import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchEarthquakes } from '@/features/earthquakes/api/fetch-earthquakes'
import { realShapedUsgsFixture } from '@/features/earthquakes/api/usgs-earthquakes.fixture'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchEarthquakes integration', () => {
  it('maps real-shaped USGS payload to earthquake events', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => realShapedUsgsFixture,
    })

    vi.stubGlobal(
      'fetch',
      fetchMock,
    )

    const result = await fetchEarthquakes()

    expect(fetchMock).toHaveBeenCalledWith('/api/earthquakes/usgs', { headers: undefined })
    expect(result).toHaveLength(2)
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

  it('returns empty array for non-ok http responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )

    const result = await fetchEarthquakes()

    expect(result).toEqual([])
  })

  it('returns empty array when API request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')))

    const result = await fetchEarthquakes()

    expect(result).toEqual([])
  })

  it('skips malformed features instead of crashing whole feed', async () => {
    const payloadWithMalformedFeature = {
      ...realShapedUsgsFixture,
      features: [
        realShapedUsgsFixture.features[0],
        {
          ...realShapedUsgsFixture.features[1],
          geometry: {
            type: 'Point',
            coordinates: [-122.33, 47.61] as unknown as [number, number, number],
          },
        },
      ],
    }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => payloadWithMalformedFeature,
      }),
    )

    const result = await fetchEarthquakes()

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('usabc123')
  })
})
