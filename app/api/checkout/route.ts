import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import { calculateFee, DEFAULT_FEE_SETTINGS } from '@/lib/fees'
import type { FeeSettings } from '@/types'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const checkoutSchema = z.object({
  eventId: z.string().uuid(),
  items: z.array(
    z.object({
      tierId: z.string().uuid(),
      quantity: z.number().int().min(1).max(20),
    })
  ).min(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
  }

  const { eventId, items } = parsed.data
  const supabase = createAdminClient()

  // Load fee settings (fall back to no fee if table doesn't exist yet)
  let feeSettings: FeeSettings = DEFAULT_FEE_SETTINGS
  try {
    const { data: settingsRow } = await supabase
      .from('platform_settings')
      .select('fee_type, fee_percentage, fee_flat_cents, fee_label')
      .eq('id', 1)
      .single()
    if (settingsRow) feeSettings = settingsRow as FeeSettings
  } catch { /* table not yet created — proceed with no fee */ }

  type TierRow = { id: string; name: string; price_cents: number; quantity_total: number; quantity_sold: number; is_vip: boolean }
  type EventRow = { id: string; name: string; slug: string; status: string; ticket_tiers: TierRow[] }

  // Fetch event + tiers in one query
  const { data: rawEvent } = await supabase
    .from('events')
    .select('id, name, slug, status, ticket_tiers(*)')
    .eq('id', eventId)
    .eq('status', 'published')
    .single()

  const event = rawEvent as unknown as EventRow | null

  if (!event) {
    return NextResponse.json({ error: 'Event not found or not available' }, { status: 404 })
  }

  const tiers = event.ticket_tiers

  // Validate each requested tier: exists, belongs to event, has inventory
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let totalCents = 0

  for (const item of items) {
    const tier = tiers.find((t) => t.id === item.tierId)
    if (!tier) {
      return NextResponse.json({ error: `Ticket tier not found: ${item.tierId}` }, { status: 400 })
    }

    const available = tier.quantity_total - tier.quantity_sold
    if (available < item.quantity) {
      return NextResponse.json({
        error: `Not enough inventory for "${tier.name}". Only ${available} left.`,
      }, { status: 409 })
    }

    totalCents += tier.price_cents * item.quantity

    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: tier.price_cents,
        product_data: {
          name: `${tier.name} — ${event.name}`,
          description: tier.is_vip ? 'VIP Package' : 'General Admission',
          metadata: { tierId: tier.id, eventId: event.id },
        },
      },
      quantity: item.quantity,
    })
  }

  // Calculate and append the processing fee if configured
  const feeCents = calculateFee(totalCents, feeSettings)
  if (feeCents > 0) {
    lineItems.push({
      price_data: {
        currency: 'usd',
        unit_amount: feeCents,
        product_data: {
          name: feeSettings.fee_label,
          description: 'Non-refundable processing fee',
        },
      },
      quantity: 1,
    })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Create a pending order record before redirecting to Stripe
  // (The webhook will mark it paid once payment succeeds)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_email: '',   // filled by Stripe; updated via webhook
      status: 'pending',
      total_cents: totalCents + feeCents,
      fee_cents: feeCents,
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Create order items
  await supabase.from('order_items').insert(
    items.map((item) => {
      const tier = tiers.find((t) => t.id === item.tierId)!
      return {
        order_id: order.id,
        ticket_tier_id: item.tierId,
        quantity: item.quantity,
        unit_price_cents: tier.price_cents,
      }
    })
  )

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/purchase/cancel`,
    metadata: {
      orderId: order.id,
      eventId: event.id,
      eventSlug: event.slug,
    },
    // Collect customer email for receipt
    customer_creation: 'always',
    billing_address_collection: 'auto',
    phone_number_collection: { enabled: false },
  })

  // Attach Stripe session ID to the order
  await supabase
    .from('orders')
    .update({ stripe_session_id: session.id })
    .eq('id', order.id)

  return NextResponse.json({ url: session.url })
}
