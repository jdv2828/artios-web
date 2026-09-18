'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { CalendarAppointment, AppointmentStatus } from '@/lib/types'
import { STATUS_TRANSITIONS } from '@/lib/types'

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  completed: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  no_show: { label: 'No asistió', className: 'bg-stone-100 text-stone-600 border-stone-200' },
}

interface DetailPanelProps {
  appointment: CalendarAppointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceMap: Map<number, string>
  employeeMap: Map<number, string>
  onStatusChange: (id: number, status: AppointmentStatus) => void
  onReschedule: (appointment: CalendarAppointment) => void
  isUpdating?: boolean
}

export function DetailPanel({ appointment, open, onOpenChange, serviceMap, employeeMap, onStatusChange, onReschedule, isUpdating }: DetailPanelProps) {
  if (!appointment) return null

  const config = statusConfig[appointment.status]
  const transitions = STATUS_TRANSITIONS[appointment.status]
  const canReschedule = appointment.status === 'scheduled' || appointment.status === 'confirmed'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalle del turno</SheetTitle>
          <SheetDescription>Turno #{appointment.id}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge variant="outline" className={cn('capitalize', config.className)}>{config.label}</Badge>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="capitalize">{format(new Date(appointment.scheduled_at), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.scheduled_at.slice(11, 16)} hs</span>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{appointment.client_name || `Cliente #${appointment.client_id}`}</div>
                <div className="text-xs text-muted-foreground">
                  DNI: <span className="font-mono">{appointment.client_dni || '-'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{serviceMap.get(appointment.service_id) || `Servicio #${appointment.service_id}`}</div>
                {appointment.employee_id && (
                  <div className="text-xs text-muted-foreground">
                    Profesional: {employeeMap.get(appointment.employee_id) || `#${appointment.employee_id}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Recordatorios</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>1 día antes: {appointment.reminders.remind_1_day_before ? 'Sí' : 'No'}</p>
              <p>1 hora antes: {appointment.reminders.remind_1_hour_before ? 'Sí' : 'No'}</p>
              <p>30 minutos antes: {appointment.reminders.remind_30_mins_before ? 'Sí' : 'No'}</p>
            </div>
          </div>

          <Separator />

          {transitions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Cambiar estado</h4>
              <div className="flex flex-wrap gap-2">
                {transitions.map((t) => (
                  <Button
                    key={t.value}
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(appointment.id, t.value)}
                    disabled={isUpdating}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {canReschedule && (
            <Button variant="outline" className="w-full" onClick={() => onReschedule(appointment)}>
              Reprogramar turno
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
