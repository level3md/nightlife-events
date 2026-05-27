import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import type { Event } from '@/types'
import { Filter } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Browse all upcoming nightlife events and get your tickets.',
}

// Always SSR — inventory changes in real time, events get published/unpublished
export const dynamic = 'force-dynamic'

async function getEvents(filter?: string): Promise<Event[]> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .gte('event_date', now)
    .order('event_date', { ascending: true })

  // VIP filter: events that have at least one VIP tier
  // We fetch all and filter client-side since Supabase doesn't support nested filters directly here
  const { data } = await query
  let events = (data as Event[]) ?? []

  if (filter === 'vip') {
    events = events.filter((e) => e.ticket_tiers?.some((t) => t.is_vip))
  }

  return events
}

interface PageProps {
  searchParams: { filter?: string }
}

export default async function EventsPage({ searchParams }: PageProps) {
  const filter = searchParams.filter
  const events = await getEvents(filter)

  const filters = [
    { label: 'All Events', value: undefined },
    { label: 'VIP Only', value: 'vip' },
  ]

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-brand-purple-light text-sm font-semibold uppercase tracking-widest mb-2">
            {filter === 'vip' ? 'Exclusive access' : 'All upcoming events'}
          </p>
          <h1 className="text-5xl font-bold text-white">
            {filter === 'vip' ? 'VIP Packages' : 'Events'}
          </h1>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-gray-500 shrink-0" />
          <div className="flex gap-2 flex-wrap">
            {filters.map(({ label, value }) => {
              const href = value ? `/events?filter=${value}` : '/events'
              const active = filter === value || (!filter && !value)
              return (
                <Link
                  key={label}
                  href={href}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? 'bg-brand-purple text-white'
                      : 'bg-surface-2 text-gray-400 hover:text-white border border-surface-4'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Event grid */}
        <Suspense fallback={<EventGridSkeleton />}>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState filter={filter} />
          )}
        </Suspense>
      </div>
    </div>
  )
}

function EmptyState({ filter }: { filter?: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-4">
        <Filter className="w-7 h-7 text-gray-600" />
      </div>
      <h2 className="text-white font-bold text-xl mb-2">No events found</h2>
      <p className="text-gray-500 text-sm mb-6">
        {filter === 'vip'
          ? 'No VIP events scheduled right now. Check back soon!'
          : 'No upcoming events yet. Check back soon!'}
      </p>
      {filter && (
        <Link href="/events" className="text-brand-purple-light hover:underline text-sm">
          View all events
        </Link>
      )}
    </div>
  )
}

function EventGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-1 border border-surface-3 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-52 bg-surface-2" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-surface-3 rounded w-3/4" />
            <div className="h-3 bg-surface-3 rounded w-1/2" />
            <div className="h-3 bg-surface-3 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
