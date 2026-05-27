export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import { DEFAULT_FEE_SETTINGS } from '@/lib/fees'
import SettingsClient from '@/components/admin/SettingsClient'
import type { Metadata } from 'next'
import type { FeeSettings } from '@/types'

export const metadata: Metadata = { title: 'Settings — Le Rendezvous Atlanta Admin' }

export default async function AdminSettingsPage() {
  let settings: FeeSettings = DEFAULT_FEE_SETTINGS
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('fee_type, fee_percentage, fee_flat_cents, fee_label')
      .eq('id', 1)
      .single()
    if (data) settings = data as FeeSettings
  } catch { /* table not yet created */ }

  return <SettingsClient initialSettings={settings} />
}
