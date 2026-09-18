'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { CalendarAppointment, EmployeeSummary } from '@/lib/types'

interface ReschedulePickerProps {
  appointment: CalendarAppointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: EmployeeSummary[]
  onSuccess: () => void
}

export function ReschedulePicker({ appointment, open, onOpenChange, employees, onSuccess }: ReschedulePickerProps) {
  const [date, setDate] = useState('')
  const [employeeId, setEmployeeId] = useState<number | ''>(appointment?.employee_id || '')
  const [error, setError] = useState('')

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment && open) {
      setDate(appointment.scheduled_at.slice(0, 10))
      setEmployeeId(appointment.employee_id || '')
      setError('')
    }
  }, [appointment?.id, open])

  const { data: availabilityData, isLoading: loadingSlots } = useQuery({
    queryKey: ['availability', appointment?.service_id, date, employeeId],
    queryFn: () => api.getAvailability(appointment!.service_id, date),
    enabled: !!appointment && !!date && open,
  })

  const slots = availabilityData?.data || []

  const handleReschedule = async (time: string) => {
    if (!appointment || !employeeId) return
    setError('')
    try {
      const scheduledAt = `${date} ${time}:00`
      await api.rescheduleAppointment(appointment.id, { scheduled_at: scheduledAt, employee_id: employeeId as number })
      onOpenChange(false)
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Error al reprogramar'
      setError(msg)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reprogramar turno</SheetTitle>
          <SheetDescription>
            Turno #{appointment?.id} — {appointment?.scheduled_at.slice(0, 10)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Profesional</label>
            <Select
              value={employeeId ? String(employeeId) : ''}
              onValueChange={(v) => { setEmployeeId(v ? Number(v) : ''); setError('') }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha</label>
            <Input
              type="date"
              value={date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => { setDate(e.target.value); setError('') }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {date && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Horarios disponibles</label>
              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Cargando horarios...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                  {slots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={slot.available ? 'outline' : 'ghost'}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => handleReschedule(slot.time)}
                      className={cn(!slot.available && 'line-through opacity-50')}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
