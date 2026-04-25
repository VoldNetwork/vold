import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

import {
  isMobileSupabaseConfigured,
  supabaseMobile,
} from '@shared/lib/supabase-mobile'

// Public landing page for shared event invites. Reachable at /e/:id without
// authentication — anyone holding the link sees the event. The mobile app
// builds these URLs in mobile/lib/event-share.ts.
//
// Reads from the mobile Supabase project (separate from the web project's
// own Supabase). Anonymous SELECT is permitted by the RLS policy in
// mobile/supabase/migrations/0005_public_event_share_read.sql for events
// where is_public = true.

type EventRow = {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  cover_url: string | null
  location_name: string | null
  is_public: boolean
}

const APP_SCHEME = 'voldmobile'

export function EventInvitePage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorKind, setErrorKind] = useState<
    'none' | 'unconfigured' | 'not-found' | 'fetch-failed'
  >('none')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setErrorKind('not-found')
      return
    }
    if (!isMobileSupabaseConfigured) {
      setLoading(false)
      setErrorKind('unconfigured')
      return
    }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabaseMobile
        .from('events')
        .select(
          'id, title, description, starts_at, ends_at, cover_url, location_name, is_public',
        )
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.warn('[event-invite] fetch failed:', error.message)
        setErrorKind('fetch-failed')
      } else if (!data) {
        setErrorKind('not-found')
      } else {
        setEvent(data as EventRow)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const openInApp = () => {
    if (!id) return
    // Custom-scheme URL — works for users with the Vold app installed; opens
    // a "Cannot open URL" message otherwise. Universal Links would solve the
    // missing-app fallback but require AASA hosting; out of scope here.
    window.location.href = `${APP_SCHEME}://event-detail?id=${id}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <header className="mb-6 flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900">Vold</div>
          <span className="text-sm text-gray-500">— event invite</span>
        </header>

        {loading ? (
          <SkeletonState />
        ) : errorKind !== 'none' || !event ? (
          <ErrorState
            kind={errorKind}
            id={id}
            onOpenInApp={openInApp}
          />
        ) : (
          <EventCard event={event} onOpenInApp={openInApp} />
        )}

        <AppDownloadFooter />
      </div>
    </div>
  )
}

function EventCard({
  event,
  onOpenInApp,
}: {
  event: EventRow
  onOpenInApp: () => void
}) {
  const startsAt = new Date(event.starts_at)
  const endsAt = event.ends_at ? new Date(event.ends_at) : null
  const dateLabel = startsAt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const timeLabel = endsAt
    ? `${formatTime(startsAt)} – ${formatTime(endsAt)}`
    : formatTime(startsAt)

  return (
    <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {event.cover_url ? (
        <img
          src={event.cover_url}
          alt=""
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gradient-to-br from-fuchsia-500 to-indigo-600" />
      )}

      <div className="p-6 space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {event.title}
        </h1>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {dateLabel} · {timeLabel}
            </span>
          </div>
          {event.location_name ? (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{event.location_name}</span>
            </div>
          ) : null}
        </div>

        {event.description ? (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onOpenInApp}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:opacity-95 active:opacity-90 transition"
        >
          Open in Vold app
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}

function ErrorState({
  kind,
  id,
  onOpenInApp,
}: {
  kind: 'unconfigured' | 'not-found' | 'fetch-failed' | 'none'
  id: string | undefined
  onOpenInApp: () => void
}) {
  const copy =
    kind === 'not-found'
      ? {
          title: 'Event not found',
          body:
            "This invite link doesn't match an event we can find. The event may have been removed, or the link is incomplete.",
        }
      : kind === 'unconfigured'
      ? {
          title: 'Open this invite in the Vold app',
          body:
            "We can't preview this event here right now. If you have the Vold app installed, tap below to open it directly.",
        }
      : {
          title: "Couldn't load this event",
          body:
            "Something went wrong fetching the event. If you have the Vold app installed, you can open the event directly there.",
        }

  return (
    <article className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">{copy.title}</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{copy.body}</p>
      {id ? (
        <button
          type="button"
          onClick={onOpenInApp}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-indigo-600 hover:opacity-95 transition"
        >
          Open in Vold app
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : null}
    </article>
  )
}

function SkeletonState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-200" />
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 rounded" />
        </div>
        <div className="h-12 w-full bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}

function AppDownloadFooter() {
  return (
    <footer className="mt-8 text-center text-xs text-gray-500 space-y-2">
      <p>Don&apos;t have Vold yet?</p>
      <div className="flex justify-center gap-3">
        {/* Store links are placeholders — replace with real listings once
            the apps are live. */}
        <a
          href="#"
          className="rounded-full border border-gray-300 px-4 py-2 hover:bg-white transition"
        >
          App Store
        </a>
        <a
          href="#"
          className="rounded-full border border-gray-300 px-4 py-2 hover:bg-white transition"
        >
          Google Play
        </a>
      </div>
    </footer>
  )
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
