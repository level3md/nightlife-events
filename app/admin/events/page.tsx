import { createAdminClient } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { Plus, Edit2 } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Events — Admin' }

type EventWithTiers = {
  id: string; name: string; slug: string; status: string; featured: boolean
  venue: string; event_date: string
  ticket_tiers: Array<{id: string; name: string; price_cents: number; quantity_total: number; quantity_sold: number; is_vip: boolean}>
}

export default async function AdminEventsPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(id, name, price_cents, quantity_total, quantity_sold, is_vip)')
    .order('event_date', { ascending: false })
  const events = data as unknown as EventWithTiers[] | null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="text-gray-500 text-sm mt-1">{events?.length ?? 0} total events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Link>
      </div>

      <div className="space-y-3">
        {(events ?? []).map((event) => {
          const tiers = event.ticket_tiers ?? []
          const soldTotal = tiers.reduce((s, t) => s + t.quantity_sold, 0)
          const capTotal = tiers.reduce((s, t) => s + t.quantity_total, 0)
          const revenue = tiers.reduce((s, t) => s + t.quantity_sold * t.price_cents, 0)
          const pct = capTotal > 0 ? Math.round((soldTotal / capTotal) * 100) : 0

          return (
            <div key={event.id} className="bg-surface-1 border border-surface-3 rounded-xl p-5 hover:border-surface-4 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-white font-semibold">{event.name}</h2>
                    <Badge variant={event.status as 'draft' | 'published' | 'cancelled' | 'past'}>{event.status}</Badge>
                    {event.featured && <Badge variant="featured">Featured</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {event.venue} · {formatDate(event.event_date)}
                  </p>

                  {/* Tier pills */}
                  {tiers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tiers.map((tier) => (
                        <span
                          key={tier.name}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            tier.is_vip
                              ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold'
                              : 'bg-surface-2 border-surface-4 text-gray-400'
                          }`}
                        >
                          {tier.name} · {formatPrice(tier.price_cents)}
                          <span className="text-gray-600 ml-1">{tier.quantity_sold}/{tier.quantity_total}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  {/* Sales stats */}
                  <div className="text-right hidden sm:block">
                    <p className="text-white font-semibold">{formatPrice(revenue)}</p>
                    <p className="text-gray-500 text-xs">{soldTotal} sold · {pct}% capacity</p>
                  </div>

                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1.5 text-sm text-brand-purple-light hover:text-white transition-colors font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </div>
              </div>

              {/* Capacity bar */}
              {capTotal > 0 && (
                <div className="mt-4">
                  <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-brand-purple'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {(!events || events.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p>No events yet.</p>
            <Link href="/admin/events/new" className="text-brand-purple-light hover:underline text-sm mt-2 inline-block">
              Create your first event →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
