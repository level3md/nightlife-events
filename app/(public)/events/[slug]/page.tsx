'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Users, ShirtIcon, AlertCircle } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { Event } from '@/types'
import CountdownTimer from '@/components/events/CountdownTimer'
import TicketTierCard from '@/components/events/TicketTierCard'
import CheckoutPanel from '@/components/events/CheckoutPanel'
import VideoEmbed from '@/components/events/VideoEmbed'
import Badge from '@/components/ui/Badge'

// This is a client component so we can manage cart state.
// Data fetching is done client-side via the public API route.

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data.event ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const handleQuantityChange = (tierId: string, quantity: number) => {
    setCart((prev) => ({ ...prev, [tierId]: quantity }))
  }

  if (loading) return <EventDetailSkeleton />
  if (!event) return <NotFoundState />

  const cartEntries = Object.entries(cart).map(([tierId, quantity]) => ({ tierId, quantity }))
  const sortedTiers = [...(event.ticket_tiers ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const isPast = new Date(event.event_date) < new Date()

  return (
    <div className="pt-28 pb-20">
      {/* Hero banner */}
      <div className="relative h-72 sm:h-96 lg:h-[480px] overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/40 via-surface-1 to-brand-pink/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {event.featured && <Badge variant="featured">Featured</Badge>}
          {isPast && <Badge variant="sold-out">Past Event</Badge>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 -mt-12 relative z-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Event header */}
            <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 sm:p-8 mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{event.name}</h1>
              {event.tagline && (
                <p className="text-brand-purple-light text-lg mb-4">{event.tagline}</p>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <MetaItem icon={<Calendar className="w-4 h-4" />}>
                  {formatDate(event.event_date)}
                </MetaItem>
                <MetaItem icon={<Clock className="w-4 h-4" />}>
                  Doors: {event.doors_open ? formatTime(event.doors_open) : formatTime(event.event_date)}
                  {' — '} Show: {formatTime(event.event_date)}
                </MetaItem>
                <MetaItem icon={<MapPin className="w-4 h-4" />}>
                  {event.venue}
                  {event.venue_address && <span className="text-gray-500 ml-1">— {event.venue_address}</span>}
                </MetaItem>
                {event.age_restriction && (
                  <MetaItem icon={<Users className="w-4 h-4" />}>
                    {event.age_restriction}
                  </MetaItem>
                )}
                {event.dress_code && (
                  <MetaItem icon={<ShirtIcon className="w-4 h-4" />}>
                    {event.dress_code}
                  </MetaItem>
                )}
              </div>

              {/* Countdown */}
              {!isPast && (
                <div className="pt-5 border-t border-surface-3">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Event starts in</p>
                  <CountdownTimer targetDate={event.event_date} />
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 sm:p-8 mb-6">
                <h2 className="text-white font-bold text-xl mb-4">About This Event</h2>
                <div className="text-gray-400 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            )}

            {/* Event video */}
            {event.video_url && (
              <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 sm:p-8 mb-6">
                <h2 className="text-white font-bold text-xl mb-4">Event Video</h2>
                <VideoEmbed url={event.video_url} title={event.name} />
              </div>
            )}

            {/* Ticket tiers — visible only on mobile above checkout panel */}
            {!isPast && sortedTiers.length > 0 && (
              <div className="lg:hidden">
                <TicketSection
                  tiers={sortedTiers}
                  cart={cart}
                  onQuantityChange={handleQuantityChange}
                />
              </div>
            )}
          </div>

          {/* Sidebar — desktop checkout */}
          <div className="hidden lg:block">
            {!isPast && sortedTiers.length > 0 ? (
              <div className="space-y-4">
                <TicketSection
                  tiers={sortedTiers}
                  cart={cart}
                  onQuantityChange={handleQuantityChange}
                />
                <CheckoutPanel
                  eventId={event.id}
                  tiers={sortedTiers}
                  cart={cartEntries}
                />
              </div>
            ) : isPast ? (
              <div className="sticky top-28 bg-surface-1 border border-surface-3 rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">This event has ended.</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile checkout sticky footer */}
        {!isPast && sortedTiers.length > 0 && (
          <div className="lg:hidden mt-6">
            <CheckoutPanel
              eventId={event.id}
              tiers={sortedTiers}
              cart={cartEntries}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function TicketSection({
  tiers,
  cart,
  onQuantityChange,
}: {
  tiers: Event['ticket_tiers'] & NonNullable<unknown>
  cart: Record<string, number>
  onQuantityChange: (tierId: string, quantity: number) => void
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-white font-bold text-xl">Select Tickets</h2>
      {tiers!.map((tier) => (
        <TicketTierCard
          key={tier.id}
          tier={tier}
          quantity={cart[tier.id] ?? 0}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  )
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-gray-300">
      <span className="text-brand-purple mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  )
}

function EventDetailSkeleton() {
  return (
    <div className="pt-28 pb-20 animate-pulse">
      <div className="h-80 bg-surface-2" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-surface-2 rounded w-2/3" />
            <div className="h-4 bg-surface-2 rounded w-1/3" />
            <div className="h-32 bg-surface-1 border border-surface-3 rounded-2xl" />
          </div>
          <div className="h-64 bg-surface-1 border border-surface-3 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <div className="pt-40 text-center">
      <h1 className="text-white text-2xl font-bold mb-2">Event Not Found</h1>
      <p className="text-gray-400 text-sm">This event doesn&apos;t exist or is no longer available.</p>
    </div>
  )
}
