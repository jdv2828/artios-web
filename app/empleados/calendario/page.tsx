'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addMonths, subMonths } from 'date-fns'
import { CalendarDays } from 'lucide-react'

import { api } from '@/lib/api'
import { AdminLayout } from '@/components/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { useIsMobile } from '@/components/ui/use-mobile'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { MonthNav } from '@/components/calendar/month-nav'
import { CalendarGrid } from '@/components/calendar/calendar-grid'
import { AgendaView } from '@/components/calendar/agenda-view'
import { ViewToggle, type ViewMode } from '@/components/calendar/view-toggle'
import { WeekView } from '@/components/calendar/week-view'
import { DayView } from '@/components/calendar/day-view'
import { DetailPanel } from '@/components/calendar/detail-panel'
import { ReschedulePicker } from '@/components/calendar/reschedule-picker'
import type { CalendarAppointment, AppointmentStatus, EmployeeSummary } from '@/lib/types'

export default function CalendarPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()

  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<CalendarAppointment | null>(null)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'month'
    const stored = localStorage.getItem('calendar-view-mode')
    if (stored === 'month' || stored === 'week' || stored === 'day' || stored === 'agenda') return stored
    return isMobile ? 'agenda' : 'month'
  })

  // Mobile fallback: redirect week/month → agenda (don't overwrite localStorage).
  // month is the SSR default because isMobile is false on first render, so
  // first-time mobile visitors should land on agenda too.
  useEffect(() => {
    if (isMobile && (viewMode === 'week' || viewMode === 'month')) {
      setViewMode('agenda')
    }
  }, [isMobile, viewMode])

  const monthStart = format(currentMonth, 'yyyy-MM-01')
  const monthEnd = format(currentMonth, 'yyyy-MM-28') // safe end — query uses from/to

  const { data: servicesData } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.getServices(),
  })

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees(),
    enabled: isAdmin,
  })

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['admin-calendar', format(currentMonth, 'yyyy-MM'), filterEmployee, filterService],
    queryFn: () => api.getAppointmentsByDateRange(monthStart, format(addMonths(currentMonth, 1), 'yyyy-MM-01')),
    staleTime: 5 * 60 * 1000,
  })

  // Prefetch next/prev months
  const nextMonth = addMonths(currentMonth, 1)
  const prevMonth = subMonths(currentMonth, 1)
  useQuery({
    queryKey: ['admin-calendar', format(nextMonth, 'yyyy-MM'), filterEmployee, filterService],
    queryFn: () => api.getAppointmentsByDateRange(
      format(nextMonth, 'yyyy-MM-01'),
      format(addMonths(nextMonth, 1), 'yyyy-MM-01')
    ),
    staleTime: 5 * 60 * 1000,
  })
  useQuery({
    queryKey: ['admin-calendar', format(prevMonth, 'yyyy-MM'), filterEmployee, filterService],
    queryFn: () => api.getAppointmentsByDateRange(
      format(prevMonth, 'yyyy-MM-01'),
      format(currentMonth, 'yyyy-MM-01')
    ),
    staleTime: 5 * 60 * 1000,
  })

  const services = servicesData?.data || []
  const employees = employeesData?.data || []
  const allAppointments = appointmentsData?.data || []

  const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s.name])), [services])
  const employeeMap = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees])

  // Client-side filter
  const appointments = useMemo(() => {
    let filtered = allAppointments
    if (filterEmployee !== 'all') {
      filtered = filtered.filter((a) => a.employee_id === Number(filterEmployee))
    }
    if (filterService !== 'all') {
      filtered = filtered.filter((a) => a.service_id === Number(filterService))
    }
    return filtered
  }, [allAppointments, filterEmployee, filterService])

  // Appointments for selected day (mobile agenda)
  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return []
    const key = format(selectedDay, 'yyyy-MM-dd')
    return appointments.filter((a) => a.scheduled_at.slice(0, 10) === key)
  }, [selectedDay, appointments])

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AppointmentStatus }) => api.updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-calendar'] })
      setSelectedAppointment(null)
    },
  })

  const handleAppointmentClick = useCallback((apt: CalendarAppointment) => {
    setSelectedAppointment(apt)
  }, [])

  const handleRescheduleSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-calendar'] })
    setRescheduleAppointment(null)
    setSelectedAppointment(null)
  }, [queryClient])

  // Default selected day = today or first day with appointments
  const displayDay = selectedDay || new Date()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Calendario
          </h1>
          <p className="text-muted-foreground">
            {viewMode === 'month' && 'Vista mensual de turnos'}
            {viewMode === 'week' && 'Vista semanal de turnos'}
            {viewMode === 'day' && 'Vista diaria de turnos'}
            {viewMode === 'agenda' && 'Vista de agenda'}
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
              <div className="flex flex-wrap gap-3">
                {isAdmin && (
                  <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Profesional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los profesionales</SelectItem>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Servicio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los servicios</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <ViewToggle value={viewMode} onChange={setViewMode} />

            <MonthNav
              currentMonth={currentMonth}
              onPrev={() => setCurrentMonth((m) => subMonths(m, 1))}
              onNext={() => setCurrentMonth((m) => addMonths(m, 1))}
              onToday={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()) }}
            />

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : viewMode === 'month' ? (
              <div className="mt-4">
                <CalendarGrid
                  currentMonth={currentMonth}
                  appointments={appointments}
                  serviceMap={serviceMap}
                  onAppointmentClick={handleAppointmentClick}
                />
              </div>
            ) : viewMode === 'week' ? (
              <div className="mt-4">
                <WeekView
                  referenceDate={displayDay}
                  appointments={appointments}
                  serviceMap={serviceMap}
                  onAppointmentClick={handleAppointmentClick}
                />
              </div>
            ) : viewMode === 'day' ? (
              <div className="mt-4">
                <DayView
                  date={displayDay}
                  appointments={selectedDayAppointments.length > 0 ? selectedDayAppointments : appointments.filter((a) => a.scheduled_at.slice(0, 10) === format(displayDay, 'yyyy-MM-dd'))}
                  serviceMap={serviceMap}
                  employeeMap={employeeMap}
                  onAppointmentClick={handleAppointmentClick}
                />
              </div>
            ) : (
              <div className="mt-4">
                <AgendaView
                  date={displayDay}
                  appointments={selectedDayAppointments.length > 0 ? selectedDayAppointments : appointments.filter((a) => a.scheduled_at.slice(0, 10) === format(displayDay, 'yyyy-MM-dd'))}
                  serviceMap={serviceMap}
                  employeeMap={employeeMap}
                  onAppointmentClick={handleAppointmentClick}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Panel */}
      <DetailPanel
        appointment={selectedAppointment}
        open={!!selectedAppointment}
        onOpenChange={(open) => { if (!open) setSelectedAppointment(null) }}
        serviceMap={serviceMap}
        employeeMap={employeeMap}
        onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
        onReschedule={(apt) => { setSelectedAppointment(null); setRescheduleAppointment(apt) }}
        isUpdating={updateStatusMutation.isPending}
      />

      {/* Reschedule Picker */}
      <ReschedulePicker
        appointment={rescheduleAppointment}
        open={!!rescheduleAppointment}
        onOpenChange={(open) => { if (!open) setRescheduleAppointment(null) }}
        employees={employees}
        onSuccess={handleRescheduleSuccess}
      />
    </AdminLayout>
  )
}
