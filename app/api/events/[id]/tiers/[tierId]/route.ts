import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price_cents: z.number().int().min(0).optional(),
  quantity_total: z.number().int().min(1).optional(),
  is_vip: z.boolean().optional(),
  perks: z.array(z.string()).optional(),
  sort_order: z.number().int().optional(),
  sale_starts_at: z.string().datetime().optional().nullable(),
  sale_ends_at: z.string().datetime().optional().nullable(),
})

// PATCH /api/events/[id]/tiers/[tierId]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; tierId: string } }
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
    .from('ticket_tiers')
    .update(parsed.data)
    .eq('id', params.tierId)
    .eq('event_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tier: data })
}

// DELETE /api/events/[id]/tiers/[tierId]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; tierId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('ticket_tiers')
    .delete()
    .eq('id', params.tierId)
    .eq('event_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
