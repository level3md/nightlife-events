// Always SSR so event listings stay fresh (inventory, new events)
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Zap } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase'
import EventCard from '@/components/events/EventCard'
import type { Event } from '@/types'

async function getFeaturedEvents(): Promise<Event[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  return (data as Event[]) ?? []
}

export default async function HomePage() {
  const events = await getFeaturedEvents()

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background decorations */}
        <div className="glow-orb w-96 h-96 bg-brand-purple top-1/4 -left-32" />
        <div className="glow-orb w-80 h-80 bg-brand-pink top-1/3 -right-20" />
        <div className="glow-orb w-64 h-64 bg-brand-gold bottom-1/4 left-1/2" />

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-purple/20 border border-brand-purple/30 text-brand-purple-light text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5 fill-brand-purple-light" />
            Premium Nightlife Experiences
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8">
            <span className="text-white">Where the</span>
            <br />
            <span className="text-gradient">Night Comes</span>
            <br />
            <span className="text-white">Alive.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Curated parties, underground electronic nights, and exclusive rooftop events.
            Secure your spot before they sell out.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-brand text-white font-bold text-lg shadow-brand hover:shadow-pink transition-shadow"
            >
              Browse Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/events?filter=vip"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface-2 border border-surface-4 text-white font-semibold text-lg hover:border-brand-gold/50 hover:text-brand-gold-light transition-colors"
            >
              <Star className="w-5 h-5 text-brand-gold" />
              VIP Packages
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '50K+', label: 'Happy guests' },
              { value: '200+', label: 'Events hosted' },
              { value: '4.9★', label: 'Average rating' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-gradient">{value}</p>
                <p className="text-gray-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* Upcoming events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-purple-light text-sm font-semibold uppercase tracking-widest mb-2">
              Don&apos;t miss out
            </p>
            <h2 className="text-4xl font-bold text-white">Upcoming Events</h2>
          </div>
          <Link
            href="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>No upcoming events scheduled yet. Check back soon!</p>
          </div>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
          >
            View all events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* VIP section */}
      <section className="relative py-24 overflow-hidden">
        <div className="glow-orb w-96 h-96 bg-brand-gold -left-20 top-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-surface-1 to-surface-2 border border-brand-gold/20 rounded-3xl p-8 sm:p-12 shadow-gold">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-gold/20 border border-brand-gold/30 text-brand-gold text-sm font-semibold mb-6">
                  <Star className="w-3.5 h-3.5 fill-brand-gold" />
                  VIP Experience
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  Elevate Your <span className="text-gradient-gold">Night</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Skip the line, secure your table, and enjoy an all-inclusive experience
                  with premium bottle service and dedicated concierge.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Priority entry — no waiting',
                    'Reserved table with premium views',
                    'Dedicated bottle service',
                    'Complimentary welcome cocktails',
                    'Exclusive VIP lounge access',
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="w-5 h-5 rounded-full bg-brand-gold/20 border border-brand-gold/50 flex items-center justify-center shrink-0">
                        <Star className="w-2.5 h-2.5 text-brand-gold fill-brand-gold" />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/events?filter=vip"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-gold text-black font-bold text-lg hover:opacity-90 transition shadow-gold"
                >
                  Explore VIP Packages
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative hidden lg:block">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-gold/20 to-surface-3 overflow-hidden border border-brand-gold/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-4 shadow-gold animate-float">
                      <Star className="w-10 h-10 text-black fill-black" />
                    </div>
                    <p className="text-brand-gold font-bold text-xl">VIP Access</p>
                    <p className="text-gray-500 text-sm mt-1">Unlimited exclusivity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section id="about" className="border-t border-surface-2 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Secure Payments',
                desc: 'All transactions processed securely via Stripe. Your data is always protected.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Instant Confirmation',
                desc: 'Get your tickets instantly via email. No waiting, no hassle.',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Curated Experiences',
                desc: 'Every event is hand-picked for quality. Only the best nights make the cut.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple-light mb-4">
                  {icon}
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
