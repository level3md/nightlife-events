// Auto-generated-style type definitions for Supabase tables.
// Extend as your schema evolves.

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
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
          status: 'draft' | 'published' | 'cancelled' | 'past'
          featured: boolean
          age_restriction: string | null
          dress_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      ticket_tiers: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['ticket_tiers']['Row'], 'id' | 'created_at' | 'updated_at' | 'quantity_sold'>
        Update: Partial<Database['public']['Tables']['ticket_tiers']['Insert']>
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          customer_email: string
          customer_name: string | null
          status: 'pending' | 'paid' | 'failed' | 'refunded'
          total_cents: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          ticket_tier_id: string
          quantity: number
          unit_price_cents: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password: string
          name: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
    }
  }
}
