import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@shared/lib/cn'
import {
  EVENT_COVERS,
  EVENT_COVER_THEMES,
  type EventCover,
  type EventCoverTheme,
} from '@shared/lib/eventCovers'

type TabValue = EventCoverTheme | 'all'

interface EventCoverPickerProps {
  value: string | null
  onChange: (cover: EventCover) => void
  error?: string
}

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  ...EVENT_COVER_THEMES,
]

export function EventCoverPicker({ value, onChange, error }: EventCoverPickerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('all')

  const visibleCovers =
    activeTab === 'all'
      ? EVENT_COVERS
      : EVENT_COVERS.filter((c) => c.theme === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Cover image
        </label>
        <span className="text-xs text-gray-500">
          {EVENT_COVERS.length} presets — pick one
        </span>
      </div>

      {/* Theme tabs */}
      <div
        role="tablist"
        aria-label="Filter cover images by theme"
        className="flex flex-wrap gap-1.5 mb-3"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div
        role="radiogroup"
        aria-label="Cover image"
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 gap-3 p-1',
          error && 'rounded-[var(--radius-button)] ring-2 ring-red-500',
        )}
      >
        {visibleCovers.map((cover) => {
          const isSelected = value === cover.fullUrl
          return (
            <button
              key={cover.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={cover.alt}
              onClick={() => onChange(cover)}
              className={cn(
                'group relative aspect-[3/2] overflow-hidden rounded-[var(--radius-button)]',
                'transition-all duration-150 bg-gray-100',
                'focus-visible:outline-none',
                isSelected
                  ? 'ring-2 ring-primary-600 ring-offset-2'
                  : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500',
              )}
            >
              <img
                src={cover.thumbUrl}
                alt={cover.alt}
                loading="lazy"
                decoding="async"
                className={cn(
                  'h-full w-full object-cover transition-transform duration-200',
                  !isSelected && 'group-hover:scale-[1.03]',
                )}
              />
              {isSelected && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary-600 text-white shadow-sm">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
