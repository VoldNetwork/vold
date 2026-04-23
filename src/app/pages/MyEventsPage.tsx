import { useEffect, useState } from 'react'
import { supabase } from '@shared/lib/supabase'
import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import { Button } from '@shared/components/ui/Button'
import { Calendar, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Registration } from '@shared/types/database'

const statusVariant = {
  registered: 'primary' as const,
  confirmed: 'secondary' as const,
  attended: 'success' as const,
  no_show: 'danger' as const,
  cancelled: 'neutral' as const,
}

export function MyEventsPage() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadRegistrations()
  }, [user])

  const loadRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*, event:events(id, title, date, start_time, end_time, location, category, status)')
      .eq('volunteer_id', user!.id)
      .order('registered_at', { ascending: false })

    if (!error && data) {
      setRegistrations(data as unknown as Registration[])
    }
    setLoading(false)
  }

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Events</h1>

      {loading ? (
        <LoadingSpinner />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No events yet"
          description="Sign up for events to start volunteering and earning $VOLD."
          action={
            <Link to="/discover">
              <Button variant="primary" size="sm" icon={<Search className="h-4 w-4" />}>
                Find events
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {registrations.map((reg) => (
            <Link to={`/events/${reg.event_id}`} key={reg.id}>
              <Card hoverable>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {reg.event?.title}
                    </h3>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{reg.event?.date && new Date(reg.event.date).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{reg.event?.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusVariant[reg.status]} size="sm">
                    {reg.status}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
