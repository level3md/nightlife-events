import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const tierSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  quantity_total: z.number().int().min(1),
  is_vip: z.boolean().default(false),
  perks: z.array(z.string()).optional(),
  sort_order: z.number().int().default(0),
  sale_starts_at: z.string().datetime().optional().nullable(),
  sale_ends_at: z.string().datetime().optional().nullable(),
})

// GET /api/events/[id]/tiers
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ticket_tiers')
    .select('*')
    .eq('event_id', params.id)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tiers: data })
}

// POST /api/events/[id]/tiers — create tier (admin only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = tierSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ticket_tiers')
    .insert({ ...parsed.data, event_id: params.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tier: data }, { status: 201 })
}
