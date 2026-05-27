'use client'

import { useState } from 'react'
import { ShoppingCart, Lock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import type { TicketTier } from '@/types'
import toast from 'react-hot-toast'

interface CartEntry {
  tierId: string
  quantity: number
}

interface CheckoutPanelProps {
  eventId: string
  tiers: TicketTier[]
  cart: CartEntry[]
}

export default function CheckoutPanel({ eventId, tiers, cart }: CheckoutPanelProps) {
  const [loading, setLoading] = useState(false)

  const lineItems = cart
    .filter((c) => c.quantity > 0)
    .map((c) => {
      const tier = tiers.find((t) => t.id === c.tierId)!
      return { ...c, tier }
    })

  const total = lineItems.reduce((sum, item) => sum + item.tier.price_cents * item.quantity, 0)
  const ticketCount = lineItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = async () => {
    if (lineItems.length === 0) {
      toast.error('Please select at least one ticket.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          items: lineItems.map((i) => ({ tierId: i.tierId, quantity: i.quantity })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Checkout failed')

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (ticketCount === 0) {
    return (
      <div className="sticky top-28 bg-surface-1 border border-surface-3 rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <ShoppingCart className="w-10 h-10 text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">Select tickets above to see your order</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-28 bg-surface-1 border border-brand-purple/30 rounded-2xl p-6 shadow-brand">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-brand-purple-light" />
        Your Order
      </h3>

      <div className="space-y-3 mb-4">
        {lineItems.map(({ tierId, tier, quantity }) => (
          <div key={tierId} className="flex justify-between text-sm">
            <span className="text-gray-300">
              {quantity}× {tier.name}
            </span>
            <span className="text-white font-medium">{formatPrice(tier.price_cents * quantity)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-3 pt-4 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">{ticketCount} ticket{ticketCount !== 1 ? 's' : ''}</span>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-white font-bold text-xl">{formatPrice(total)}</p>
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        onClick={handleCheckout}
      >
        <Lock className="w-4 h-4" />
        Secure Checkout
      </Button>

      <p className="text-center text-xs text-gray-600 mt-3 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Secured by Stripe
      </p>
    </div>
  )
}
