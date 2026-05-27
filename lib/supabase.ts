import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>

let _supabase: SupabaseClient | null = null

// Public client (uses anon key, subject to RLS) — lazily initialized
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

// For backwards-compat in client components — same as getSupabase()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = {
  get client() { return getSupabase() }
}

// Server-side admin client (bypasses RLS — only use in API routes/server components)
// We use `any` generic to keep query results flexible; routes cast to explicit types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
