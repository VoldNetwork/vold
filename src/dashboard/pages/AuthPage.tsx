import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { AuthForm } from '@shared/components/AuthForm'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'

export function DashboardAuthPage() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 text-white flex-col justify-center px-16">
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl mb-6">
          V
        </div>
        <h1 className="text-4xl font-bold">Vold Dashboard</h1>
        <p className="text-primary-100 mt-3 text-lg max-w-md">
          Manage your events, track volunteers, and grow your impact with the Vold organiser platform.
        </p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 lg:px-16">
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 text-white font-bold text-xl mb-4">
            V
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vold Dashboard</h1>
        </div>
        <AuthForm defaultRole="organiser" />
      </div>
    </div>
  )
}
