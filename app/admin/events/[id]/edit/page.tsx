export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import EventForm from '@/components/admin/EventForm'
import type { Event, TicketTier } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('events').select('name').eq('id', params.id).single()
  const name = (data as { name?: string } | null)?.name
  return { title: name ? `Edit: ${name} — Admin` : 'Edit Event — Admin' }
}

export default async function EditEventPage({ params }: PageProps) {
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!event) notFound()

  const { data: tiers } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', params.id)
    .order('sort_order')

  return <EventForm event={event as Event} tiers={(tiers ?? []) as TicketTier[]} />
}
