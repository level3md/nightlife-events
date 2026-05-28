export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { DEFAULT_FEE_SETTINGS } from '@/lib/fees'
import { z } from 'zod'

const updateSchema = z.object({
  fee_type: z.enum(['none', 'percentage', 'flat', 'both']),
  fee_percentage: z.number().min(0).max(100),
  fee_flat_cents: z.number().int().min(0),
  fee_label: z.string().min(1).max(60),
  homepage_video_url: z.string().url().nullable().optional().or(z.literal('')),
})

// GET /api/admin/settings
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('platform_settings')
    .select('fee_type, fee_percentage, fee_flat_cents, fee_label, homepage_video_url')
    .eq('id', 1)
    .single()

  return NextResponse.json({ settings: data ?? DEFAULT_FEE_SETTINGS })
}

// PATCH /api/admin/settings
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const supabase = createAdminClient()

  // Upsert the single settings row
  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() })
    .select('fee_type, fee_percentage, fee_flat_cents, fee_label, homepage_video_url')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data })
}
