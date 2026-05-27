'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { TicketTier } from '@/types'
import toast from 'react-hot-toast'

interface TicketTierFormProps {
  eventId: string
  onCreated: (tier: TicketTier) => void
}

export default function TicketTierForm({ eventId, onCreated }: TicketTierFormProps) {
  const [saving, setSaving] = useState(false)
  const [perks, setPerks] = useState<string[]>([''])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_cents: '',
    quantity_total: '',
    is_vip: false,
    sort_order: '0',
  })

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updatePerk = (i: number, value: string) => {
    setPerks((prev) => prev.map((p, idx) => (idx === i ? value : p)))
  }

  const addPerk = () => setPerks((prev) => [...prev, ''])
  const removePerk = (i: number) => setPerks((prev) => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price_cents || !form.quantity_total) {
      toast.error('Name, price, and quantity are required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/events/${eventId}/tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          price_cents: Math.round(parseFloat(form.price_cents) * 100),
          quantity_total: parseInt(form.quantity_total),
          is_vip: form.is_vip,
          sort_order: parseInt(form.sort_order) || 0,
          perks: perks.filter(Boolean),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error))
      onCreated(data.tier)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create tier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Tier Name *"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="General Admission"
        />
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Standard entry"
        />
        <Input
          label="Price (USD) *"
          type="number"
          min="0"
          step="0.01"
          value={form.price_cents}
          onChange={(e) => update('price_cents', e.target.value)}
          placeholder="25.00"
        />
        <Input
          label="Total Quantity *"
          type="number"
          min="1"
          value={form.quantity_total}
          onChange={(e) => update('quantity_total', e.target.value)}
          placeholder="200"
        />
        <Input
          label="Sort Order"
          type="number"
          min="0"
          value={form.sort_order}
          onChange={(e) => update('sort_order', e.target.value)}
          hint="Lower = shown first"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">VIP Tier</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={form.is_vip}
              onChange={(e) => update('is_vip', e.target.checked)}
              className="w-4 h-4 accent-brand-gold"
            />
            <span className="text-sm text-gray-300">Mark as VIP package</span>
          </label>
        </div>
      </div>

      {/* Perks */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Perks / Inclusions</label>
        <div className="space-y-2">
          {perks.map((perk, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={perk}
                onChange={(e) => updatePerk(i, e.target.value)}
                placeholder={`Perk ${i + 1} (e.g. Priority entry)`}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-surface-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-purple"
              />
              {perks.length > 1 && (
                <button type="button" onClick={() => removePerk(i)} className="text-gray-500 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addPerk}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-purple-light transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add perk
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" variant="primary" size="sm" loading={saving}>
          <Plus className="w-3.5 h-3.5" />
          Add Tier
        </Button>
      </div>
    </form>
  )
}
