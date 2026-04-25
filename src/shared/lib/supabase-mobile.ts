import { createClient } from '@supabase/supabase-js'

// Read-only client pointing at the mobile Supabase project — the source of
// truth for events created in the mobile app. Used by the public /e/:id
// invite landing page so shared links resolve to real events. No auth
// persistence: every page load is unauthenticated, served by RLS policies
// that allow anon SELECT on `events` where `is_public = true`.

const supabaseUrl = import.meta.env.VITE_MOBILE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_MOBILE_SUPABASE_ANON_KEY

export const isMobileSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Falls back to a no-op client when env is missing so importing the page
// doesn't crash the whole bundle in unconfigured environments. The page
// branches on `isMobileSupabaseConfigured` to render an appropriate message.
export const supabaseMobile = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
)
