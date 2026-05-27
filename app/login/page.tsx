'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { LogIn } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password.')
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <Image src="/logo.svg" alt="Le Rendezvous Atlanta" fill className="object-contain drop-shadow-[0_0_20px_rgba(201,168,76,0.4)]" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white tracking-wide">Admin Login</h1>
        <p className="text-brand-gold/70 text-xs mt-1 tracking-widest uppercase">Le Rendezvous Atlanta</p>
      </div>

      <div className="bg-surface-1 border border-brand-gold/20 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
