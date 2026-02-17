import { useEffect, useState } from 'react'
import { supabase } from '@shared/lib/supabase'
import { useAuth } from '@shared/hooks/useAuth'
import { StatCard } from '@shared/components/ui/StatCard'
import { Card } from '@shared/components/ui/Card'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import { Button } from '@shared/components/ui/Button'
import { Calendar, Users, Coins, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Event } from '@shared/types/database'

export function DashboardHome() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({ totalEvents: 0, totalVolunteers: 0, tokensAwarded: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    // Fetch organiser's events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .eq('organiser_id', user!.id)
      .order('date', { ascending: false })
      .limit(5)

    if (eventsData) {
      const typedEvents = eventsData as unknown as Event[]
      setEvents(typedEvents)

      // Calculate stats
      const totalSpotsFilled = typedEvents.reduce((sum: number, e: Event) => sum + (e.spots_filled || 0), 0)
      const totalTokens = typedEvents.reduce((sum: number, e: Event) => sum + (e.tokens_reward * (e.spots_filled || 0)), 0)

      setStats({
        totalEvents: eventsData.length,
        totalVolunteers: totalSpotsFilled,
        tokensAwarded: totalTokens,
      })
    }

    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Events"
          value={stats.totalEvents}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Total Volunteers"
          value={stats.totalVolunteers}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Tokens Awarded"
          value={stats.tokensAwarded}
          icon={<Coins className="h-5 w-5" />}
        />
      </div>

      {/* Recent events */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <Link to="/events/new">
            <Button size="sm" icon={<Plus className="h-4 w-4" />}>
              New event
            </Button>
          </Link>
        </div>

        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title="No events created"
            description="Create your first event and start recruiting volunteers."
            action={
              <Link to="/events/new">
                <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />}>
                  Create event
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Event</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Volunteers</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium text-gray-900">{event.title}</td>
                    <td className="py-3 px-2 text-gray-600">
                      {new Date(event.date).toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 text-gray-600">{event.spots_filled}/{event.spots_total}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.status === 'published' ? 'bg-green-100 text-green-700' :
                        event.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                        event.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
