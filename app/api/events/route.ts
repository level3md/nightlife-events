import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const eventSchema = z.object({
  name: z.string().min(1).max(200),
  tagline: z.string().max(300).optional(),
  description: z.string().optional(),
  venue: z.string().min(1).max(200),
  venue_address: z.string().optional(),
  event_date: z.string().datetime(),
  doors_open: z.string().datetime().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'cancelled', 'past']).default('draft'),
  featured: z.boolean().default(false),
  age_restriction: z.string().optional(),
  dress_code: z.string().optional(),
})

// GET /api/events — admin list (all statuses)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .order('event_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ events: data })
}

// POST /api/events — create event (admin only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data
  const slug = slugify(data.name) + '-' + Date.now().toString(36)

  const supabase = createAdminClient()
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...data,
      slug,
      image_url: data.image_url || null,
      video_url: data.video_url || null,
      doors_open: data.doors_open || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ event }, { status: 201 })
}
