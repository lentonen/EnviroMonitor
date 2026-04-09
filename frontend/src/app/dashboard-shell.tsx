import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  ChartNoAxesCombined,
  Gauge,
  Radar,
  Siren,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { type DashboardPageId } from '@/app/dashboard-data'

const OverviewPage = lazy(() =>
  import('@/app/pages/overview-page').then((module) => ({ default: module.OverviewPage })),
)
const MapPage = lazy(() =>
  import('@/app/pages/map-page').then((module) => ({ default: module.MapPage })),
)
const AlertsPage = lazy(() =>
  import('@/app/pages/alerts-page').then((module) => ({ default: module.AlertsPage })),
)
const AnalyticsPage = lazy(() =>
  import('@/app/pages/analytics-page').then((module) => ({ default: module.AnalyticsPage })),
)

const primaryNavItems: ReadonlyArray<{ id: DashboardPageId; label: string; icon: LucideIcon }> = [
  { id: 'map', label: 'Live map', icon: Radar },
  { id: 'alerts', label: 'Alerts', icon: Siren },
  { id: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
] as const

function getPageTitle(page: DashboardPageId) {
  if (page === 'map') return 'Map'
  if (page === 'alerts') return 'Alerts'
  if (page === 'analytics') return 'Analytics'
  return 'Overview'
}

function getPageFromPath(pathname: string): DashboardPageId {
  if (pathname === '/map') return 'map'
  if (pathname === '/alerts') return 'alerts'
  if (pathname === '/analytics') return 'analytics'
  return 'overview'
}

function getPathFromPage(page: DashboardPageId): string {
  if (page === 'map') return '/map'
  if (page === 'alerts') return '/alerts'
  if (page === 'analytics') return '/analytics'
  return '/'
}

function PageLoadingState() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <Skeleton className="h-[420px] w-full rounded-xl" />
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </section>
  )
}

export function DashboardShell() {
  const [activePage, setActivePage] = useState<DashboardPageId>(() =>
    getPageFromPath(window.location.pathname),
  )
  const activeTitle = useMemo(() => getPageTitle(activePage), [activePage])

  useEffect(() => {
    const onPopState = () => {
      setActivePage(getPageFromPath(window.location.pathname))
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigateToPage = (page: DashboardPageId) => {
    const nextPath = getPathFromPage(page)
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }
    setActivePage(page)
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="px-3 py-4">
          <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <div className="rounded-md bg-sidebar-primary p-1.5 text-sidebar-primary-foreground">
              <Radar className="size-4" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-semibold">EnviroMonitor</p>
              <p className="text-xs text-sidebar-foreground/70">Control center</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="pt-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === 'overview'}
                    onClick={() => navigateToPage('overview')}
                  >
                    <Gauge />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryNavItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={item.id === activePage}
                      onClick={() => navigateToPage(item.id)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-3 pb-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit max-w-[170px] justify-start gap-2 self-start px-2.5 group-data-[collapsible=icon]:size-7 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <BellRing className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Notification settings</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">EnviroMonitor</h1>
                <p className="text-sm text-muted-foreground">
                  {activeTitle} page - environmental monitoring command center
                </p>
              </div>
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
        <section className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
          <Suspense fallback={<PageLoadingState />}>
            {activePage === 'overview' && <OverviewPage />}
            {activePage === 'map' && <MapPage />}
            {activePage === 'alerts' && <AlertsPage />}
            {activePage === 'analytics' && <AnalyticsPage />}
          </Suspense>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
