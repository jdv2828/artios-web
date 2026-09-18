'use client'

import { cn } from '@/lib/utils'
import type { CalendarAppointment } from '@/lib/types'

const SERVICE_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
]

export function getServiceColor(serviceId: number): string {
  return SERVICE_COLORS[(serviceId - 1) % SERVICE_COLORS.length]
}

interface EventChipProps {
  appointment: CalendarAppointment
  serviceName: string
  onClick?: () => void
}

export function EventChip({ appointment, serviceName, onClick }: EventChipProps) {
  const time = appointment.scheduled_at.slice(11, 16)
  const isConfirmed = appointment.status === 'confirmed'
  const isCompleted = appointment.status === 'completed'
  const className = cn(
    'w-full text-left rounded border px-1.5 py-0.5 text-[11px] leading-tight truncate transition-colors cursor-pointer',
    getServiceColor(appointment.service_id),
    isConfirmed && 'ring-1 ring-emerald-300',
    isCompleted && 'ring-2 ring-emerald-400',
    onClick && 'hover:opacity-80'
  )
  const content = (
    <>
      <span className="font-medium">{time}</span>
      <span className="ml-1">{serviceName}</span>
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}
