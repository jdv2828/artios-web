'use client'

import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import type { Service, ApiError } from '@/lib/types'

const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  duration_minutes: z.coerce.number().min(5, 'La duración mínima es 5 minutos').max(480, 'La duración máxima es 8 horas'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  active: z.boolean(),
})

type FormData = z.infer<typeof serviceSchema>

interface ServiceDialogProps {
  open: boolean
  onOpenChange: () => void
  service: Service | null
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = !!service

  const form = useForm<FormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      duration_minutes: 30,
      price: 1200,
      active: true,
    },
  })

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        duration_minutes: service.duration_minutes,
        price: Number(service.price),
        active: service.active,
      })
    } else {
      form.reset({
        name: '',
        duration_minutes: 30,
        price: 1200,
        active: true,
      })
    }
  }, [service, form])

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      onOpenChange()
      form.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.updateService(service!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] })
      onOpenChange()
    },
  })

  const mutation = isEditing ? updateMutation : createMutation
  const error = mutation.error as ApiError | null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modificá los datos del servicio' : 'Completá los datos para crear un nuevo servicio'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Corte de pelo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (minutos)</FormLabel>
                  <FormControl>
                    <Input type="number" min={5} max={480} placeholder="30" {...field} />
                  </FormControl>
                  <FormDescription>Duración estimada del servicio en minutos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="0.01" placeholder="1200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Activo</FormLabel>
                    <FormDescription>Los servicios inactivos no aparecen en el sistema de reservas</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error.message || 'Error al guardar el servicio'}</div>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onOpenChange}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
