export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
})

// PATCH /api/admin/users/[userId] — update name, email, or password
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const updates: Record<string, string> = {}
  if (parsed.data.name) updates.name = parsed.data.name
  if (parsed.data.email) updates.email = parsed.data.email
  if (parsed.data.password) updates.password = await bcrypt.hash(parsed.data.password, 12)

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', params.userId)
    .select('id, name, email, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ user: data })
}

// DELETE /api/admin/users/[userId] — remove admin user
export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const currentUserId = (session.user as { id?: string })?.id
  if (currentUserId === params.userId) {
    return NextResponse.json({ error: "You can't remove your own account." }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Prevent removing the last admin
  const { count } = await supabase
    .from('admin_users')
    .select('id', { count: 'exact', head: true })

  if ((count ?? 0) <= 1) {
    return NextResponse.json({ error: 'Cannot remove the last admin account.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', params.userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
