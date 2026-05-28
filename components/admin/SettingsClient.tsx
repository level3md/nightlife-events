'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, Info, Video } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { calculateFee } from '@/lib/fees'
import type { FeeSettings, FeeType } from '@/types'

interface SettingsClientProps {
  initialSettings: FeeSettings
}

const FEE_TYPE_OPTIONS: { value: FeeType; label: string; description: string }[] = [
  { value: 'none', label: 'No fee', description: 'Buyers pay only the ticket price' },
  { value: 'percentage', label: 'Percentage', description: 'e.g. 3.5% of the order subtotal' },
  { value: 'flat', label: 'Flat amount', description: 'e.g. $1.50 per order regardless of quantity' },
  { value: 'both', label: 'Percentage + flat', description: 'e.g. 2% + $0.30 per order (mirrors Stripe\'s pricing)' },
]

const PREVIEW_SUBTOTAL = 5000 // $50.00 example

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FeeSettings>(initialSettings)
  const [videoUrl, setVideoUrl] = useState(initialSettings.homepage_video_url ?? '')

  const update = <K extends keyof FeeSettings>(key: K, value: FeeSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }))

  const previewFee = calculateFee(PREVIEW_SUBTOTAL, settings)
  const previewTotal = PREVIEW_SUBTOTAL + previewFee

  const handleSave = async () => {
    if (settings.fee_type !== 'none' && !settings.fee_label.trim()) {
      toast.error('Fee label is required.')
      return
    }
    if ((settings.fee_type === 'percentage' || settings.fee_type === 'both') && settings.fee_percentage <= 0) {
      toast.error('Percentage must be greater than 0.')
      return
    }
    if ((settings.fee_type === 'flat' || settings.fee_type === 'both') && settings.fee_flat_cents <= 0) {
      toast.error('Flat amount must be greater than $0.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, homepage_video_url: videoUrl || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Save failed')
      setSettings(data.settings)
      toast.success('Settings saved!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Platform configuration</p>
        </div>
        <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
          <Save className="w-3.5 h-3.5" />
          Save Settings
        </Button>
      </div>

      <div className="space-y-6">
        {/* Homepage appearance */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1 text-sm uppercase tracking-wider flex items-center gap-2">
            <Video className="w-4 h-4 text-brand-gold" />
            Appearance
          </h2>
          <p className="text-gray-500 text-xs mb-5">
            Customize the homepage hero background.
          </p>

          <Input
            label="Homepage Background Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://yourcdn.com/promo.mp4"
            hint="Must be a direct video file (.mp4 recommended). YouTube/Vimeo links won't autoplay as backgrounds. Leave blank to use the animated gradient."
          />

          {videoUrl && (
            <div className="mt-3 rounded-xl overflow-hidden bg-black relative aspect-video">
              <video
                key={videoUrl}
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">Live preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee configuration */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-1 text-sm uppercase tracking-wider">Processing Fee</h2>
          <p className="text-gray-500 text-xs mb-5">
            Shown to buyers as a separate line item at checkout. Appears in Stripe receipts under the label you set.
          </p>

          {/* Fee type selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
            {FEE_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('fee_type', opt.value)}
                className={`text-left px-4 py-3 rounded-lg border transition-all ${
                  settings.fee_type === opt.value
                    ? 'bg-brand-gold/10 border-brand-gold/50 text-brand-gold'
                    : 'bg-surface-2 border-surface-4 text-gray-400 hover:border-surface-4 hover:text-gray-300'
                }`}
              >
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>

          {/* Fee inputs — shown when fee is active */}
          {settings.fee_type !== 'none' && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(settings.fee_type === 'percentage' || settings.fee_type === 'both') && (
                  <Input
                    label="Percentage (%)"
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={settings.fee_percentage === 0 ? '' : String(settings.fee_percentage)}
                    onChange={(e) => update('fee_percentage', parseFloat(e.target.value) || 0)}
                    placeholder="3.5"
                    hint="Applied to the order subtotal"
                  />
                )}
                {(settings.fee_type === 'flat' || settings.fee_type === 'both') && (
                  <Input
                    label="Flat amount (USD)"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={settings.fee_flat_cents === 0 ? '' : (settings.fee_flat_cents / 100).toFixed(2)}
                    onChange={(e) => update('fee_flat_cents', Math.round((parseFloat(e.target.value) || 0) * 100))}
                    placeholder="1.50"
                    hint="Added once per order"
                  />
                )}
                <Input
                  label="Fee label"
                  value={settings.fee_label}
                  onChange={(e) => update('fee_label', e.target.value)}
                  placeholder="Service Fee"
                  hint="Shown to buyers and in Stripe receipts"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live preview */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
            Buyer Preview
          </h2>
          <p className="text-gray-500 text-xs mb-4 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            How the order summary looks to a buyer with a $50.00 subtotal
          </p>

          <div className="bg-surface-2 border border-surface-3 rounded-xl p-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>2× General Admission</span>
              <span>{formatPrice(PREVIEW_SUBTOTAL)}</span>
            </div>

            {previewFee > 0 ? (
              <>
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(PREVIEW_SUBTOTAL)}</span>
                </div>
                <div className="flex justify-between text-brand-gold/80">
                  <span>{settings.fee_label || 'Service Fee'}</span>
                  <span>+{formatPrice(previewFee)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-surface-3">
                  <span>Total</span>
                  <span>{formatPrice(previewTotal)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-white font-bold pt-2 border-t border-surface-3">
                <span>Total</span>
                <span>{formatPrice(PREVIEW_SUBTOTAL)}</span>
              </div>
            )}
          </div>

          {previewFee > 0 && (
            <p className="text-xs text-gray-600 mt-3">
              Fee on this example order: {formatPrice(previewFee)}
              {settings.fee_type === 'percentage' && ` (${settings.fee_percentage}%)`}
              {settings.fee_type === 'flat' && ` (flat)`}
              {settings.fee_type === 'both' && ` (${settings.fee_percentage}% + ${formatPrice(settings.fee_flat_cents)} flat)`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
