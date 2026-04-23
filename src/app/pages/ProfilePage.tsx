import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Avatar } from '@shared/components/ui/Avatar'
import { StatCard } from '@shared/components/ui/StatCard'
import { LogOut, Coins, Clock, CalendarCheck, Star } from 'lucide-react'

export function ProfilePage() {
  const { profile, signOut } = useAuth()

  if (!profile) return null

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
      {/* Profile header */}
      <Card padding="lg" className="text-center">
        <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" className="mx-auto" />
        <h1 className="mt-3 text-xl font-bold text-gray-900">{profile.full_name}</h1>
        <p className="text-sm text-gray-500">{profile.email}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
        )}
        {profile.location && (
          <p className="text-sm text-gray-500 mt-1">{profile.location}</p>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="$VOLD"
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

      {/* Member since */}
      <Card padding="md">
        <p className="text-sm text-gray-500">
          Member since{' '}
          <span className="font-medium text-gray-900">
            {new Date(profile.created_at).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
          </span>
        </p>
      </Card>

      {/* Sign out */}
      <Button
        variant="outline"
        fullWidth
        icon={<LogOut className="h-4 w-4" />}
        onClick={signOut}
      >
        Sign out
      </Button>
    </div>
  )
}
