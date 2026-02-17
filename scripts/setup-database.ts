/**
 * Vold — Database Setup Script
 *
 * Creates all tables, enums, RLS policies, triggers, and seeds sample data.
 * Run with: npm run db:setup
 *
 * Uses the service_role key to bypass RLS during setup.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load env from .env.setup
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.setup')
const envContent = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) env[key.trim()] = vals.join('=').trim()
})

const supabaseUrl = env['SUPABASE_URL']
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.setup')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SQL = `
-- ============================================
-- Vold Database Schema
-- ============================================

-- 1. Create custom enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('volunteer', 'organiser');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM ('registered', 'confirmed', 'attended', 'no_show', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('earned', 'spent', 'bonus', 'penalty');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'volunteer',
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  tokens INTEGER NOT NULL DEFAULT 0,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  events_attended INTEGER NOT NULL DEFAULT 0,
  hours_volunteered NUMERIC(10,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Organisations table
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  organiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT NOT NULL,
  spots_total INTEGER NOT NULL DEFAULT 20,
  spots_filled INTEGER NOT NULL DEFAULT 0,
  tokens_reward INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_at TIMESTAMPTZ,
  hours_logged NUMERIC(5,1),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  UNIQUE(event_id, volunteer_id)
);

-- 6. Token transactions
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type transaction_type NOT NULL,
  description TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏅',
  tier badge_tier NOT NULL DEFAULT 'bronze',
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. User badges (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organiser ON events(organiser_id);
CREATE INDEX IF NOT EXISTS idx_registrations_volunteer ON registrations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organisations: Public read, owner can modify
DROP POLICY IF EXISTS "Organisations are viewable by everyone" ON organisations;
CREATE POLICY "Organisations are viewable by everyone" ON organisations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage organisations" ON organisations;
CREATE POLICY "Owners can manage organisations" ON organisations
  FOR ALL USING (auth.uid() = owner_id);

-- Events: Public read for published, organiser can manage all their events
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON events;
CREATE POLICY "Published events are viewable by everyone" ON events
  FOR SELECT USING (status = 'published' OR organiser_id = auth.uid());

DROP POLICY IF EXISTS "Organisers can manage own events" ON events;
CREATE POLICY "Organisers can manage own events" ON events
  FOR ALL USING (organiser_id = auth.uid());

-- Registrations: Volunteers see their own, organisers see for their events
DROP POLICY IF EXISTS "Volunteers can see own registrations" ON registrations;
CREATE POLICY "Volunteers can see own registrations" ON registrations
  FOR SELECT USING (
    volunteer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events WHERE events.id = registrations.event_id AND events.organiser_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Volunteers can register" ON registrations;
CREATE POLICY "Volunteers can register" ON registrations
  FOR INSERT WITH CHECK (volunteer_id = auth.uid());

DROP POLICY IF EXISTS "Volunteers can update own registrations" ON registrations;
CREATE POLICY "Volunteers can update own registrations" ON registrations
  FOR UPDATE USING (
    volunteer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM events WHERE events.id = registrations.event_id AND events.organiser_id = auth.uid()
    )
  );

-- Token transactions: Users see their own
DROP POLICY IF EXISTS "Users can see own transactions" ON token_transactions;
CREATE POLICY "Users can see own transactions" ON token_transactions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert transactions" ON token_transactions;
CREATE POLICY "System can insert transactions" ON token_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Badges: Everyone can see badges
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by everyone" ON badges
  FOR SELECT USING (true);

-- User badges: Users see their own
DROP POLICY IF EXISTS "Users can see own badges" ON user_badges;
CREATE POLICY "Users can see own badges" ON user_badges
  FOR SELECT USING (user_id = auth.uid());

-- Notifications: Users see their own
DROP POLICY IF EXISTS "Users can see own notifications" ON notifications;
CREATE POLICY "Users can see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- Auto-create profile on signup (trigger)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'volunteer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organisations_updated_at ON organisations;
CREATE TRIGGER update_organisations_updated_at
  BEFORE UPDATE ON organisations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed Data: Default Badges
-- ============================================
INSERT INTO badges (name, description, icon, tier, criteria_type, criteria_value) VALUES
  ('First Steps', 'Attend your first event', '👣', 'bronze', 'events_attended', 1),
  ('Regular', 'Attend 5 events', '⭐', 'bronze', 'events_attended', 5),
  ('Dedicated', 'Attend 10 events', '🌟', 'silver', 'events_attended', 10),
  ('Champion', 'Attend 25 events', '🏆', 'gold', 'events_attended', 25),
  ('Time Giver', 'Volunteer for 10 hours', '⏰', 'bronze', 'hours_volunteered', 10),
  ('Time Hero', 'Volunteer for 50 hours', '🦸', 'silver', 'hours_volunteered', 50),
  ('Time Legend', 'Volunteer for 100 hours', '🏅', 'gold', 'hours_volunteered', 100),
  ('Token Collector', 'Earn 50 tokens', '🪙', 'bronze', 'tokens_earned', 50),
  ('Token Master', 'Earn 200 tokens', '💰', 'silver', 'tokens_earned', 200),
  ('Token Legend', 'Earn 500 tokens', '💎', 'gold', 'tokens_earned', 500)
ON CONFLICT DO NOTHING;
`

async function main() {
  console.log('🚀 Setting up Vold database...\n')

  try {
    // Execute the SQL via the Supabase REST API
    const { error } = await supabase.rpc('exec_sql', { sql: SQL })

    if (error) {
      // If RPC doesn't exist, try direct SQL via the admin API
      console.log('RPC not available, trying direct SQL execution...')

      // Split and execute via fetch to the SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ sql: SQL }),
      })

      if (!response.ok) {
        // Fall back to the SQL Editor API
        console.log('Falling back to SQL Editor API...')
        const sqlResponse = await fetch(`${supabaseUrl}/pg/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ query: SQL }),
        })

        if (!sqlResponse.ok) {
          console.error('\n⚠️  Automated SQL execution is not available.')
          console.error('Please copy the SQL below and run it in the Supabase SQL Editor:')
          console.error(`${supabaseUrl.replace('.supabase.co', '')}/project/sql/new\n`)
          console.log('─'.repeat(60))
          console.log(SQL)
          console.log('─'.repeat(60))
          return
        }
      }
    }

    console.log('✅ Database setup complete!')
    console.log('   Tables created: profiles, organisations, events, registrations, token_transactions, badges, user_badges, notifications')
    console.log('   RLS policies applied')
    console.log('   Triggers created')
    console.log('   Default badges seeded')
  } catch (err) {
    console.error('\n⚠️  Could not execute SQL automatically.')
    console.error('Please copy the SQL below and run it in the Supabase SQL Editor:\n')
    console.log('─'.repeat(60))
    console.log(SQL)
    console.log('─'.repeat(60))
  }
}

main()
