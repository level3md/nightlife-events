import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Stripe requires the raw body for signature verification.
// Next.js App Router streams the body — we read it as text here.
export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('[webhook] signature error:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.orderId
      if (!orderId) break

      // Mark order as paid and capture customer info
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent: session.payment_intent as string,
          customer_email: session.customer_details?.email ?? '',
          customer_name: session.customer_details?.name ?? null,
        })
        .eq('id', orderId)

      // Increment quantity_sold for each tier in this order
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('ticket_tier_id, quantity')
        .eq('order_id', orderId)

      if (orderItems) {
        // Group by tier id in case an order has multiple items for the same tier
        const tierTotals: Record<string, number> = {}
        for (const item of orderItems) {
          tierTotals[item.ticket_tier_id] = (tierTotals[item.ticket_tier_id] ?? 0) + item.quantity
        }

        for (const [tierId, qty] of Object.entries(tierTotals)) {
          // Use a safe increment via RPC to avoid race conditions
          await supabase.rpc('increment_tier_sold', { tier_id: tierId, amount: qty })
        }
      }

      console.log(`[webhook] Order ${orderId} paid.`)
      break
    }

    case 'checkout.session.expired':
    case 'payment_intent.payment_failed': {
      // Mark pending orders as failed when session expires or payment fails
      if (event.type === 'checkout.session.expired') {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (orderId) {
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', orderId)
            .eq('status', 'pending')
        }
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const pi = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id

      if (pi) {
        // Find and update matching order
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent', pi)
          .single()

        if (order) {
          await supabase
            .from('orders')
            .update({ status: 'refunded' })
            .eq('id', order.id)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
