import { lazy, Suspense } from 'react'
import {
  Activity,
  AlertTriangle,
  BellRing,
  Clock3,
  LoaderCircle,
  MapPinned,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MapPanel = lazy(() => import('@/features/map/components/map-panel'))

const dashboardMetrics = [
  {
    title: 'Active stations',
    value: '124',
    delta: '+7.4%',
    description: 'vs previous 24h',
    icon: Activity,
  },
  {
    title: 'Critical alerts',
    value: '9',
    delta: '+2',
    description: 'opened this hour',
    icon: ShieldAlert,
  },
  {
    title: 'Avg response time',
    value: '4m 12s',
    delta: '-18%',
    description: 'incident acknowledgment',
    icon: TrendingUp,
  },
  {
    title: 'Layer sync status',
    value: '98.6%',
    delta: 'Healthy',
    description: 'global ingestion pipeline',
    icon: MapPinned,
  },
] as const

const incidents = [
  {
    id: 'EQ-2041',
    location: 'Reykjanes Ridge, IS',
    type: 'Earthquake',
    severity: 'high',
    magnitude: 'M 5.7',
    updatedAt: '2 min ago',
  },
  {
    id: 'WX-1103',
    location: 'Pori, FI',
    type: 'Weather',
    severity: 'medium',
    magnitude: 'Storm warning',
    updatedAt: '7 min ago',
  },
  {
    id: 'EQ-2037',
    location: 'Aegean Sea, GR',
    type: 'Earthquake',
    severity: 'medium',
    magnitude: 'M 4.9',
    updatedAt: '12 min ago',
  },
  {
    id: 'WX-1094',
    location: 'Bergen, NO',
    type: 'Weather',
    severity: 'low',
    magnitude: 'Heavy rain',
    updatedAt: '20 min ago',
  },
] as const

const activityFeed = [
  { name: 'A. Nyman', action: 'Escalated EQ-2041 to regional lead', time: '3 min ago' },
  { name: 'L. Jordan', action: 'Validated wind-feed latency recovery', time: '9 min ago' },
  { name: 'M. Rossi', action: 'Closed duplicate alert WX-1088', time: '14 min ago' },
  { name: 'S. Kim', action: 'Updated public bulletin template', time: '22 min ago' },
  { name: 'D. Singh', action: 'Acknowledged seismic threshold breach', time: '31 min ago' },
] as const

function getSeverityVariant(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') {
    return 'destructive'
  }
  return 'secondary'
}

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

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">EnviroMonitor</h1>
            <p className="text-sm text-muted-foreground">Environmental monitoring command center</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="24h">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6h">Last 6 hours</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Configure feeds
            </Button>
            <Button size="sm">
              <BellRing className="mr-2 size-4" />
              Create alert
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-[1400px] gap-6 px-6 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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

          <Tabs defaultValue="map" className="w-full">
            <TabsList>
              <TabsTrigger value="map">Live Map</TabsTrigger>
              <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-4">
              <Suspense fallback={<MapLoadingFallback />}>
                <MapPanel />
              </Suspense>
            </TabsContent>
            <TabsContent value="alerts" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="size-4" />
                    Prioritized alerts
                  </CardTitle>
                  <CardDescription>Team-facing alert queue sorted by impact and freshness.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operations health</CardTitle>
              <CardDescription>Realtime service uptime and processing quality.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Event ingestion</span>
                  <span className="text-muted-foreground">99%</span>
                </div>
                <Progress value={99} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Map tile responsiveness</span>
                  <span className="text-muted-foreground">94%</span>
                </div>
                <Progress value={94} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Alert dispatch</span>
                  <span className="text-muted-foreground">97%</span>
                </div>
                <Progress value={97} />
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[360px]">
            <CardHeader>
              <CardTitle className="text-base">Operator activity</CardTitle>
              <CardDescription>Who changed what in the last hour.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[270px] pr-4">
                <div className="space-y-4">
                  {activityFeed.map((event) => (
                    <div key={`${event.name}-${event.time}`} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{event.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">{event.action}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5" />
                            {event.time}
                          </p>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
