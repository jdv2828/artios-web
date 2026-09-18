'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EventChip } from './event-chip'
import type { CalendarAppointment, AppointmentStatus } from '@/lib/types'

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-warning/10 text-warning-foreground border-warning/30' },
  confirmed: { label: 'Confirmado', className: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  completed: { label: 'Completado', className: 'bg-muted text-muted-foreground border-muted' },
  no_show: { label: 'No asistió', className: 'bg-muted text-muted-foreground border-muted' },
}

interface AgendaViewProps {
  date: Date
  appointments: CalendarAppointment[]
  serviceMap: Map<number, string>
  employeeMap: Map<number, string>
  onAppointmentClick: (appointment: CalendarAppointment) => void
}

export function AgendaView({ date, appointments, serviceMap, employeeMap, onAppointmentClick }: AgendaViewProps) {
  const sorted = [...appointments]
    .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium capitalize">
        {format(date, "EEEE d 'de' MMMM", { locale: es })}
      </h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Sin turnos este día</p>
      ) : (
        sorted.map((apt) => {
          const config = statusConfig[apt.status]
          return (
            <button
              key={apt.id}
              type="button"
              onClick={() => onAppointmentClick(apt)}
              className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <EventChip
                      appointment={apt}
                      serviceName={serviceMap.get(apt.service_id) || `Servicio #${apt.service_id}`}
                    />
                    <Badge variant="outline" className={cn('text-[10px] capitalize shrink-0', config.className)}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {apt.client_name || `Cliente #${apt.client_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employeeMap.get(apt.employee_id || 0) || 'Sin asignar'}
                  </p>
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
