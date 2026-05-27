import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default:  'Le Rendezvous Atlanta — Premium Nightlife & Events',
    template: '%s | Le Rendezvous Atlanta',
  },
  description: "Atlanta's premier destination for curated nightlife experiences. Exclusive table reservations, VIP bottle service, and unforgettable events.",
  keywords: ['events', 'nightlife', 'Atlanta', 'VIP', 'bottle service', 'table reservations', 'Le Rendezvous'],
  openGraph: {
    type:     'website',
    siteName: 'Le Rendezvous Atlanta',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0D0F1A',
              color: '#fff',
              border: '1px solid rgba(201,168,76,0.3)',
            },
            success: {
              iconTheme: { primary: '#C9A84C', secondary: '#0D0F1A' },
            },
          }}
        />
      </body>
    </html>
  )
}
