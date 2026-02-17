import { useAuth } from '@shared/hooks/useAuth'
import { Card } from '@shared/components/ui/Card'
import { Avatar } from '@shared/components/ui/Avatar'
import { Button } from '@shared/components/ui/Button'
import { LogOut } from 'lucide-react'

export function SettingsPage() {
  const { profile, signOut } = useAuth()

  if (!profile) return null

  return (
    <div className="max-w-2xl space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" />
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile.full_name}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              Joined {new Date(profile.created_at).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <Button
          variant="outline"
          icon={<LogOut className="h-4 w-4" />}
          onClick={signOut}
        >
          Sign out
        </Button>
      </Card>
    </div>
  )
}
