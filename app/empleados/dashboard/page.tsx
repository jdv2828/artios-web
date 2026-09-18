'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, CheckCircle, ListTodo, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AdminLayout } from '@/components/admin-layout'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import type { AppointmentStatus } from '@/lib/types'

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-warning/10 text-warning-foreground border-warning/30' },
  confirmed: { label: 'Confirmado', className: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  completed: { label: 'Completado', className: 'bg-muted text-muted-foreground border-muted' },
  no_show: { label: 'No asistió', className: 'bg-muted text-muted-foreground border-muted' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['admin-services'],
    queryFn: () => api.getServices(),
  })

  const { data: todayAppointmentsData, isLoading: loadingToday } = useQuery({
    queryKey: ['today-appointments', today],
    queryFn: () => api.getAppointments({ scheduled_date: today, per_page: 100 }),
  })

  const { data: recentAppointmentsData, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-appointments'],
    queryFn: () => api.getAppointments({ per_page: 10 }),
  })

  const services = servicesData?.data || []
  const todayAppointments = todayAppointmentsData?.data || []
  const recentAppointments = recentAppointmentsData?.data || []

  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service.name])), [services])

  const statCards = [
    { title: 'Turnos de hoy', value: todayAppointments.length, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Pendientes', value: todayAppointments.filter((a) => a.status === 'scheduled').length, icon: Clock, color: 'text-warning-foreground', bg: 'bg-warning/10' },
    { title: 'Completados hoy', value: todayAppointments.filter((a) => a.status === 'completed').length, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Servicios activos', value: services.filter((s) => s.active).length, icon: ListTodo, color: 'text-accent', bg: 'bg-accent/10' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Resumen del día {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', stat.bg)}>
                    <stat.icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Turnos de hoy</CardTitle>
              <CardDescription>Próximos turnos programados para hoy</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/empleados/turnos">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingToday || loadingServices || loadingRecent ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : todayAppointments.length === 0 ? (
              recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay turnos programados para hoy</div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">No hay turnos para hoy. Próximos / recientes:</div>
                  {recentAppointments.slice(0, 5).map((appointment) => {
                    const config = statusConfig[appointment.status]
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-medium">
                            {appointment.scheduled_at.slice(11, 16)}
                          </div>
                          <div>
                            <p className="font-medium">Turno #{appointment.id}</p>
                            <p className="text-sm text-muted-foreground">{serviceMap.get(appointment.service_id) || `Servicio #${appointment.service_id}`}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn('capitalize', config.className)}>{config.label}</Badge>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment) => {
                  const config = statusConfig[appointment.status]
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-medium">
                          {appointment.scheduled_at.slice(11, 16)}
                        </div>
                        <div>
                          <p className="font-medium">Turno #{appointment.id}</p>
                          <p className="text-sm text-muted-foreground">{serviceMap.get(appointment.service_id) || `Servicio #${appointment.service_id}`}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('capitalize', config.className)}>{config.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gestionar turnos</CardTitle>
              <CardDescription>Ver, filtrar y actualizar el estado de los turnos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/empleados/turnos">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ir a turnos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administrar servicios</CardTitle>
                <CardDescription>Crear, editar o desactivar servicios disponibles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/empleados/servicios">
                    <ListTodo className="mr-2 h-4 w-4" />
                    Ir a servicios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
