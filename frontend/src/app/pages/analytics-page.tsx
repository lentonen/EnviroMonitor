import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { activityFeed } from '@/app/dashboard-data'

export function AnalyticsPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Operations health</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Operator activity</CardTitle>
          <CardDescription>Who changed what in the last hour.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-4">
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
                      <p className="text-xs text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}
