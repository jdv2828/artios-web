'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react'

import { api } from '@/lib/api'
import { PublicHeader } from '@/components/public-header'
import { PublicFooter } from '@/components/public-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Appointment, AppointmentStatus } from '@/lib/types'

const searchSchema = z.object({
  dni: z.string().regex(/^\d{7,10}$/, 'DNI inválido'),
})

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  scheduled: { label: 'Agendado', className: 'bg-warning/10 text-warning-foreground border-warning/30' },
  confirmed: { label: 'Confirmado', className: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  completed: { label: 'Completado', className: 'bg-muted text-muted-foreground border-muted' },
  no_show: { label: 'No asistió', className: 'bg-muted text-muted-foreground border-muted' },
}

export default function ConsultarPage() {
  const [searchedDni, setSearchedDni] = useState<string | null>(null)

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { dni: '' },
  })

  const { data: servicesData } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.getPublicServices(),
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments-by-dni', searchedDni],
    queryFn: () => api.getAppointmentsByDni(searchedDni!),
    enabled: !!searchedDni,
  })

  const services = servicesData?.data || []
  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service.name])), [services])
  const appointments = data?.data || []

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Consultar turnos</h1>
            <p className="text-muted-foreground">Ingresá tu DNI para ver tus turnos</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => setSearchedDni(values.dni))} className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="sr-only">DNI</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ingresá tu DNI" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {searchedDni && (
            <>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : error ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-muted-foreground">No se pudieron cargar los turnos</p>
                  </CardContent>
                </Card>
              ) : appointments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No se encontraron turnos para este DNI</p>
                    <Button asChild><Link href="/">Reservar un turno</Link></Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} serviceName={serviceMap.get(appointment.service_id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

function AppointmentCard({ appointment, serviceName }: { appointment: Appointment; serviceName?: string }) {
  const config = statusConfig[appointment.status]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">{serviceName || `Servicio #${appointment.service_id}`}</h3>
            <p className="text-sm text-muted-foreground">Turno #{appointment.id}</p>
          </div>
          <Badge variant="outline" className={config.className}>{config.label}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.scheduled_at), "EEEE d 'de' MMMM", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.scheduled_at.slice(11, 16)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
