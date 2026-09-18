'use client'

import { useMemo } from 'react'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CalendarAppointment, AppointmentStatus } from '@/lib/types'

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  completed: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  no_show: { label: 'No asistió', className: 'bg-stone-100 text-stone-600 border-stone-200' },
}

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 0..23

interface DayViewProps {
  date: Date
  appointments: CalendarAppointment[]
  serviceMap: Map<number, string>
  employeeMap: Map<number, string>
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

export function DayView({ date, appointments, serviceMap, employeeMap, onAppointmentClick }: DayViewProps) {
  const dateKey = format(date, 'yyyy-MM-dd')

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.scheduled_at.slice(0, 10) === dateKey && a.status !== 'cancelled' && a.status !== 'no_show')
      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
  }, [appointments, dateKey])

  const byHour = useMemo(() => {
    const map = new Map<number, CalendarAppointment[]>()
    for (const apt of dayAppointments) {
      const hour = parseInt(apt.scheduled_at.slice(11, 13), 10)
      const list = map.get(hour) || []
      list.push(apt)
      map.set(hour, list)
    }
    return map
  }, [dayAppointments])

  const dayLabel = isToday(date) ? 'Hoy' : format(date, 'EEEE', { locale: es })

  return (
    <div>
      <h3 className="text-sm font-medium capitalize mb-3">
        {dayLabel}, {format(date, "d 'de' MMMM", { locale: es })}
      </h3>

      {dayAppointments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Sin turnos este día</p>
      ) : (
        <div className="space-y-px">
          {HOURS.map((hour) => {
            const apts = byHour.get(hour) || []
            if (apts.length === 0) return null

            return (
              <div key={hour} className="flex gap-3">
                {/* Time gutter */}
                <div className="w-14 shrink-0 text-xs text-muted-foreground text-right pt-1">
                  {String(hour).padStart(2, '0')}:00
                </div>

                {/* Appointments for this hour */}
                <div className="flex-1 space-y-1 py-1">
                  {apts.map((apt) => {
                    const config = statusConfig[apt.status]
                    return (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => onAppointmentClick(apt)}
                        className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {apt.scheduled_at.slice(11, 16)}
                          </span>
                          <Badge variant="outline" className={cn('text-[10px] capitalize shrink-0', config.className)}>
                            {config.label}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium">
                          {serviceMap.get(apt.service_id) || `Servicio #${apt.service_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {apt.client_name || `Cliente #${apt.client_id}`}
                          {apt.employee_id ? ` · ${employeeMap.get(apt.employee_id) || `Profesional #${apt.employee_id}`}` : ''}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
