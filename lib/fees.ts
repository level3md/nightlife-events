import type { FeeSettings } from '@/types'

/** Calculate the fee in cents for a given subtotal. */
export function calculateFee(subtotalCents: number, settings: FeeSettings): number {
  if (settings.fee_type === 'none' || subtotalCents === 0) return 0

  let fee = 0
  if (settings.fee_type === 'percentage' || settings.fee_type === 'both') {
    fee += Math.ceil((subtotalCents * settings.fee_percentage) / 100)
  }
  if (settings.fee_type === 'flat' || settings.fee_type === 'both') {
    fee += settings.fee_flat_cents
  }
  return fee
}

/** Default settings. Used as fallback when DB is unavailable. */
export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  fee_type: 'none',
  fee_percentage: 0,
  fee_flat_cents: 0,
  fee_label: 'Service Fee',
  homepage_video_url: null,
}
