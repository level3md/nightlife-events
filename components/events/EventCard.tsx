import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { Event } from '@/types'
import Badge from '@/components/ui/Badge'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const isPast = new Date(event.event_date) < new Date()

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="relative bg-surface-1 rounded-2xl border border-surface-3 overflow-hidden transition-all duration-300 group-hover:border-brand-purple/50 group-hover:shadow-brand group-hover:-translate-y-1">
        {/* Cover image */}
        <div className="relative h-52 overflow-hidden bg-surface-2">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 to-brand-pink/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-brand opacity-40 blur-xl" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {event.featured && <Badge variant="featured">Featured</Badge>}
            {isPast && <Badge variant="sold-out">Past Event</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-white font-bold text-lg leading-tight group-hover:text-brand-purple-light transition-colors line-clamp-1">
            {event.name}
          </h3>
          {event.tagline && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-1">{event.tagline}</p>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Calendar className="w-3.5 h-3.5 text-brand-purple shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-3.5 h-3.5 text-brand-purple shrink-0" />
              <span>{formatTime(event.event_date)}</span>
              {event.age_restriction && (
                <span className="ml-auto text-xs text-gray-500">{event.age_restriction}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-3.5 h-3.5 text-brand-purple shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>

          {/* Ticket tiers preview */}
          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-3 flex items-center justify-between">
              <span className="text-gray-500 text-xs">
                From{' '}
                <span className="text-white font-semibold">
                  ${(Math.min(...event.ticket_tiers.map((t) => t.price_cents)) / 100).toFixed(0)}
                </span>
              </span>
              <span className="text-xs px-3 py-1.5 rounded-lg bg-gradient-brand text-white font-medium">
                Get Tickets →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
