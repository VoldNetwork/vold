import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Search, Calendar, Award, User } from 'lucide-react'
import { cn } from '@shared/lib/cn'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/discover', icon: Search, label: 'Discover' },
  { to: '/my-events', icon: Calendar, label: 'Events' },
  { to: '/rewards', icon: Award, label: 'Rewards' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content — scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Bar — fixed on mobile */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to))

            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[64px] transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
