import { lazy, Suspense } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dashboardMetrics, getSeverityVariant, incidents } from '@/app/dashboard-data'

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

export function OverviewPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="space-y-2 pb-3">
              <CardDescription className="flex items-center justify-between">
                <span>{metric.title}</span>
                <metric.icon className="size-4" />
              </CardDescription>
              <CardTitle className="text-2xl">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{metric.delta}</span> {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Suspense fallback={<MapLoadingFallback />}>
        <MapPanel />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Latest incidents</CardTitle>
          <CardDescription>Unified event stream across weather and seismic providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Magnitude / Context</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.id}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityVariant(incident.severity)}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{incident.magnitude}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{incident.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
