import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@shared/hooks/useAuth'
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner'
import type { UserRole } from '@shared/types/database'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // If a specific role is required, check it
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
