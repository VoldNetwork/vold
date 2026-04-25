import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@shared/hooks/useAuth'
import { ProtectedRoute } from '@shared/components/ProtectedRoute'
import { DashboardLayout } from '@dashboard/layouts/DashboardLayout'
import { DashboardAuthPage } from '@dashboard/pages/AuthPage'
import { DashboardHome } from '@dashboard/pages/DashboardHome'
import { EventsPage } from '@dashboard/pages/EventsPage'
import { CreateEventPage } from '@dashboard/pages/CreateEventPage'
import { VolunteersPage } from '@dashboard/pages/VolunteersPage'
import { AnalyticsPage } from '@dashboard/pages/AnalyticsPage'
import { SettingsPage } from '@dashboard/pages/SettingsPage'

export function DashboardRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<DashboardAuthPage />} />
          <Route
            element={
              <ProtectedRoute requiredRole="organiser">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<CreateEventPage />} />
            <Route path="volunteers" element={<VolunteersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
