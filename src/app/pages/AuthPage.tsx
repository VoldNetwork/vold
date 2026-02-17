import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { AuthForm } from '@shared/components/AuthForm'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'

export function AuthPage() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 text-white font-bold text-xl mb-4">
          V
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Vold</h1>
        <p className="text-gray-500 mt-1">Volunteer. Earn. Grow.</p>
      </div>

      <AuthForm defaultRole="volunteer" />
    </div>
  )
}
