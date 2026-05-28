export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { DEFAULT_FEE_SETTINGS } from '@/lib/fees'

// GET /api/settings — public endpoint used by CheckoutPanel
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('fee_type, fee_percentage, fee_flat_cents, fee_label, homepage_video_url')
      .eq('id', 1)
      .single()

    return NextResponse.json({ settings: data ?? DEFAULT_FEE_SETTINGS })
  } catch {
    return NextResponse.json({ settings: DEFAULT_FEE_SETTINGS })
  }
}
