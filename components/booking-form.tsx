'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, User, Mail, Phone, FileText, CalendarClock, BellRing, Clock } from 'lucide-react'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { ApiError } from '@/lib/types'

const formSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z.string().regex(/^\d{7,10}$/, 'DNI inválido'),
  phone: z.string().regex(/^\+?[0-9\-\s]{6,20}$/, 'Teléfono inválido'),
  email: z.string().email('Email inválido'),
  service_id: z.string().min(1, 'Seleccioná un servicio'),
  date: z.string().min(1, 'Seleccioná una fecha'),
  time: z.string().min(1, 'Seleccioná un horario'),
  remind_1_day_before: z.boolean().default(false),
  remind_30_mins_before: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export function BookingForm() {
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      dni: '',
      phone: '',
      email: '',
      service_id: '',
      date: '',
      time: '',
      remind_1_day_before: false,
      remind_30_mins_before: false,
    },
  })

  const selectedServiceId = form.watch('service_id')
  const selectedDate = form.watch('date')
  const setValue = form.setValue

  useEffect(() => {
    // Changing service or date invalidates the chosen time.
    setValue('time', '')
  }, [selectedServiceId, selectedDate, setValue])

  const { data: servicesData, isLoading: loadingServices } = useQuery({
    queryKey: ['public-services'],
    queryFn: () => api.getPublicServices(),
  })

  const availabilityQuery = useQuery({
    queryKey: ['availability', selectedServiceId, selectedDate],
    queryFn: () => api.getAvailability(Number(selectedServiceId), selectedDate),
    enabled: !!selectedServiceId && !!selectedDate,
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.createAppointment({
        first_name: data.first_name,
        last_name: data.last_name,
        dni: data.dni,
        phone: data.phone,
        email: data.email,
        service_id: Number(data.service_id),
        scheduled_at: `${data.date} ${data.time}:00`,
        remind_1_day_before: data.remind_1_day_before,
        remind_30_mins_before: data.remind_30_mins_before,
      }),
    onSuccess: (_response, variables) => {
      router.push(`/confirmacion?dni=${variables.dni}`)
    },
  })

  const services = servicesData?.data || []

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reservar turno</CardTitle>
        <CardDescription>
          Completá el formulario para agendar tu turno
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Ana" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Pérez" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dni"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="30123456" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+54 11 5555-8888" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="ana@example.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={loadingServices}>
                        <SelectValue placeholder="Seleccioná un servicio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name} ({service.duration_minutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="date" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horario</FormLabel>
                  <FormControl>
                    <div className="rounded-lg border p-3">
                      {!selectedServiceId || !selectedDate ? (
                        <p className="text-sm text-muted-foreground">Elegí un servicio y una fecha para ver horarios disponibles.</p>
                      ) : availabilityQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cargando horarios...
                        </div>
                      ) : (availabilityQuery.data?.data || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay horarios disponibles para esa fecha.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {(availabilityQuery.data?.data || []).map((slot) => {
                            const selected = field.value === slot.time
                            return (
                              <Button
                                key={slot.time}
                                type="button"
                                variant={selected ? 'default' : 'outline'}
                                size="sm"
                                className="justify-center"
                                disabled={!slot.available}
                                onClick={() => form.setValue('time', slot.time, { shouldValidate: true })}
                              >
                                <Clock className="mr-1 h-3.5 w-3.5" />
                                {slot.time}
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                Recordatorios
              </div>

              <FormField
                control={form.control}
                name="remind_1_day_before"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
                    </FormControl>
                    <div>
                      <FormLabel>1 día antes</FormLabel>
                      <p className="text-xs text-muted-foreground">Opcional</p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remind_30_mins_before"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-md border p-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
                    </FormControl>
                    <div>
                      <FormLabel>30 minutos antes</FormLabel>
                      <p className="text-xs text-muted-foreground">Opcional</p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {createMutation.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {(createMutation.error as ApiError).message || 'Error al crear el turno. Intentá de nuevo.'}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar turno
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
