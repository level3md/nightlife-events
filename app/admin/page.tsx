export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import { Calendar, DollarSign, Ticket, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'

async function getDashboardStats() {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  type EventRow = { id: string; name: string; slug: string; status: string; event_date: string; ticket_tiers: Array<{quantity_total: number; quantity_sold: number; price_cents: number}> }
  type OrderRow = { total_cents: number; status: string }
  type TierRow = { quantity_sold: number; price_cents: number }

  const [eventsRes, ordersRes, tiersRes] = await Promise.all([
    supabase.from('events').select('id, name, slug, status, event_date, ticket_tiers(quantity_total, quantity_sold, price_cents)'),
    supabase.from('orders').select('total_cents, status').eq('status', 'paid'),
    supabase.from('ticket_tiers').select('quantity_sold, price_cents'),
  ])

  const events = (eventsRes.data as unknown as EventRow[]) ?? []
  const orders = (ordersRes.data as unknown as OrderRow[]) ?? []

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_cents, 0)
  const totalTicketsSold = ((tiersRes.data as unknown as TierRow[]) ?? []).reduce((sum, t) => sum + t.quantity_sold, 0)
  const publishedEvents = events.filter((e) => e.status === 'published').length
  const upcomingEvents = events.filter(
    (e) => e.status === 'published' && e.event_date > now
  )

  return { events, totalRevenue, totalTicketsSold, publishedEvents, upcomingEvents }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const { events, totalRevenue, totalTicketsSold, publishedEvents, upcomingEvents } = await getDashboardStats()

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'Tickets Sold', value: totalTicketsSold.toLocaleString(), icon: Ticket, color: 'text-brand-purple-light' },
    { label: 'Published Events', value: publishedEvents.toString(), icon: Calendar, color: 'text-blue-400' },
    { label: 'Upcoming Events', value: upcomingEvents.length.toString(), icon: TrendingUp, color: 'text-brand-gold-light' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()}, {session?.user?.name ?? 'Admin'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your events.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface-1 border border-surface-3 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming events table */}
      <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-3">
          <h2 className="text-white font-semibold">All Events</h2>
          <Link
            href="/admin/events/new"
            className="text-sm px-4 py-1.5 rounded-lg bg-gradient-brand text-white font-medium hover:opacity-90 transition"
          >
            + New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No events yet.{' '}
            <Link href="/admin/events/new" className="text-brand-purple-light hover:underline">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Event</th>
                  <th className="text-left px-6 py-3">Date</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Tickets Sold</th>
                  <th className="text-right px-6 py-3">Revenue</th>
                  <th className="text-right px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-2">
                {events.map((event) => {
                  const tiers = (event.ticket_tiers as Array<{quantity_total: number; quantity_sold: number; price_cents: number}>) ?? []
                  const sold = tiers.reduce((s, t) => s + t.quantity_sold, 0)
                  const total = tiers.reduce((s, t) => s + t.quantity_total, 0)
                  const revenue = tiers.reduce((s, t) => s + t.quantity_sold * t.price_cents, 0)

                  return (
                    <tr key={event.id} className="hover:bg-surface-2/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{event.name}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(event.event_date)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={event.status as 'draft' | 'published' | 'cancelled'}>{event.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        {sold} / {total}
                        {total > 0 && (
                          <span className="text-gray-600 ml-1 text-xs">
                            ({Math.round((sold / total) * 100)}%)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">{formatPrice(revenue)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="text-brand-purple-light hover:text-brand-purple text-xs font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
