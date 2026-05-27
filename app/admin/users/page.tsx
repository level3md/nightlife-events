export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase'
import AdminUsersClient from '@/components/admin/AdminUsersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Users — Le Rendezvous Atlanta' }

export default async function AdminUsersPage() {
  const supabase = createAdminClient()
  const { data: users } = await supabase
    .from('admin_users')
    .select('id, name, email, created_at')
    .order('created_at', { ascending: true })

  return <AdminUsersClient initialUsers={users ?? []} />
}
