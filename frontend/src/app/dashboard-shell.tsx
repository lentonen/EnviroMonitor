import { lazy, Suspense } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">EnviroMonitor</h1>
            <p className="text-sm text-muted-foreground">
              Earthquake and weather observability dashboard foundation
            </p>
          </div>
          <Button variant="outline" className="font-medium">
            Data sources
          </Button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 px-6 py-8">
        <section className="flex w-full flex-col gap-4">
          <Suspense fallback={<MapLoadingFallback />}>
            <MapPanel />
          </Suspense>
        </section>
      </main>
    </div>
  )
}
