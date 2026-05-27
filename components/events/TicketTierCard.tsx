'use client'

import { Check, Crown, Minus, Plus } from 'lucide-react'
import { cn, formatPrice, getInventoryStatus } from '@/lib/utils'
import type { TicketTier } from '@/types'
import Badge from '@/components/ui/Badge'

interface TicketTierCardProps {
  tier: TicketTier
  quantity: number
  onQuantityChange: (tierId: string, quantity: number) => void
  maxPerOrder?: number
}

export default function TicketTierCard({
  tier,
  quantity,
  onQuantityChange,
  maxPerOrder = 10,
}: TicketTierCardProps) {
  const remaining = tier.quantity_total - tier.quantity_sold
  const soldOut = remaining <= 0
  const inventory = getInventoryStatus(tier.quantity_sold, tier.quantity_total)
  const max = Math.min(remaining, maxPerOrder)

  const decrement = () => onQuantityChange(tier.id, Math.max(0, quantity - 1))
  const increment = () => !soldOut && onQuantityChange(tier.id, Math.min(max, quantity + 1))

  return (
    <div
      className={cn(
        'relative rounded-xl border p-5 transition-all duration-200',
        tier.is_vip
          ? 'bg-gradient-to-br from-surface-2 to-surface-1 border-brand-gold/40 shadow-gold'
          : 'bg-surface-1 border-surface-3',
        quantity > 0 && 'border-brand-purple/60 shadow-brand',
        soldOut && 'opacity-50'
      )}
    >
      {tier.is_vip && (
        <div className="absolute -top-3 left-4">
          <Badge variant="vip">
            <Crown className="w-3 h-3 mr-1" /> VIP
          </Badge>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-bold text-lg', tier.is_vip ? 'text-brand-gold-light' : 'text-white')}>
            {tier.name}
          </h3>
          {tier.description && (
            <p className="text-gray-400 text-sm mt-0.5">{tier.description}</p>
          )}

          {/* Perks list */}
          {tier.perks && tier.perks.length > 0 && (
            <ul className="mt-3 space-y-1">
              {tier.perks.map((perk, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className={cn('w-3.5 h-3.5 shrink-0', tier.is_vip ? 'text-brand-gold' : 'text-brand-purple-light')} />
                  {perk}
                </li>
              ))}
            </ul>
          )}

          {/* Inventory status */}
          <p className={cn('text-xs mt-3 font-medium', inventory.color)}>
            {soldOut ? 'Sold Out' : inventory.label}
          </p>
        </div>

        {/* Price + quantity */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="text-right">
            <p className={cn('text-2xl font-bold', tier.is_vip ? 'text-brand-gold-light' : 'text-white')}>
              {formatPrice(tier.price_cents)}
            </p>
            <p className="text-xs text-gray-500">per ticket</p>
          </div>

          {!soldOut && (
            <div className="flex items-center gap-2">
              <button
                onClick={decrement}
                disabled={quantity === 0}
                className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-white font-bold tabular-nums">
                {quantity}
              </span>
              <button
                onClick={increment}
                disabled={quantity >= max}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors',
                  tier.is_vip
                    ? 'bg-brand-gold text-black hover:bg-brand-gold-light'
                    : 'bg-brand-purple text-white hover:bg-brand-purple-light',
                  quantity >= max && 'opacity-30 cursor-not-allowed'
                )}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {soldOut && (
            <Badge variant="sold-out">Sold Out</Badge>
          )}
        </div>
      </div>
    </div>
  )
}
