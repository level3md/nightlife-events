import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  tagline: z.string().max(300).optional(),
  description: z.string().optional(),
  venue: z.string().min(1).max(200).optional(),
  venue_address: z.string().optional(),
  event_date: z.string().datetime().optional(),
  doors_open: z.string().datetime().optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  video_url: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'published', 'cancelled', 'past']).optional(),
  featured: z.boolean().optional(),
  age_restriction: z.string().optional(),
  dress_code: z.string().optional(),
})

// GET /api/events/[id] — fetch single event by id OR slug (public for published events)
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(params.id)
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq(isUuid ? 'id' : 'slug', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const session = await getServerSession(authOptions)
  if (!session && data.status !== 'published') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Sort tiers by sort_order
  if (data.ticket_tiers) {
    data.ticket_tiers.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
  }

  return NextResponse.json({ event: data })
}

// PATCH /api/events/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .update(parsed.data)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event: data })
}

// DELETE /api/events/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('events').delete().eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
