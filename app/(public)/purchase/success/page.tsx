import Link from 'next/link'
import { CheckCircle, Mail, Calendar, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Purchase Successful' }

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      {/* Glow background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center">
        {/* Success icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          You&apos;re In! 🎉
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Your tickets have been secured. Get ready for an unforgettable night.
        </p>

        {/* Info cards */}
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-start gap-4 bg-surface-1 border border-surface-3 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-brand-purple/20 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-brand-purple-light" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Confirmation Email Sent</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Check your inbox for your receipt and ticket details. Check spam if you don&apos;t see it within a few minutes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-surface-1 border border-surface-3 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-brand-purple/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-brand-purple-light" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Add to Calendar</p>
              <p className="text-gray-400 text-sm mt-0.5">
                Don&apos;t forget — save the date and set a reminder so you don&apos;t miss out.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold hover:opacity-90 transition"
          >
            Browse More Events
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-surface-4 text-gray-300 hover:text-white font-medium transition"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          Questions? Contact us at{' '}
          <a href="mailto:support@pulseevents.com" className="text-brand-purple-light hover:underline">
            support@pulseevents.com
          </a>
        </p>
      </div>
    </div>
  )
}
