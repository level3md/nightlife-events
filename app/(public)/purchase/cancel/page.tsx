import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Purchase Cancelled' }

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-20 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Purchase Cancelled</h1>
        <p className="text-gray-400 mb-8">
          No worries — your payment was not processed and no charges were made. The tickets are still available.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    </div>
  )
}
