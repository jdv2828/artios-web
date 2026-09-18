'use client'

import { cn } from '@/lib/utils'
import { EventChip } from './event-chip'
import type { CalendarAppointment } from '@/lib/types'

interface DayCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  appointments: CalendarAppointment[]
  serviceMap: Map<number, string>
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

export function DayCell({ date, isCurrentMonth, isToday, appointments, serviceMap, onAppointmentClick }: DayCellProps) {
  const dayNumber = date.getDate()

  return (
    <div
      className={cn(
        'min-h-[80px] md:min-h-[100px] border-b border-r p-1',
        !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
        isToday && 'bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-xs font-medium',
            isToday && 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center',
            !isCurrentMonth && 'text-muted-foreground'
          )}
        >
          {dayNumber}
        </span>
      </div>
      <div className="space-y-0.5">
        {appointments.map((apt) => (
          <EventChip
            key={apt.id}
            appointment={apt}
            serviceName={serviceMap.get(apt.service_id) || `Servicio #${apt.service_id}`}
            onClick={() => onAppointmentClick(apt)}
          />
        ))}
      </div>
    </div>
  )
}
