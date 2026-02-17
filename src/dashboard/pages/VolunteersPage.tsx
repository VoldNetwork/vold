import { EmptyState } from '@shared/components/ui/EmptyState'
import { Users } from 'lucide-react'

export function VolunteersPage() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Volunteer Management"
      description="Volunteer tracking and management coming in Phase 3. View all volunteers, check-in attendance, and manage registrations."
    />
  )
}
