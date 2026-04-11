import { useQuery } from '@tanstack/react-query'
import { earthquakesQueryOptions } from '@/features/earthquakes/api/fetch-earthquakes'
import { type EarthquakeFeedMeta } from '@/features/earthquakes/model/earthquake.types'
import { weatherQueryOptions } from '@/features/weather/api/fetch-weather'
import { type WeatherFeedMeta } from '@/features/weather/model/weather.types'
import { MapView } from './map-view'

const earthquakeFeedMeta: EarthquakeFeedMeta = {
  provider: 'USGS',
  cadence: 'real-time',
}

const weatherFeedMeta: WeatherFeedMeta = {
  provider: 'NOAA',
  cadence: 'near real-time',
}

type MapPanelProps = {
  focusedIncidentId?: string | null
}

export default function MapPanel({ focusedIncidentId }: MapPanelProps) {
  const earthquakesQuery = useQuery(earthquakesQueryOptions)
  const weatherQuery = useQuery(weatherQueryOptions)

  const earthquakes = earthquakesQuery.data ?? []
  const weatherObservations = weatherQuery.data ?? []

  return (
    <div id="overview-map-panel" className="grid h-full min-h-[580px] grid-rows-[auto_1fr] gap-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-card-foreground">Live environmental map</h2>
        <p className="text-sm text-muted-foreground">
          Earthquakes ({earthquakeFeedMeta.provider}) and weather ({weatherFeedMeta.provider})
          layers. Loaded {earthquakes.length} earthquakes and {weatherObservations.length} weather points.
        </p>
        {earthquakesQuery.isError ? (
          <p className="mt-2 text-sm text-destructive">Earthquake feed error. Check API response format.</p>
        ) : null}
      </div>
      <MapView
        earthquakes={earthquakes}
        weatherObservations={weatherObservations}
        focusedIncidentId={focusedIncidentId}
      />
    </div>
  )
}
