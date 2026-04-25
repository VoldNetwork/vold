import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Coins, Users, Calendar as CalendarIcon, MapPin } from 'lucide-react'
import { Card } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Button } from '@shared/components/ui/Button'
import { useAuth } from '@shared/hooks/useAuth'
import { supabase } from '@shared/lib/supabase'
import { cn } from '@shared/lib/cn'
import { isUuid, saveDraftEvent, type NewEventInput } from '@shared/lib/draftEvents'
import { EventCoverPicker } from '../components/EventCoverPicker'
import type { EventCover } from '@shared/lib/eventCovers'

type FormState = {
  title: string
  description: string
  category: string
  location: string
  date: string
  start_time: string
  end_time: string
  spots_total: string
  tokens_reward: string
  imageUrl: string | null
  coverId: string | null
}

const initialState: FormState = {
  title: '',
  description: '',
  category: '',
  location: '',
  date: '',
  start_time: '',
  end_time: '',
  spots_total: '10',
  tokens_reward: '50',
  imageUrl: null,
  coverId: null,
}

type Errors = Partial<Record<keyof FormState | 'submit', string>>

function validate(state: FormState): Errors {
  const errors: Errors = {}
  if (!state.title.trim()) errors.title = 'Title is required'
  if (!state.description.trim()) errors.description = 'Description is required'
  if (!state.category.trim()) errors.category = 'Category is required'
  if (!state.location.trim()) errors.location = 'Location is required'
  if (!state.date) errors.date = 'Date is required'
  else if (new Date(state.date) < new Date(new Date().toDateString())) {
    errors.date = 'Date must be today or later'
  }
  if (!state.start_time) errors.start_time = 'Start time is required'
  if (!state.end_time) errors.end_time = 'End time is required'
  if (state.start_time && state.end_time && state.end_time <= state.start_time) {
    errors.end_time = 'End time must be after start time'
  }
  const spots = Number(state.spots_total)
  if (!Number.isFinite(spots) || spots < 1) errors.spots_total = 'At least 1 spot'
  const tokens = Number(state.tokens_reward)
  if (!Number.isFinite(tokens) || tokens < 0) errors.tokens_reward = 'Cannot be negative'
  if (!state.imageUrl) errors.imageUrl = 'Pick a cover image'
  return errors
}

export function CreateEventPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleCoverChange = (cover: EventCover) => {
    setState((s) => ({ ...s, imageUrl: cover.fullUrl, coverId: cover.id }))
    if (errors.imageUrl) setErrors((e) => ({ ...e, imageUrl: undefined }))
  }

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    action: 'draft' | 'publish',
  ) => {
    e.preventDefault()
    const validationErrors = validate(state)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(action)
    setErrors({})

    const payload: NewEventInput = {
      title: state.title.trim(),
      description: state.description.trim(),
      category: state.category.trim(),
      location: state.location.trim(),
      date: state.date,
      start_time: state.start_time,
      end_time: state.end_time,
      spots_total: Number(state.spots_total),
      tokens_reward: Number(state.tokens_reward),
      image_url: state.imageUrl,
      requirements: null,
      status: action === 'publish' ? 'published' : 'draft',
    }

    saveDraftEvent(payload, user?.id ?? 'anonymous')

    // Real Supabase insert only when we have a real UUID organiser id.
    // Until auth is un-mocked, the FK to profiles(id) UUID would fail.
    if (action === 'publish' && isUuid(user?.id)) {
      const insertPayload = {
        ...payload,
        organiser_id: user!.id,
        // TODO: organisation selection once orgs are wired up
        organisation_id: user!.id,
        latitude: null,
        longitude: null,
      }
      // Cast around the Database type — see DiscoverPage for the same shape mismatch on reads.
      const { error } = await supabase
        .from('events')
        .insert(insertPayload as never)
      if (error) {
        setErrors({ submit: error.message })
        setSubmitting(null)
        return
      }
    }

    setSubmitting(null)
    navigate('/events')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create event</h1>
      <p className="text-sm text-gray-500 mb-6">
        Pick a cover image, fill in the details, and publish to start recruiting volunteers.
      </p>

      <form onSubmit={(e) => handleSubmit(e, 'publish')}>
        <Card padding="lg" className="space-y-6">
          {/* Cover image — the focus */}
          <EventCoverPicker
            value={state.imageUrl}
            onChange={handleCoverChange}
            error={errors.imageUrl}
          />

          {/* Basics */}
          <div className="space-y-4">
            <Input
              label="Event title"
              placeholder="Beach clean-up at Sandymount"
              value={state.title}
              onChange={(e) => update('title', e.target.value)}
              error={errors.title}
            />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="What's the event about? Who should join?"
                value={state.description}
                onChange={(e) => update('description', e.target.value)}
                className={cn(
                  'w-full rounded-[var(--radius-button)] border border-gray-300 bg-white px-3 py-2.5 text-sm',
                  'placeholder:text-gray-400 resize-y',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'transition-colors duration-150',
                  errors.description &&
                    'border-red-500 focus:ring-red-500 focus:border-red-500',
                )}
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <Input
              label="Category"
              placeholder="Environment, Education, Sport…"
              value={state.category}
              onChange={(e) => update('category', e.target.value)}
              error={errors.category}
              helperText="A short label shown as a tag on the event card"
            />
          </div>

          {/* When */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              When
            </h2>
            <Input
              label="Date"
              type="date"
              value={state.date}
              onChange={(e) => update('date', e.target.value)}
              error={errors.date}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start time"
                type="time"
                value={state.start_time}
                onChange={(e) => update('start_time', e.target.value)}
                error={errors.start_time}
              />
              <Input
                label="End time"
                type="time"
                value={state.end_time}
                onChange={(e) => update('end_time', e.target.value)}
                error={errors.end_time}
              />
            </div>
          </div>

          {/* Where */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              Where
            </h2>
            <Input
              label="Location"
              placeholder="Sandymount Strand, Dublin"
              value={state.location}
              onChange={(e) => update('location', e.target.value)}
              error={errors.location}
            />
          </div>

          {/* Capacity & rewards */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Capacity & rewards</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Volunteer spots"
                type="number"
                min={1}
                value={state.spots_total}
                onChange={(e) => update('spots_total', e.target.value)}
                error={errors.spots_total}
                icon={<Users className="h-4 w-4" />}
              />
              <Input
                label="$VOLD reward each"
                type="number"
                min={0}
                value={state.tokens_reward}
                onChange={(e) => update('tokens_reward', e.target.value)}
                error={errors.tokens_reward}
                icon={<Coins className="h-4 w-4" />}
              />
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-[var(--radius-button)] border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end gap-3 mt-5">
          <Button
            type="button"
            variant="outline"
            loading={submitting === 'draft'}
            disabled={submitting !== null}
            onClick={(e) => handleSubmit(e as unknown as FormEvent<HTMLFormElement>, 'draft')}
          >
            Save as draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting === 'publish'}
            disabled={submitting !== null}
          >
            Publish event
          </Button>
        </div>
      </form>
    </div>
  )
}
