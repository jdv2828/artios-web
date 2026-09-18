'use client'

import { useMemo, useState } from 'react'
import { format, startOfWeek, addDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { EventChip } from './event-chip'
import type { CalendarAppointment } from '@/lib/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0..23
const MAX_VISIBLE = 3

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface WeekViewProps {
  referenceDate: Date
  appointments: CalendarAppointment[]
  serviceMap: Map<number, string>
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

export function WeekView({ referenceDate, appointments, serviceMap, onAppointmentClick }: WeekViewProps) {
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set())

  const weekDays = useMemo(() => {
    const start = startOfWeek(referenceDate, { weekStartsOn: 0 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [referenceDate])

  // Group appointments by date key → hour
  const bySlot = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    for (const apt of appointments) {
      if (apt.status === 'cancelled' || apt.status === 'no_show') continue
      const dateKey = apt.scheduled_at.slice(0, 10)
      const hour = parseInt(apt.scheduled_at.slice(11, 13), 10)
      const slotKey = `${dateKey}:${hour}`
      const list = map.get(slotKey) || []
      list.push(apt)
      map.set(slotKey, list)
    }
    return map
  }, [appointments])

  const toggleExpand = (key: string) => {
    setExpandedSlots((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div />
          {weekDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const today = isToday(day)
            return (
              <div key={key} className={cn('p-2 text-center border-r last:border-r-0', today && 'bg-accent/30')}>
                <div className="text-xs text-muted-foreground">{DAY_LABELS[day.getDay()]}</div>
                <div className={cn('text-sm font-medium', today && 'text-primary font-bold')}>
                  {format(day, 'd', { locale: es })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="border-r border-b px-1 py-2 text-xs text-muted-foreground text-right">
                {String(hour).padStart(2, '0')}:00
              </div>
              {/* Day cells for this hour */}
              {weekDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const slotKey = `${dateKey}:${hour}`
                const apts = bySlot.get(slotKey) || []
                const isExpanded = expandedSlots.has(slotKey)
                const visible = isExpanded ? apts : apts.slice(0, MAX_VISIBLE)
                const hidden = apts.length - MAX_VISIBLE

                return (
                  <div key={slotKey} className="border-r border-b last:border-r-0 p-0.5 min-h-[32px]">
                    {visible.map((apt) => (
                      <EventChip
                        key={apt.id}
                        appointment={apt}
                        serviceName={serviceMap.get(apt.service_id) || `Servicio #${apt.service_id}`}
                        onClick={() => onAppointmentClick(apt)}
                      />
                    ))}
                    {hidden > 0 && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(slotKey)}
                        className="w-full text-[10px] text-muted-foreground hover:text-foreground py-0.5"
                      >
                        +{hidden} más
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
