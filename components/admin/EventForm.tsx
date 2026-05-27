'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import { Save, Trash2, Globe, FileEdit, Plus, X, Pencil, Check } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import type { Event, TicketTier } from '@/types'
import TicketTierForm from './TicketTierForm'

interface EventFormProps {
  event?: Event
  tiers?: TicketTier[]
}

export default function EventForm({ event, tiers: initialTiers = [] }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!event

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showTierForm, setShowTierForm] = useState(false)
  const [tiers, setTiers] = useState<TicketTier[]>(initialTiers)

  const [form, setForm] = useState({
    name: event?.name ?? '',
    tagline: event?.tagline ?? '',
    description: event?.description ?? '',
    venue: event?.venue ?? '',
    venue_address: event?.venue_address ?? '',
    event_date: event?.event_date ? toDatetimeLocal(event.event_date) : '',
    doors_open: event?.doors_open ? toDatetimeLocal(event.doors_open) : '',
    image_url: event?.image_url ?? '',
    status: event?.status ?? 'draft',
    featured: event?.featured ?? false,
    age_restriction: event?.age_restriction ?? '21+',
    dress_code: event?.dress_code ?? '',
  })

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!form.name || !form.venue || !form.event_date) {
      toast.error('Name, venue, and event date are required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        event_date: new Date(form.event_date).toISOString(),
        doors_open: form.doors_open ? new Date(form.doors_open).toISOString() : null,
        image_url: form.image_url || null,
      }

      const res = await fetch(
        isEdit ? `/api/events/${event!.id}` : '/api/events',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error))

      toast.success(isEdit ? 'Event updated!' : 'Event created!')
      if (!isEdit) router.push(`/admin/events/${data.event.id}/edit`)
      else router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${event!.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${event!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Event deleted.')
      router.push('/admin/events')
    } catch {
      toast.error('Failed to delete event.')
    } finally {
      setDeleting(false)
    }
  }

  const handleTierCreated = (tier: TicketTier) => {
    setTiers((prev) => [...prev, tier])
    setShowTierForm(false)
    toast.success('Ticket tier added!')
  }

  const handleTierUpdated = (tier: TicketTier) => {
    setTiers((prev) => prev.map((t) => (t.id === tier.id ? tier : t)))
    toast.success('Tier updated!')
  }

  const handleTierDeleted = (tierId: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== tierId))
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Event' : 'New Event'}</h1>
          {isEdit && <p className="text-gray-500 text-sm mt-1">/{event!.slug}</p>}
        </div>
        <div className="flex gap-3">
          {isEdit && (
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => update('status', form.status === 'published' ? 'draft' : 'published')}>
            {form.status === 'published' ? <FileEdit className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status banner */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${
          form.status === 'published'
            ? 'bg-green-900/20 border-green-800 text-green-300'
            : 'bg-yellow-900/20 border-yellow-800 text-yellow-300'
        }`}>
          <span>
            Status: <strong>{form.status}</strong>
            {form.status === 'draft' && ' — not visible to the public'}
          </span>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs">Featured</span>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="w-4 h-4 accent-brand-purple"
            />
          </label>
        </div>

        {/* Basic info */}
        <Section title="Event Details">
          <Input label="Event Name *" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Electric Dreams Vol. 3" />
          <Input label="Tagline" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="The city's hottest underground night" />
          <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the vibe, the artists, what attendees can expect..." className="min-h-[150px]" />
        </Section>

        {/* Venue & time */}
        <Section title="Venue & Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Venue Name *" value={form.venue} onChange={(e) => update('venue', e.target.value)} placeholder="Warehouse 23" />
            <Input label="Venue Address" value={form.venue_address} onChange={(e) => update('venue_address', e.target.value)} placeholder="23 Industrial Blvd, Suite 100" />
            <Input label="Event Date & Time *" type="datetime-local" value={form.event_date} onChange={(e) => update('event_date', e.target.value)} />
            <Input label="Doors Open" type="datetime-local" value={form.doors_open} onChange={(e) => update('doors_open', e.target.value)} />
            <Input label="Age Restriction" value={form.age_restriction} onChange={(e) => update('age_restriction', e.target.value)} placeholder="21+" />
            <Input label="Dress Code" value={form.dress_code} onChange={(e) => update('dress_code', e.target.value)} placeholder="Dress to impress" />
          </div>
        </Section>

        {/* Media */}
        <Section title="Cover Image">
          <Input
            label="Image URL"
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            placeholder="https://..."
            hint="Use a Supabase Storage URL or any HTTPS image URL"
          />
          {form.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden h-48 bg-surface-2 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </Section>

        {/* Ticket tiers — only on edit page */}
        {isEdit && (
          <Section title="Ticket Tiers">
            <div className="space-y-3">
              {tiers.map((tier) => (
                <TierRow key={tier.id} tier={tier} eventId={event!.id} onUpdated={handleTierUpdated} onDeleted={handleTierDeleted} />
              ))}

              {tiers.length === 0 && (
                <p className="text-gray-500 text-sm">No ticket tiers yet. Add one below.</p>
              )}

              {showTierForm ? (
                <div className="bg-surface-2 border border-surface-4 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">New Ticket Tier</h4>
                    <button onClick={() => setShowTierForm(false)} className="text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <TicketTierForm eventId={event!.id} onCreated={handleTierCreated} />
                </div>
              ) : (
                <button
                  onClick={() => setShowTierForm(true)}
                  className="flex items-center gap-2 text-sm text-brand-purple-light hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Ticket Tier
                </button>
              )}
            </div>
          </Section>
        )}

        {!isEdit && (
          <p className="text-sm text-gray-500 bg-surface-2 border border-surface-3 rounded-xl p-4">
            💡 Save this event first, then add ticket tiers from the edit page.
          </p>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-1 border border-surface-3 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function TierRow({
  tier,
  eventId,
  onUpdated,
  onDeleted,
}: {
  tier: TicketTier
  eventId: string
  onUpdated: (tier: TicketTier) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const remaining = tier.quantity_total - tier.quantity_sold

  const [form, setForm] = useState({
    name: tier.name,
    description: tier.description ?? '',
    price_dollars: (tier.price_cents / 100).toFixed(2),
    quantity_total: String(tier.quantity_total),
    is_vip: tier.is_vip,
    sort_order: String(tier.sort_order),
  })
  const [perks, setPerks] = useState<string[]>(
    tier.perks && tier.perks.length > 0 ? tier.perks : ['']
  )

  const update = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const updatePerk = (i: number, value: string) =>
    setPerks((prev) => prev.map((p, idx) => (idx === i ? value : p)))
  const addPerk = () => setPerks((prev) => [...prev, ''])
  const removePerk = (i: number) => setPerks((prev) => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!form.name || !form.price_dollars || !form.quantity_total) {
      toast.error('Name, price, and quantity are required.')
      return
    }
    const qty = parseInt(form.quantity_total)
    if (qty < tier.quantity_sold) {
      toast.error(`Quantity can't be less than ${tier.quantity_sold} (already sold).`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${eventId}/tiers/${tier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          price_cents: Math.round(parseFloat(form.price_dollars) * 100),
          quantity_total: qty,
          is_vip: form.is_vip,
          sort_order: parseInt(form.sort_order) || 0,
          perks: perks.filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data.error))
      onUpdated(data.tier as TicketTier)
      setEditing(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save tier')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete tier "${tier.name}"?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/events/${eventId}/tiers/${tier.id}`, { method: 'DELETE' })
      onDeleted(tier.id)
    } catch {
      toast.error('Failed to delete tier')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-surface-2 border border-surface-3 rounded-xl overflow-hidden">
      {/* Collapsed header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">{tier.name}</span>
            {tier.is_vip && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/30">VIP</span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            {formatPrice(tier.price_cents)} · {tier.quantity_sold} sold / {tier.quantity_total} total · {remaining} remaining
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cancel edit' : 'Edit tier'}
            className={`transition-colors ${editing ? 'text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
          >
            {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="border-t border-surface-3 px-4 pb-4 pt-4 space-y-4">
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
              value={form.price_dollars}
              onChange={(e) => update('price_dollars', e.target.value)}
              placeholder="25.00"
            />
            <Input
              label="Total Quantity *"
              type="number"
              min={tier.quantity_sold}
              value={form.quantity_total}
              onChange={(e) => update('quantity_total', e.target.value)}
              hint={tier.quantity_sold > 0 ? `Min ${tier.quantity_sold} (already sold)` : undefined}
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
                    className="flex-1 px-3 py-2 rounded-lg bg-surface-3 border border-surface-4 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold"
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
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-gold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add perk
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function toDatetimeLocal(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16)
}
