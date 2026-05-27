'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Calendar, Ticket, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/events', label: 'Events', icon: Calendar, exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-1 border-r border-surface-3 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-brand-gold/20">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative w-9 h-9 shrink-0">
            <Image src="/logo.svg" alt="LRV" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <p className="text-brand-gold font-semibold text-xs tracking-widest uppercase">Le Rendezvous</p>
            <p className="text-brand-gold/60 text-xs tracking-widest uppercase">Atlanta · Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/30'
                  : 'text-gray-400 hover:text-brand-gold-light hover:bg-surface-2'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-3 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Ticket className="w-4 h-4" />
          View Public Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
