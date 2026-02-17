import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@shared/styles/globals.css'

/**
 * Dual-build entry point.
 *
 * The VITE_BUILD_TARGET env variable determines which app to render:
 * - 'app'       → Volunteer mobile-first app (app.vold.network)
 * - 'dashboard' → Organiser desktop dashboard (dashboard.vold.network)
 *
 * In dev, you can run both simultaneously:
 *   npm run dev:app       → http://localhost:5173
 *   npm run dev:dashboard → http://localhost:5174
 */

const target = import.meta.env.VITE_BUILD_TARGET || 'app'

async function main() {
  const root = createRoot(document.getElementById('root')!)

  if (target === 'dashboard') {
    const { DashboardRouter } = await import('@dashboard/DashboardRouter')
    root.render(
      <StrictMode>
        <DashboardRouter />
      </StrictMode>
    )
  } else {
    const { AppRouter } = await import('@app/AppRouter')
    root.render(
      <StrictMode>
        <AppRouter />
      </StrictMode>
    )
  }
}

main()
