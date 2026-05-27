import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-brand-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/logo.svg"
                  alt="Le Rendezvous Atlanta"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
              <div className="leading-tight">
                <p className="text-brand-gold font-display font-semibold tracking-widest uppercase text-sm">
                  Le Rendezvous
                </p>
                <p className="text-brand-gold-light text-xs tracking-[0.2em] uppercase">
                  Atlanta
                </p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Atlanta&apos;s premier destination for curated nightlife experiences. From exclusive table reservations to unforgettable bottle service nights.
            </p>
            <div className="flex gap-4 mt-4">
              <SocialLink href="#" label="Instagram"><Instagram className="w-4 h-4" /></SocialLink>
              <SocialLink href="#" label="Twitter"><Twitter className="w-4 h-4" /></SocialLink>
              <SocialLink href="#" label="Facebook"><Facebook className="w-4 h-4" /></SocialLink>
            </div>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-brand-gold font-semibold mb-3 text-xs uppercase tracking-widest">Events</h3>
            <ul className="space-y-2">
              {[
                ['All Events',    '/events'],
                ['VIP Packages',  '/events?filter=vip'],
                ['This Weekend',  '/events?filter=weekend'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-brand-gold-light text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-brand-gold font-semibold mb-3 text-xs uppercase tracking-widest">Info</h3>
            <ul className="space-y-2">
              {[
                ['About Us',        '/#about'],
                ['Contact',         '/#contact'],
                ['Privacy Policy',  '/privacy'],
                ['Terms of Service','/terms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-brand-gold-light text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-brand-gold/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Le Rendezvous Atlanta. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Payments secured by Stripe</p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 rounded-lg bg-surface-2 border border-brand-gold/20 flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold/50 transition-colors"
    >
      {children}
    </a>
  )
}
