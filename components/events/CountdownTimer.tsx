'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const isOver = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (!mounted) return null

  if (isOver) {
    return (
      <div className="text-center py-4">
        <p className="text-brand-purple-light font-bold text-lg">This event is happening now!</p>
      </div>
    )
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-4">
          <div className="text-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-surface-2 border border-surface-3 rounded-xl flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1 block">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-brand-purple text-xl font-bold pb-5">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
