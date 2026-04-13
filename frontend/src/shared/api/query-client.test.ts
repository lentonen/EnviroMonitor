import { describe, expect, it } from 'vitest'
import { queryKeys } from '@/shared/api/query-client'

describe('queryKeys', () => {
  it('builds earthquake feed keys', () => {
    expect(queryKeys.earthquakes.feed('usgs')).toEqual(['earthquakes', 'usgs'])
  })

  it('builds weather station keys', () => {
    expect(queryKeys.weather.stations('us')).toEqual(['weather', 'us'])
  })
})
