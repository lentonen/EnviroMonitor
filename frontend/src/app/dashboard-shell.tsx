import { lazy, Suspense, useEffect } from 'react'
import { BellRing, Menu, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

const OverviewPage = lazy(() =>
  import('@/app/pages/overview-page').then((module) => ({ default: module.OverviewPage })),
)

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
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/')
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
              <Radar className="size-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">EnviroMonitor</h1>
              <p className="text-sm text-muted-foreground">Real live feed dashboard</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
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
              Notifications
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" className="sm:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-[22rem] p-0 sm:hidden">
              <SheetHeader className="border-b border-border px-4 py-4">
                <SheetTitle>Dashboard menu</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 p-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Time range</p>
                  <Select defaultValue="24h">
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="h-11 w-full justify-start px-4">
                    Configure feeds
                  </Button>
                  <Button className="h-11 w-full justify-start px-4">
                    <BellRing className="mr-2 size-4" />
                    Notifications
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <section className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <Suspense fallback={<PageLoadingState />}>
          <OverviewPage />
        </Suspense>
      </section>
    </div>
  )
}
