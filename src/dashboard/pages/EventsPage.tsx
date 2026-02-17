import { EmptyState } from '@shared/components/ui/EmptyState'
import { Calendar } from 'lucide-react'

export function EventsPage() {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12" />}
      title="Events Management"
      description="Full event management coming in Phase 3. Create, edit, and manage all your volunteering events."
    />
  )
}
