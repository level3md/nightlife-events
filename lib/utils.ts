import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function getInventoryStatus(sold: number, total: number) {
  const remaining = total - sold
  const pct = remaining / total
  if (remaining === 0) return { label: 'Sold Out', color: 'text-red-400', urgent: true }
  if (pct <= 0.1) return { label: `Only ${remaining} left!`, color: 'text-red-400', urgent: true }
  if (pct <= 0.25) return { label: `${remaining} remaining`, color: 'text-yellow-400', urgent: true }
  return { label: `${remaining} available`, color: 'text-green-400', urgent: false }
}
