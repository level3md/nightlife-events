export type EventStatus = 'draft' | 'published' | 'cancelled' | 'past'

export interface Event {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  venue: string
  venue_address: string | null
  event_date: string
  doors_open: string | null
  image_url: string | null
  status: EventStatus
  featured: boolean
  age_restriction: string | null
  dress_code: string | null
  created_at: string
  updated_at: string
  ticket_tiers?: TicketTier[]
}

export interface TicketTier {
  id: string
  event_id: string
  name: string
  description: string | null
  price_cents: number
  quantity_total: number
  quantity_sold: number
  is_vip: boolean
  perks: string[] | null
  stripe_price_id: string | null
  sort_order: number
  sale_starts_at: string | null
  sale_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  customer_email: string
  customer_name: string | null
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  total_cents: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  ticket_tier_id: string
  quantity: number
  unit_price_cents: number
  created_at: string
  ticket_tiers?: TicketTier
}

export type FeeType = 'none' | 'percentage' | 'flat' | 'both'

export interface FeeSettings {
  fee_type: FeeType
  fee_percentage: number   // e.g. 3.5 means 3.5%
  fee_flat_cents: number   // e.g. 150 means $1.50
  fee_label: string        // e.g. "Service Fee"
}

// Cart state managed client-side before checkout
export interface CartItem {
  tierId: string
  tierName: string
  eventName: string
  eventSlug: string
  priceCents: number
  quantity: number
  isVip: boolean
}

// Checkout request body
export interface CheckoutPayload {
  eventId: string
  items: Array<{ tierId: string; quantity: number }>
  customerEmail?: string
}
