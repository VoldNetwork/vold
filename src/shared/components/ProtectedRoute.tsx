import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import { Button } from '@shared/components/ui/Button'
import { Card } from '@shared/components/ui/Card'
import { LogOut } from 'lucide-react'
import type { UserRole } from '@shared/types/database'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading, signOut } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // If a specific role is required and user has the wrong role, show a helpful message
  if (requiredRole && profile?.role && profile.role !== requiredRole) {
    const isOnApp = requiredRole === 'volunteer'
    const isDev = window.location.hostname === 'localhost'
    const correctUrl = isOnApp
      ? (isDev ? 'http://localhost:5174' : 'https://dashboard.vold.network')
      : (isDev ? 'http://localhost:5173' : 'https://app.vold.network')
    const correctLabel = isOnApp ? 'Organiser Dashboard' : 'Volunteer App'
    const currentRoleLabel = profile.role === 'organiser' ? 'an organiser' : 'a volunteer'

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card padding="lg" className="max-w-md text-center">
          <div className="text-4xl mb-4">
            {isOnApp ? '📋' : '🙋'}
          </div>
          <h2 className="text-xl font-bold text-gray-900">Wrong platform</h2>
          <p className="text-gray-500 mt-2">
            You're signed in as <strong>{currentRoleLabel}</strong>. This platform is for{' '}
            <strong>{requiredRole}s</strong>.
          </p>
          <div className="mt-6 space-y-3">
            <a href={correctUrl} className="block">
              <Button variant="primary" fullWidth>
                Go to {correctLabel}
              </Button>
            </a>
            <Button
              variant="ghost"
              fullWidth
              icon={<LogOut className="h-4 w-4" />}
              onClick={signOut}
            >
              Sign out &amp; switch account
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
