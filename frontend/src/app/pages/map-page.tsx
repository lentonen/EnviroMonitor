import { lazy, Suspense } from 'react'
import { LoaderCircle, MapPinned } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { incidents } from '@/app/dashboard-data'

const MapPanel = lazy(() => import('@/features/map/components/map-panel'))

function MapLoadingFallback() {
  return (
    <div className="flex h-full min-h-[540px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  )
}

export function MapPage() {
  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinned className="size-4" />
            Live geospatial view
          </CardTitle>
          <CardDescription>Detailed map for event monitoring and regional drill-down.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<MapLoadingFallback />}>
            <MapPanel />
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Map-linked incidents</CardTitle>
          <CardDescription>Recent events currently represented on map layers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{incident.id}</p>
              <p className="text-sm text-muted-foreground">
                {incident.location} - {incident.magnitude}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
