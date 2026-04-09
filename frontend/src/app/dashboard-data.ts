import { Activity, MapPinned, ShieldAlert, TrendingUp } from 'lucide-react'

export const dashboardMetrics = [
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

export const incidents = [
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

export const activityFeed = [
  { name: 'A. Nyman', action: 'Escalated EQ-2041 to regional lead', time: '3 min ago' },
  { name: 'L. Jordan', action: 'Validated wind-feed latency recovery', time: '9 min ago' },
  { name: 'M. Rossi', action: 'Closed duplicate alert WX-1088', time: '14 min ago' },
  { name: 'S. Kim', action: 'Updated public bulletin template', time: '22 min ago' },
  { name: 'D. Singh', action: 'Acknowledged seismic threshold breach', time: '31 min ago' },
] as const

export type DashboardPageId = 'overview' | 'map' | 'alerts' | 'analytics'

export function getSeverityVariant(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') {
    return 'destructive'
  }
  return 'secondary'
}
