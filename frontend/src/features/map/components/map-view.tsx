import { MapContainer, TileLayer } from 'react-leaflet'

const usaCenter: [number, number] = [39.8283, -98.5795]

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
      </MapContainer>
    </div>
  )
}
