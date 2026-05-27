import Link from 'next/link'
import { Zap, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-surface-2 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                PULSE<span className="text-brand-purple-light">EVENTS</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              The premier destination for curated nightlife experiences. From underground electronic nights to exclusive rooftop soirées.
            </p>
            <div className="flex gap-4 mt-4">
              <SocialLink href="#" label="Instagram"><Instagram className="w-4 h-4" /></SocialLink>
              <SocialLink href="#" label="Twitter"><Twitter className="w-4 h-4" /></SocialLink>
              <SocialLink href="#" label="Facebook"><Facebook className="w-4 h-4" /></SocialLink>
            </div>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Events</h3>
            <ul className="space-y-2">
              {[
                ['All Events', '/events'],
                ['VIP Packages', '/events?filter=vip'],
                ['This Weekend', '/events?filter=weekend'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Info</h3>
            <ul className="space-y-2">
              {[
                ['About Us', '/#about'],
                ['Contact', '/#contact'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-surface-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} PulseEvents. All rights reserved.</p>
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
      className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-3 transition-colors"
    >
      {children}
    </a>
  )
}
