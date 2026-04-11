import { type EarthquakeEvent } from '@/features/earthquakes/model/earthquake.types'

export type DashboardIncident = {
  id: string
  location: string
  type: 'Earthquake'
  severity: 'low' | 'medium' | 'high'
  magnitude: string
  updatedAt: string
}

function getSeverity(magnitude: number): 'low' | 'medium' | 'high' {
  if (magnitude >= 5) return 'high'
  if (magnitude >= 4) return 'medium'
  return 'low'
}

export function toDashboardIncidents(events: EarthquakeEvent[]): DashboardIncident[] {
  return events.map((event) => ({
    id: event.id,
    location: event.place,
    type: 'Earthquake',
    severity: getSeverity(event.magnitude),
    magnitude: `M ${event.magnitude.toFixed(1)}`,
    updatedAt: new Date(event.occurredAt).toLocaleString(),
  }))
}
