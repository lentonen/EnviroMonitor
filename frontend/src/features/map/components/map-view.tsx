import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'
import { type WeatherObservation } from '@/features/weather/model/weather.types'

const usaCenter: [number, number] = [39.8283, -98.5795]

const mockEarthquakes: EarthquakeEvent[] = [
  {
    id: 'eq-la-001',
    magnitude: 4.6,
    place: 'Los Angeles Basin, CA',
    occurredAt: '2026-04-09T12:15:00Z',
    coordinates: {
      latitude: 34.05,
      longitude: -118.25,
      depthKm: 9.2,
    },
  },
  {
    id: 'eq-sea-002',
    magnitude: 3.9,
    place: 'Puget Sound, WA',
    occurredAt: '2026-04-09T13:04:00Z',
    coordinates: {
      latitude: 47.61,
      longitude: -122.33,
      depthKm: 14.1,
    },
  },
  {
    id: 'eq-ak-003',
    magnitude: 5.2,
    place: 'Southcentral Alaska',
    occurredAt: '2026-04-09T13:48:00Z',
    coordinates: {
      latitude: 61.2,
      longitude: -149.9,
      depthKm: 28.4,
    },
  },
]

const mockWeatherObservations: WeatherObservation[] = [
  {
    stationId: 'wx-chi',
    observedAt: '2026-04-09T13:40:00Z',
    temperatureC: 12,
    windSpeedMs: 11,
    humidityPercent: 71,
    coordinates: {
      latitude: 41.88,
      longitude: -87.63,
    },
  },
  {
    stationId: 'wx-mia',
    observedAt: '2026-04-09T13:42:00Z',
    temperatureC: 28,
    windSpeedMs: 7,
    humidityPercent: 82,
    coordinates: {
      latitude: 25.76,
      longitude: -80.19,
    },
  },
  {
    stationId: 'wx-den',
    observedAt: '2026-04-09T13:44:00Z',
    temperatureC: 9,
    windSpeedMs: 15,
    humidityPercent: 48,
    coordinates: {
      latitude: 39.74,
      longitude: -104.99,
    },
  },
]

export function MapView() {
  return (
    <div
      className="h-full min-h-[520px] overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      data-testid="map-container"
    >
      <MapContainer center={usaCenter} zoom={4} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockEarthquakes.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.coordinates.latitude, event.coordinates.longitude]}
            radius={Math.max(8, event.magnitude * 2)}
            pathOptions={{ color: '#dc2626', fillColor: '#ef4444', fillOpacity: 0.55, weight: 1.5 }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Earthquake {event.id}</p>
                <p>{event.place}</p>
                <p>Magnitude: {event.magnitude.toFixed(1)}</p>
                <p>Depth: {event.coordinates.depthKm.toFixed(1)} km</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {mockWeatherObservations.map((event) => (
          <CircleMarker
            key={event.stationId}
            center={[event.coordinates.latitude, event.coordinates.longitude]}
            radius={7}
            pathOptions={{ color: '#0369a1', fillColor: '#0ea5e9', fillOpacity: 0.55, weight: 1.5 }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Weather {event.stationId.toUpperCase()}</p>
                <p>Temp: {event.temperatureC} C</p>
                <p>Wind: {event.windSpeedMs} m/s</p>
                <p>Humidity: {event.humidityPercent}%</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
