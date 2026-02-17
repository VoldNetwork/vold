/**
 * Supabase Database Types
 * Generated from the Vold schema
 */

export type UserRole = 'volunteer' | 'organiser'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RegistrationStatus = 'registered' | 'confirmed' | 'attended' | 'no_show' | 'cancelled'
export type TransactionType = 'earned' | 'spent' | 'bonus' | 'penalty'
export type BadgeTier = 'bronze' | 'silver' | 'gold'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  location: string | null
  tokens: number
  reputation_score: number
  events_attended: number
  hours_volunteered: number
  created_at: string
  updated_at: string
}

export interface Organisation {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  organisation_id: string
  organiser_id: string
  location: string
  latitude: number | null
  longitude: number | null
  date: string
  start_time: string
  end_time: string
  category: string
  spots_total: number
  spots_filled: number
  tokens_reward: number
  image_url: string | null
  status: EventStatus
  requirements: string | null
  created_at: string
  updated_at: string
  // Joined fields
  organisation?: Organisation
}

export interface Registration {
  id: string
  event_id: string
  volunteer_id: string
  status: RegistrationStatus
  registered_at: string
  checked_in_at: string | null
  hours_logged: number | null
  feedback: string | null
  rating: number | null
  // Joined fields
  event?: Event
  volunteer?: Profile
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  description: string
  event_id: string | null
  created_at: string
  // Joined fields
  event?: Event
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  tier: BadgeTier
  criteria_type: string
  criteria_value: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  // Joined fields
  badge?: Badge
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  action_url: string | null
  created_at: string
}

/**
 * Supabase Database type definition for typed queries
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Pick<Profile, 'id' | 'email' | 'full_name' | 'role'> & Partial<Omit<Profile, 'id' | 'email' | 'full_name' | 'role'>>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      organisations: {
        Row: Organisation
        Insert: Omit<Organisation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Organisation, 'id' | 'created_at'>>
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'spots_filled'>
        Update: Partial<Omit<Event, 'id' | 'created_at'>>
      }
      registrations: {
        Row: Registration
        Insert: Omit<Registration, 'id' | 'registered_at'>
        Update: Partial<Omit<Registration, 'id' | 'registered_at'>>
      }
      token_transactions: {
        Row: TokenTransaction
        Insert: Omit<TokenTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<TokenTransaction, 'id' | 'created_at'>>
      }
      badges: {
        Row: Badge
        Insert: Omit<Badge, 'id' | 'created_at'>
        Update: Partial<Omit<Badge, 'id' | 'created_at'>>
      }
      user_badges: {
        Row: UserBadge
        Insert: Omit<UserBadge, 'id' | 'earned_at'>
        Update: Partial<Omit<UserBadge, 'id' | 'earned_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      event_status: EventStatus
      registration_status: RegistrationStatus
      transaction_type: TransactionType
      badge_tier: BadgeTier
    }
  }
}
