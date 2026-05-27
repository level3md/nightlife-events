import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminSessionProvider from '@/components/admin/AdminSessionProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: { default: 'Admin', template: '%s — Admin' } }

// Middleware at middleware.ts already enforces that only authenticated
// users reach /admin/*. Session will always be non-null here.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <AdminSessionProvider session={session!}>
      <div className="flex min-h-screen bg-surface">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </AdminSessionProvider>
  )
}
