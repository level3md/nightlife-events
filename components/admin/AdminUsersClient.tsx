'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { UserPlus, Trash2, Pencil, Check, X, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface AdminUser {
  id: string
  name: string | null
  email: string
  created_at: string
}

interface AdminUsersClientProps {
  initialUsers: AdminUser[]
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const { data: session } = useSession()
  const currentUserId = (session?.user as { id?: string })?.id

  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [showAddForm, setShowAddForm] = useState(false)

  const handleUserAdded = (user: AdminUser) => {
    setUsers((prev) => [...prev, user])
    setShowAddForm(false)
  }

  const handleUserUpdated = (user: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)))
  }

  const handleUserDeleted = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} admin{users.length !== 1 ? 's' : ''} with access</p>
        </div>
        {!showAddForm && (
          <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
            <UserPlus className="w-3.5 h-3.5" />
            Add Admin
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Add admin form */}
        {showAddForm && (
          <div className="bg-surface-1 border border-brand-gold/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">New Admin User</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <AddAdminForm onAdded={handleUserAdded} onCancel={() => setShowAddForm(false)} />
          </div>
        )}

        {/* Users list */}
        <div className="bg-surface-1 border border-surface-3 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-surface-3">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Current Admins</h2>
          </div>

          {users.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">No admin users found.</p>
          ) : (
            <div className="divide-y divide-surface-3">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelf={user.id === currentUserId}
                  onUpdated={handleUserUpdated}
                  onDeleted={handleUserDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Admin Form ───────────────────────────────────────────────────────────

function AddAdminForm({
  onAdded,
  onCancel,
}: {
  onAdded: (user: AdminUser) => void
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required.')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to create user')
      toast.success(`${data.user.name} added as admin.`)
      onAdded(data.user)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full Name *"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Jane Smith"
          autoComplete="off"
        />
        <Input
          label="Email Address *"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jane@example.com"
          autoComplete="off"
        />
      </div>
      <div className="relative">
        <Input
          label="Password * (min 8 characters)"
          type={showPw ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-9 text-gray-500 hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1.5"
        >
          Cancel
        </button>
        <Button type="submit" variant="primary" size="sm" loading={saving}>
          <UserPlus className="w-3.5 h-3.5" />
          Add Admin
        </Button>
      </div>
    </form>
  )
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({
  user,
  isSelf,
  onUpdated,
  onDeleted,
}: {
  user: AdminUser
  isSelf: boolean
  onUpdated: (user: AdminUser) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const [form, setForm] = useState({
    name: user.name ?? '',
    email: user.email,
    password: '',
  })
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.error('Name and email are required.')
      return
    }
    if (form.password && form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, string> = { name: form.name, email: form.email }
      if (form.password) body.password = form.password
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to update')
      onUpdated(data.user as AdminUser)
      setEditing(false)
      setForm((p) => ({ ...p, password: '' }))
      toast.success('Admin updated.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Remove "${user.name ?? user.email}" as an admin? They will immediately lose access.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Failed to delete')
      onDeleted(user.id)
      toast.success('Admin removed.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Collapsed row */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center shrink-0">
            <span className="text-brand-blue-light text-sm font-bold uppercase">
              {(user.name ?? user.email).charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium truncate">{user.name ?? '—'}</p>
              {isSelf && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/25 shrink-0">
                  You
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-gray-600 text-xs hidden sm:block">
            Added {formatDate(user.created_at)}
          </span>
          <button
            onClick={() => setEditing((v) => !v)}
            title={editing ? 'Cancel edit' : 'Edit admin'}
            className={`transition-colors ${editing ? 'text-brand-gold' : 'text-gray-600 hover:text-brand-gold'}`}
          >
            {editing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || isSelf}
            title={isSelf ? "Can't remove your own account" : 'Remove admin'}
            className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <div className="border-t border-surface-3 bg-surface-2 px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Jane Smith"
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="relative">
            <Input
              label="New Password (leave blank to keep current)"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
              hint="Min 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              Password is stored as a bcrypt hash
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setEditing(false); setForm({ name: user.name ?? '', email: user.email, password: '' }) }}
                className="text-sm text-gray-500 hover:text-white transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
              <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
