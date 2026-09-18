
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Filter, Eye, MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react'

import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AdminLayout } from '@/components/admin-layout'
import { toast } from 'sonner'
import { STATUS_TRANSITIONS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import type { Appointment, AppointmentStatus, EmployeeSummary } from '@/lib/types'

type AppointmentFiltersState = {
  scheduled_date: string
  status: AppointmentStatus | ''
  client_dni: string
  client_name: string
  employee_id?: number | ''
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  completed: { label: 'Completado', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  no_show: { label: 'No asistió', className: 'bg-stone-100 text-stone-600 border-stone-200' },
}

const statusOptions: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Agendado' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'no_show', label: 'No asistió' },
]

export default function AppointmentsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [filters, setFilters] = useState<AppointmentFiltersState>(() => ({
    scheduled_date: isAdmin ? '' : format(new Date(), 'yyyy-MM-dd'),
    status: '',
    client_dni: '',
    client_name: '',
    employee_id: isAdmin ? '' : undefined,
  }))
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!user) return

    if (user.role === 'admin') {
      setFilters((prev) => {
        // If we initialized before auth loaded, drop the default "today" filter for admins.
        const nextScheduledDate = prev.scheduled_date === format(new Date(), 'yyyy-MM-dd') ? '' : prev.scheduled_date
        const nextEmployeeId = prev.employee_id === undefined ? '' : prev.employee_id
        if (nextScheduledDate === prev.scheduled_date && nextEmployeeId === prev.employee_id) return prev
        return { ...prev, scheduled_date: nextScheduledDate, employee_id: nextEmployeeId }
      })
    }
  }, [user])

  const { data: servicesData } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.getServices(),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees(),
    enabled: isAdmin,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', filters],
    queryFn: () => api.getAppointments({ ...filters, per_page: 100 }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => api.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['today-appointments'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Estado actualizado')
    },
    onError: () => {
      toast.error('No se pudo cambiar el estado del turno')
    },
  })

  const services = servicesData?.data || []
  const appointments = data?.data || []
  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service.name])), [services])
  const employeeMap = useMemo(
    () => new Map<number, EmployeeSummary>((employeesData?.data || []).map((e) => [e.id, e])),
    [employeesData]
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turnos</h1>
          <p className="text-muted-foreground">{isAdmin ? 'Gestioná todos los turnos del sistema' : 'Gestioná tus turnos'}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Filtros:</span></div>
              <div className="flex flex-1 flex-wrap gap-3">
                <Input type="date" value={filters.scheduled_date} onChange={(e) => setFilters({ ...filters, scheduled_date: e.target.value })} className="w-auto" />
                {isAdmin && (
                  <Select
                    value={filters.employee_id ? String(filters.employee_id) : 'all'}
                    onValueChange={(value) =>
                      setFilters({ ...filters, employee_id: value === 'all' ? '' : Number(value) })
                    }
                  >
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Profesional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los profesionales</SelectItem>
                      {(employeesData?.data || []).map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : (value as AppointmentStatus) })}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {statusOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="DNI cliente"
                  value={filters.client_dni}
                  onChange={(e) => setFilters({ ...filters, client_dni: e.target.value })}
                  className="w-[180px]"
                />
                <Input
                  placeholder="Nombre cliente"
                  value={filters.client_name}
                  onChange={(e) => setFilters({ ...filters, client_name: e.target.value })}
                  className="w-[180px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sin turnos</h3>
                <p className="text-muted-foreground">No hay turnos para los filtros seleccionados</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horario</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Servicio</TableHead>
                    {isAdmin && <TableHead>Profesional</TableHead>}
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const config = statusConfig[appointment.status]
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">{appointment.scheduled_at.slice(11, 16)}</div>
                          <div className="text-sm text-muted-foreground">{format(new Date(appointment.scheduled_at), 'd MMM', { locale: es })}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{appointment.client_name || `Cliente #${appointment.client_id}`}</div>
                          <div className="text-sm text-muted-foreground">
                            DNI: <span className="font-mono">{appointment.client_dni || '-'}</span> · ID: #{appointment.client_id}
                          </div>
                        </TableCell>
                        <TableCell>{serviceMap.get(appointment.service_id) || `Servicio #${appointment.service_id}`}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {appointment.employee_id ? (employeeMap.get(appointment.employee_id)?.name || `#${appointment.employee_id}`) : 'Sin asignar'}
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge variant="outline" className={cn('capitalize', config.className)}>{config.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedAppointment(appointment)}>
                                <Eye className="mr-2 h-4 w-4" /> Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(STATUS_TRANSITIONS[appointment.status] || []).map((opt) => (
                                <DropdownMenuItem key={opt.value} onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: opt.value })}>
                                  Marcar como {opt.label.toLowerCase()}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <SheetContent>
          {selectedAppointment && (() => {
            const config = statusConfig[selectedAppointment.status]
            return (
              <>
                <SheetHeader>
                  <SheetTitle>Detalle del turno</SheetTitle>
                  <SheetDescription>Turno #{selectedAppointment.id}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge variant="outline" className={cn('capitalize', config.className)}>{config.label}</Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span className="capitalize">{format(new Date(selectedAppointment.scheduled_at), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span></div>
                    <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-muted-foreground" /><span>{selectedAppointment.scheduled_at.slice(11, 16)}</span></div>
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{selectedAppointment.client_name || `Cliente #${selectedAppointment.client_id}`}</div>
                        <div className="text-xs text-muted-foreground">
                          DNI: <span className="font-mono">{selectedAppointment.client_dni || '-'}</span> · ID: #{selectedAppointment.client_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3"><Eye className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="font-medium">{serviceMap.get(selectedAppointment.service_id) || `Servicio #${selectedAppointment.service_id}`}</div></div></div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Recordatorios</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>1 día antes: {selectedAppointment.reminders.remind_1_day_before ? 'Sí' : 'No'}</p>
                      <p>30 minutos antes: {selectedAppointment.reminders.remind_30_mins_before ? 'Sí' : 'No'}</p>
                      <p>1 hora antes: {selectedAppointment.reminders.remind_1_hour_before ? 'Sí' : 'No'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Cambiar estado</h4>
                    <div className="flex flex-wrap gap-2">
                      {(STATUS_TRANSITIONS[selectedAppointment.status] || []).map((opt) => (
                        <Button key={opt.value} variant="outline" size="sm" onClick={() => { updateStatusMutation.mutate({ id: selectedAppointment.id, status: opt.value }); setSelectedAppointment({ ...selectedAppointment, status: opt.value }) }} disabled={updateStatusMutation.isPending}>
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  )
}
