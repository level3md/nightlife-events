'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-4 rounded-2xl bg-surface-1/80 backdrop-blur-md border border-white/10 shadow-glass">
          <nav className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-brand group-hover:shadow-pink transition-shadow">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                PULSE<span className="text-brand-purple-light">EVENTS</span>
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/events">Events</NavLink>
              <NavLink href="/events?filter=vip">VIP Packages</NavLink>
              <NavLink href="/#about">About</NavLink>
              <Link
                href="/events"
                className="ml-2 px-5 py-2 rounded-lg bg-gradient-brand text-white text-sm font-semibold hover:opacity-90 transition shadow-brand"
              >
                Get Tickets
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden text-gray-300 hover:text-white p-1"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-3">
              <MobileLink href="/events" onClick={() => setOpen(false)}>Events</MobileLink>
              <MobileLink href="/events?filter=vip" onClick={() => setOpen(false)}>VIP Packages</MobileLink>
              <MobileLink href="/#about" onClick={() => setOpen(false)}>About</MobileLink>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="mt-1 w-full text-center px-5 py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-semibold"
              >
                Get Tickets
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-300 hover:text-white transition-colors font-medium"
    >
      {children}
    </Link>
  )
}

function MobileLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-gray-300 hover:text-white font-medium border-b border-surface-3 last:border-0"
    >
      {children}
    </Link>
  )
}
