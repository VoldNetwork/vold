import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@shared/components/ui/Card'
import { StatCard } from '@shared/components/ui/StatCard'
import { Button } from '@shared/components/ui/Button'
import { EmptyState } from '@shared/components/ui/EmptyState'
import { Avatar } from '@shared/components/ui/Avatar'
import { Coins, Clock, Star, Search, CalendarCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const { profile } = useAuth()

  if (!profile) return null

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      {/* Welcome header */}
      <div className="flex items-center gap-3">
        <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
        <div>
          <p className="text-sm text-gray-500">Welcome back</p>
          <h1 className="text-xl font-bold text-gray-900">
            {profile.full_name.split(' ')[0]}
          </h1>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Tokens"
          value={profile.tokens}
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          label="Hours"
          value={profile.hours_volunteered}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Events"
          value={profile.events_attended}
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Reputation"
          value={profile.reputation_score}
          icon={<Star className="h-5 w-5" />}
        />
      </div>

      {/* Quick actions */}
      <Card padding="md">
        <h2 className="font-semibold text-gray-900 mb-3">Quick actions</h2>
        <div className="flex gap-3">
          <Link to="/discover" className="flex-1">
            <Button variant="primary" fullWidth icon={<Search className="h-4 w-4" />}>
              Find events
            </Button>
          </Link>
          <Link to="/my-events" className="flex-1">
            <Button variant="outline" fullWidth icon={<CalendarCheck className="h-4 w-4" />}>
              My events
            </Button>
          </Link>
        </div>
      </Card>

      {/* Upcoming events placeholder */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Upcoming events</h2>
        <EmptyState
          icon={<CalendarCheck className="h-12 w-12" />}
          title="No upcoming events"
          description="Browse and sign up for volunteering events near you."
          action={
            <Link to="/discover">
              <Button variant="secondary" size="sm">
                Discover events
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  )
}
