import type { EventStatus } from '@shared/types/database'

const DRAFTS_KEY = 'vold.draft_events'
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface NewEventInput {
  title: string
  description: string
  category: string
  location: string
  date: string
  start_time: string
  end_time: string
  spots_total: number
  tokens_reward: number
  image_url: string | null
  requirements: string | null
  status: EventStatus
}

export interface SavedDraftEvent extends NewEventInput {
  id: string
  organiser_id: string
  created_at: string
}

export function isUuid(value: string | null | undefined): value is string {
  return !!value && UUID_V4.test(value)
}

export function listDraftEvents(): SavedDraftEvent[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as SavedDraftEvent[]) : []
  } catch {
    return []
  }
}

export function saveDraftEvent(
  payload: NewEventInput,
  organiserId: string,
): SavedDraftEvent {
  const draft: SavedDraftEvent = {
    ...payload,
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    organiser_id: organiserId,
    created_at: new Date().toISOString(),
  }
  const all = listDraftEvents()
  all.unshift(draft)
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(all))
  return draft
}
