import { type EarthquakeFeedMeta } from '@/features/earthquakes/model/earthquake.types'
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

export default function MapPanel() {
  return (
    <div className="grid h-full min-h-[580px] grid-rows-[auto_1fr] gap-5">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold text-card-foreground">Live environmental map</h2>
        <p className="text-sm text-muted-foreground">
          Earthquakes ({earthquakeFeedMeta.provider}) and weather ({weatherFeedMeta.provider})
          layers will stream here.
        </p>
      </div>
      <MapView />
    </div>
  )
}
