/**
 * Creates the initial admin user.
 * Run with: npx ts-node -r tsconfig-paths/register scripts/seed-admin.ts
 * Or: npx tsx scripts/seed-admin.ts
 *
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set.
 */
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!url || !key || !email || !password) {
    console.error('Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD')
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const hashed = await bcrypt.hash(password, 12)

  const { data, error } = await supabase
    .from('admin_users')
    .upsert({ email, password: hashed, name: 'Admin' }, { onConflict: 'email' })
    .select()

  if (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }

  console.log(`✅ Admin user created/updated: ${email}`)
}

main()
