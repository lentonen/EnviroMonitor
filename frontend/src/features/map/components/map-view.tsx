import L from 'leaflet'
import { type RefObject, useEffect, useRef } from 'react'
import {
  CircleMarker,
  GeoJSON,
  LayersControl,
  MapContainer,
  Popup,
  ScaleControl,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'
import { type WeatherObservation } from '@/features/weather/model/weather.types'

const usaCenter: [number, number] = [39.8283, -98.5795]

type MapViewProps = {
  earthquakes: EarthquakeEvent[]
  weatherObservations: WeatherObservation[]
  focusedIncidentId?: string | null
}

type EarthquakeGeoJsonFeature = {
  type: 'Feature'
  properties: {
    id: string
    place: string
    magnitude: number
    depthKm: number
    popupContent: string
  }
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
}

type EarthquakeGeoJsonFeatureCollection = {
  type: 'FeatureCollection'
  features: EarthquakeGeoJsonFeature[]
}

type FocusedIncidentControllerProps = {
  focusedEvent: EarthquakeEvent | null
  geoJsonLayerRef: RefObject<L.GeoJSON | null>
}

function FocusedIncidentController({ focusedEvent, geoJsonLayerRef }: FocusedIncidentControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (!focusedEvent) {
      return
    }

    const targetCenter: L.LatLngExpression = [focusedEvent.coordinates.latitude, focusedEvent.coordinates.longitude]
    map.flyTo(targetCenter, Math.max(map.getZoom(), 6), { duration: 0.8 })

    const geoJsonLayer = geoJsonLayerRef.current
    if (!geoJsonLayer) {
      return
    }

    geoJsonLayer.eachLayer((layer) => {
      const geoJsonFeature = (layer as L.Layer & { feature?: { properties?: { id?: string } } }).feature
      const featureId =
        geoJsonFeature && typeof geoJsonFeature === 'object' && geoJsonFeature.properties
          ? String(geoJsonFeature.properties.id ?? '')
          : ''

      if (featureId === focusedEvent.id && 'openPopup' in layer && typeof layer.openPopup === 'function') {
        layer.openPopup()
      }
    })
  }, [focusedEvent, geoJsonLayerRef, map])

  return null
}

export function MapView({ earthquakes, weatherObservations, focusedIncidentId }: MapViewProps) {
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null)
  const focusedEvent = focusedIncidentId ? earthquakes.find((event) => event.id === focusedIncidentId) ?? null : null
  const earthquakeGeoJson: EarthquakeGeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: earthquakes.map((event) => ({
      type: 'Feature',
      properties: {
        id: event.id,
        place: event.place,
        magnitude: event.magnitude,
        depthKm: event.coordinates.depthKm,
        popupContent: `${event.place} | M ${event.magnitude.toFixed(1)} | Depth ${event.coordinates.depthKm.toFixed(1)} km`,
      },
      geometry: {
        type: 'Point',
        coordinates: [event.coordinates.longitude, event.coordinates.latitude],
      },
    })),
  }

  return (
    <div
      className="h-full min-h-[520px] overflow-hidden rounded-xl border border-border bg-card shadow-sm"
      data-testid="map-container"
    >
      <MapContainer
        center={usaCenter}
        zoom={4}
        className="h-full w-full [&_.leaflet-control-layers]:rounded-lg [&_.leaflet-control-layers]:border-border [&_.leaflet-control-layers]:shadow-sm [&_.leaflet-control-scale]:text-xs [&_.leaflet-popup-content-wrapper]:rounded-lg [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-border [&_.leaflet-popup-content-wrapper]:shadow-md [&_.leaflet-popup-tip]:border [&_.leaflet-popup-tip]:border-border"
        scrollWheelZoom
        zoomSnap={0.25}
        zoomDelta={0.25}
        wheelDebounceTime={80}
        wheelPxPerZoomLevel={180}
        inertia={false}
        preferCanvas
      >
        <ScaleControl position="bottomleft" />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              updateWhenIdle
              keepBuffer={1}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Light map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              updateWhenIdle
              keepBuffer={1}
            />
          </LayersControl.BaseLayer>
          <LayersControl.Overlay checked name="Earthquakes">
            <GeoJSON
              ref={geoJsonLayerRef}
              key={earthquakes.length}
              data={earthquakeGeoJson}
              pointToLayer={(feature, latlng) =>
                L.circleMarker(latlng, {
                  radius: Math.max(8, ((feature.properties?.magnitude as number | undefined) ?? 0) * 2),
                  color: '#dc2626',
                  fillColor: '#ef4444',
                  fillOpacity: 0.55,
                  weight: 1.5,
                })
              }
              onEachFeature={(feature, layer) => {
            const properties = feature.properties as
              | {
                  id?: string
                  place?: string
                  magnitude?: number
                  depthKm?: number
                  popupContent?: string
                }
              | undefined

            const severityLabel =
              (properties?.magnitude ?? 0) >= 5 ? 'High' : (properties?.magnitude ?? 0) >= 4 ? 'Medium' : 'Low'

            const popupContent = `
              <div style="min-width: 220px; font-size: 0.85rem; line-height: 1.35;">
                <div style="font-weight: 700; margin-bottom: 4px;">Earthquake ${properties?.id ?? ''}</div>
                <div style="margin-bottom: 8px; color: #52525b;">${properties?.place ?? 'Unknown location'}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                  <div><span style="color: #71717a;">Magnitude:</span> ${(properties?.magnitude ?? 0).toFixed(1)}</div>
                  <div><span style="color: #71717a;">Depth:</span> ${(properties?.depthKm ?? 0).toFixed(1)} km</div>
                  <div><span style="color: #71717a;">Severity:</span> ${severityLabel}</div>
                  <div><span style="color: #71717a;">Type:</span> Earthquake</div>
                </div>
              </div>
            `
                layer.bindPopup(popupContent)
              }}
            />
          </LayersControl.Overlay>
          <FocusedIncidentController focusedEvent={focusedEvent} geoJsonLayerRef={geoJsonLayerRef} />
          <LayersControl.Overlay checked name="Weather stations">
            <>
              {weatherObservations.map((event) => (
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
            </>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  )
}
