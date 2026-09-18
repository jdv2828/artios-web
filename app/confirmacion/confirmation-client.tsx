'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, Calendar, Clock, FileText, Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export function ConfirmationClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const dni = searchParams.get('dni')

  const { data: servicesData } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.getPublicServices(),
  })

  const confirmationQuery = useQuery({
    queryKey: ['appointment-confirmation', token],
    queryFn: () => api.confirmAppointment(token!),
    enabled: !!token,
  })

  const dniQuery = useQuery({
    queryKey: ['appointment-by-dni', dni],
    queryFn: () => api.getAppointmentsByDni(dni!),
    enabled: !token && !!dni,
  })

  const serviceMap = useMemo(
    () => new Map((servicesData?.data || []).map((service) => [service.id, service.name])),
    [servicesData]
  )

  const latestByDni = useMemo(() => {
    const items = dniQuery.data?.data || []
    if (items.length === 0) return undefined

    const scheduled = items
      .filter((a) => a.status === 'scheduled')
      .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

    return scheduled[0] ?? items.sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))[0]
  }, [dniQuery.data])

  const appointment = token ? confirmationQuery.data?.data : latestByDni
  const isLoading = token ? confirmationQuery.isLoading : dniQuery.isLoading
  const error = token ? confirmationQuery.error : dniQuery.error
  const isConfirmed = appointment?.status === 'confirmed'
  const heading = token || isConfirmed ? 'Turno confirmado' : 'Tu turno fue registrado'
  const description = token || isConfirmed
    ? 'Tu asistencia quedó confirmada correctamente.'
    : 'Te enviamos un email con el enlace para confirmar tu asistencia.'

  return isLoading ? (
    <Card>
      <CardContent className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  ) : error || !appointment ? (
    <Card>
      <CardContent className="text-center py-16">
        <p className="text-muted-foreground mb-4">No se pudo encontrar la información del turno</p>
        <Button asChild><Link href="/">Volver al inicio</Link></Button>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <CardTitle className="text-2xl">{heading}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-muted/50 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Servicio</p>
              <p className="font-medium">{serviceMap.get(appointment.service_id) || `Servicio #${appointment.service_id}`}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha</p>
              <p className="font-medium capitalize">{format(new Date(appointment.scheduled_at), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Horario</p>
              <p className="font-medium">{appointment.scheduled_at.slice(11, 16)}</p>
            </div>
          </div>
        </div>

        {dni ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-center">
              <span className="font-medium">Tu DNI de referencia:</span>{' '}
              <span className="font-mono text-primary">{dni}</span>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              {token ? 'Este turno ya quedó confirmado.' : 'Usalo para consultar tus turnos.'}
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {token ? 'Podés cerrar esta ventana o volver al inicio.' : 'Revisá tu email para confirmar el turno.'}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild variant="outline"><Link href="/consultar">Consultar mis turnos</Link></Button>
          <Button asChild><Link href="/">Reservar otro turno</Link></Button>
        </div>
      </CardContent>
    </Card>
  )
}
