'use client'

import { useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { DayCell } from './day-cell'
import type { CalendarAppointment } from '@/lib/types'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface CalendarGridProps {
  currentMonth: Date
  appointments: CalendarAppointment[]
  serviceMap: Map<number, string>
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

export function CalendarGrid({ currentMonth, appointments, serviceMap, onAppointmentClick }: CalendarGridProps) {
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    for (const apt of appointments) {
      const dateKey = apt.scheduled_at.slice(0, 10)
      const list = map.get(dateKey) || []
      list.push(apt)
      map.set(dateKey, list)
    }
    return map
  }, [appointments])

  const visibleByDate = useMemo(() => {
    const map = new Map<string, CalendarAppointment[]>()
    for (const [dateKey, list] of appointmentsByDate) {
      map.set(
        dateKey,
        list.filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
      )
    }
    return map
  }, [appointmentsByDate])

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="p-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0">
            {label}
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayAppointments = visibleByDate.get(dateKey) || []
          return (
            <DayCell
              key={dateKey}
              date={day}
              isCurrentMonth={isSameMonth(day, currentMonth)}
              isToday={isToday(day)}
              appointments={dayAppointments}
              serviceMap={serviceMap}
              onAppointmentClick={onAppointmentClick}
            />
          )
        })}
      </div>
    </div>
  )
}
