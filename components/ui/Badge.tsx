import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'vip' | 'sold-out' | 'draft' | 'published' | 'cancelled' | 'past' | 'featured'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-3 text-gray-300 border border-surface-4',
    vip: 'bg-gradient-gold text-black font-bold',
    'sold-out': 'bg-red-900/50 text-red-300 border border-red-800',
    draft: 'bg-yellow-900/50 text-yellow-300 border border-yellow-800',
    published: 'bg-green-900/50 text-green-300 border border-green-800',
    cancelled: 'bg-red-900/50 text-red-300 border border-red-800',
    past: 'bg-surface-3 text-gray-500 border border-surface-4',
    featured: 'bg-gradient-brand text-white',
  }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
