import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Profile, UserRole } from '@shared/types/database'

/**
 * POC mock auth — Supabase Auth is intentionally bypassed for now.
 * A session is just an email persisted in localStorage; the profile is
 * derived locally so downstream pages keep rendering.
 */

const STORAGE_KEY = 'vold.mock_profile'

interface MockUser {
  id: string
  email: string
}

interface AuthContextType {
  user: MockUser | null
  profile: Profile | null
  session: { user: MockUser } | null
  loading: boolean
  signUp: (email: string, _password?: string, fullName?: string, role?: UserRole) => Promise<{ error: Error | null }>
  signIn: (email: string, _password?: string, role?: UserRole) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function makeProfile(email: string, role: UserRole, fullName?: string): Profile {
  const now = new Date().toISOString()
  const trimmed = email.trim().toLowerCase()
  const name = fullName?.trim() || trimmed.split('@')[0].replace(/[._-]+/g, ' ')
  return {
    id: trimmed,
    email: trimmed,
    full_name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    role,
    avatar_url: null,
    bio: null,
    location: null,
    tokens: 0,
    reputation_score: 0,
    events_attended: 0,
    hours_volunteered: 0,
    created_at: now,
    updated_at: now,
  }
}

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    return null
  }
}

function saveProfile(profile: Profile | null) {
  if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  else localStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProfile(loadProfile())
    setLoading(false)
  }, [])

  const signIn: AuthContextType['signIn'] = async (email, _password, role = 'volunteer') => {
    if (!email?.trim()) return { error: new Error('Please enter an email') }
    const existing = loadProfile()
    const next = existing && existing.email === email.trim().toLowerCase()
      ? existing
      : makeProfile(email, role)
    saveProfile(next)
    setProfile(next)
    return { error: null }
  }

  const signUp: AuthContextType['signUp'] = async (email, _password, fullName, role = 'volunteer') => {
    if (!email?.trim()) return { error: new Error('Please enter an email') }
    const next = makeProfile(email, role, fullName)
    saveProfile(next)
    setProfile(next)
    return { error: null }
  }

  const signOut = async () => {
    saveProfile(null)
    setProfile(null)
  }

  const refreshProfile = async () => {
    setProfile(loadProfile())
  }

  const user: MockUser | null = profile ? { id: profile.id, email: profile.email } : null

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user ? { user } : null,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
