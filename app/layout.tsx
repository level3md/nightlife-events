import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'PulseEvents — Premium Nightlife & Events',
    template: '%s | PulseEvents',
  },
  description: 'The premier destination for curated nightlife experiences. From underground electronic nights to exclusive rooftop soirées.',
  keywords: ['events', 'nightlife', 'tickets', 'VIP', 'parties', 'electronic music'],
  openGraph: {
    type: 'website',
    siteName: 'PulseEvents',
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
              background: '#1a1a24',
              color: '#fff',
              border: '1px solid #2e2e40',
            },
            success: {
              iconTheme: { primary: '#a855f7', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
