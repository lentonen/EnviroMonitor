import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSeverityVariant, incidents } from '@/app/dashboard-data'

export function AlertsPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="size-4" />
          Alert queue
        </h2>
        <p className="text-sm text-muted-foreground">
          Prioritized active alerts that require operator actions.
        </p>
      </div>
      <div className="space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium">{incident.id}</p>
              <p className="text-sm text-muted-foreground">{incident.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getSeverityVariant(incident.severity)}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{incident.type}</Badge>
              <span className="text-sm text-muted-foreground">{incident.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
