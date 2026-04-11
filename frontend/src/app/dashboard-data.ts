import { Activity, MapPinned, ShieldAlert, TrendingUp } from 'lucide-react'

export const dashboardMetrics = [
  {
    title: 'Active stations',
    value: '--',
    delta: 'Pending',
    description: 'waiting for API',
    icon: Activity,
  },
  {
    title: 'Critical alerts',
    value: '--',
    delta: 'Pending',
    description: 'waiting for API',
    icon: ShieldAlert,
  },
  {
    title: 'Avg response time',
    value: '--',
    delta: 'Pending',
    description: 'waiting for API',
    icon: TrendingUp,
  },
  {
    title: 'Layer sync status',
    value: '--',
    delta: 'Pending',
    description: 'waiting for API',
    icon: MapPinned,
  },
] as const

export const incidents: Array<{
  id: string
  location: string
  type: string
  severity: 'low' | 'medium' | 'high'
  magnitude: string
  updatedAt: string
}> = []

export const activityFeed: Array<{ name: string; action: string; time: string }> = []

export type DashboardPageId = 'overview' | 'map' | 'alerts' | 'analytics'

export function getSeverityVariant(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') {
    return 'destructive'
  }
  return 'secondary'
}
