import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@shared/hooks/useAuth'
import { ProtectedRoute } from '@shared/components/ProtectedRoute'
import { AppLayout } from '@app/layouts/AppLayout'
import { AuthPage } from '@app/pages/AuthPage'
import { HomePage } from '@app/pages/HomePage'
import { DiscoverPage } from '@app/pages/DiscoverPage'
import { MyEventsPage } from '@app/pages/MyEventsPage'
import { RewardsPage } from '@app/pages/RewardsPage'
import { ProfilePage } from '@app/pages/ProfilePage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute requiredRole="volunteer">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="my-events" element={<MyEventsPage />} />
            <Route path="rewards" element={<RewardsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
