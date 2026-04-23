import { useEffect, useState } from 'react'
import { supabase } from '@shared/lib/supabase'
import { Card } from '@shared/components/ui/Card'
import { Badge } from '@shared/components/ui/Badge'
import { Input } from '@shared/components/ui/Input'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import { Search, MapPin, Calendar, Coins, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Event } from '@shared/types/database'

export function DiscoverPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*, organisation:organisations(name, logo_url)')
      .eq('status', 'published')
      .order('date', { ascending: true })

    if (!error && data) {
      setEvents(data as unknown as Event[])
    }
    setLoading(false)
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase()) ||
    event.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Discover</h1>

      <Input
        placeholder="Search events, locations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      {loading ? (
        <LoadingSpinner />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title="No events found"
          description={search ? 'Try adjusting your search terms.' : 'No published events yet. Check back soon!'}
        />
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Link to={`/events/${event.id}`} key={event.id}>
              <Card hoverable padding="none" className="overflow-hidden">
                {event.image_url && (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Badge variant="primary" size="sm" className="mb-2">
                        {event.category}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {event.title}
                      </h3>
                    </div>
                    <Badge variant="accent" size="sm">
                      <Coins className="h-3 w-3" />
                      {event.tokens_reward} $VOLD
                    </Badge>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(event.date).toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-gray-300">|</span>
                      <span>{event.start_time} – {event.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.spots_filled}/{event.spots_total} spots filled</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
