import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
}

export default function Card({ children, className, glass, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        glass
          ? 'bg-surface-1/60 backdrop-blur-sm border-white/10'
          : 'bg-surface-1 border-surface-3',
        hover && 'transition-all duration-300 hover:border-brand-purple/50 hover:shadow-brand',
        className
      )}
    >
      {children}
    </div>
  )
}
