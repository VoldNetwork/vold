import { EmptyState } from '@shared/components/ui/EmptyState'
import { BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  return (
    <EmptyState
      icon={<BarChart3 className="h-12 w-12" />}
      title="Analytics"
      description="Analytics dashboard coming in Phase 5. Track event performance, volunteer engagement, and $VOLD distribution."
    />
  )
}
