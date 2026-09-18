'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarOff, Save, UserRound, Plus, Trash2 } from 'lucide-react'

import { AdminLayout } from '@/components/admin-layout'
import { api } from '@/lib/api'
import type { EmployeeAvailabilityConfig } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

const dayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

type ScheduleRow = { day_of_week: number; start_time: string; end_time: string }

export default function ProfessionalsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Pick<EmployeeAvailabilityConfig, 'service_ids' | 'schedules' | 'breaks'>>({
    service_ids: [],
    schedules: [],
    breaks: [],
  })
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees(),
    enabled: isAdmin,
  })

  useEffect(() => {
    if (!user) return

    if (!isAdmin) {
      // Employees can only configure themselves.
      if (selectedEmployeeId !== user.id) setSelectedEmployeeId(user.id)
      return
    }

    const first = employeesQuery.data?.data?.[0]
    if (!selectedEmployeeId && first) setSelectedEmployeeId(first.id)
  }, [employeesQuery.data, isAdmin, selectedEmployeeId, user])

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  })

  const availabilityQuery = useQuery({
    queryKey: ['employee-availability', selectedEmployeeId],
    queryFn: () => api.getEmployeeAvailability(selectedEmployeeId!),
    enabled: selectedEmployeeId !== null,
  })

  useEffect(() => {
    const data = availabilityQuery.data?.data
    if (!data) return
    setDraft({
      service_ids: data.service_ids,
      schedules: data.schedules,
      breaks: data.breaks,
    })
  }, [availabilityQuery.data])

  const selectedEmployee = availabilityQuery.data?.data?.user
  const blockedDates = availabilityQuery.data?.data?.blocked_dates || []

  const serviceMap = useMemo(() => new Map((servicesQuery.data?.data || []).map((s) => [s.id, s.name])), [servicesQuery.data])
  const services = servicesQuery.data?.data || []

  const saveMutation = useMutation({
    mutationFn: () => api.updateEmployeeAvailability(selectedEmployeeId!, draft),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employee-availability', selectedEmployeeId] })
    },
  })

  const addBlockedDateMutation = useMutation({
    mutationFn: () => api.addEmployeeBlockedDate(selectedEmployeeId!, { date: blockDate, reason: blockReason || null }),
    onSuccess: async () => {
      setBlockDate('')
      setBlockReason('')
      await queryClient.invalidateQueries({ queryKey: ['employee-availability', selectedEmployeeId] })
    },
  })

  const removeBlockedDateMutation = useMutation({
    mutationFn: (date: string) => api.removeEmployeeBlockedDate(selectedEmployeeId!, date),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employee-availability', selectedEmployeeId] })
    },
  })

  const updateRow = (kind: 'schedules' | 'breaks', index: number, next: Partial<ScheduleRow>) => {
    setDraft((prev) => {
      const copy = [...prev[kind]]
      copy[index] = { ...copy[index], ...next }
      return { ...prev, [kind]: copy }
    })
  }

  const addRow = (kind: 'schedules' | 'breaks') => {
    setDraft((prev) => ({
      ...prev,
      [kind]: [...prev[kind], { day_of_week: 1, start_time: '09:00', end_time: '18:00' }],
    }))
  }

  const removeRow = (kind: 'schedules' | 'breaks', index: number) => {
    setDraft((prev) => ({
      ...prev,
      [kind]: prev[kind].filter((_, i) => i !== index),
    }))
  }

  const toggleService = (id: number) => {
    setDraft((prev) => {
      const has = prev.service_ids.includes(id)
      return { ...prev, service_ids: has ? prev.service_ids.filter((x) => x !== id) : [...prev.service_ids, id] }
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profesionales</h1>
          <p className="text-muted-foreground">Definí servicios, horarios, breaks y días bloqueados por profesional</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Equipo</CardTitle>
              <CardDescription>{isAdmin ? 'Seleccioná un profesional' : 'Tu configuración'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {!isAdmin ? (
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <UserRound className="h-4 w-4" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{user?.name || 'Empleado'}</div>
                    <div className="truncate text-xs text-muted-foreground">{user?.email || ''}</div>
                  </div>
                </div>
              ) : employeesQuery.isLoading ? (
                <div className="flex justify-center py-6"><Spinner className="h-6 w-6" /></div>
              ) : (
                (employeesQuery.data?.data || []).map((e) => (
                  <Button
                    key={e.id}
                    variant={selectedEmployeeId === e.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedEmployeeId(e.id)}
                  >
                    <UserRound className="mr-2 h-4 w-4" />
                    <span className="truncate">{e.name}</span>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>{selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.email})` : 'Seleccioná un profesional'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {availabilityQuery.isLoading ? (
                  <div className="flex justify-center py-10"><Spinner className="h-8 w-8" /></div>
                ) : selectedEmployeeId === null ? (
                  <p className="text-sm text-muted-foreground">No hay profesionales para configurar.</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Servicios que ofrece</h3>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {services.map((s) => (
                          <label key={s.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                            <Checkbox checked={draft.service_ids.includes(s.id)} onCheckedChange={() => toggleService(s.id)} />
                            <span className="truncate">{s.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Horarios de trabajo</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => addRow('schedules')}
                          disabled={saveMutation.isPending}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Agregar
                        </Button>
                      </div>
                      {draft.schedules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin horarios cargados.</p>
                      ) : (
                        <div className="space-y-2">
                          {draft.schedules.map((row, idx) => (
                            <div key={idx} className="grid gap-2 sm:grid-cols-[160px_120px_120px_40px] items-center">
                              <select
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                                value={row.day_of_week}
                                onChange={(e) => updateRow('schedules', idx, { day_of_week: Number(e.target.value) })}
                              >
                                {dayOptions.map((d) => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                              <Input type="time" value={row.start_time} onChange={(e) => updateRow('schedules', idx, { start_time: e.target.value })} />
                              <Input type="time" value={row.end_time} onChange={(e) => updateRow('schedules', idx, { end_time: e.target.value })} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeRow('schedules', idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Breaks</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => addRow('breaks')}
                          disabled={saveMutation.isPending}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Agregar
                        </Button>
                      </div>
                      {draft.breaks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Sin breaks cargados.</p>
                      ) : (
                        <div className="space-y-2">
                          {draft.breaks.map((row, idx) => (
                            <div key={idx} className="grid gap-2 sm:grid-cols-[160px_120px_120px_40px] items-center">
                              <select
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                                value={row.day_of_week}
                                onChange={(e) => updateRow('breaks', idx, { day_of_week: Number(e.target.value) })}
                              >
                                {dayOptions.map((d) => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                              <Input type="time" value={row.start_time} onChange={(e) => updateRow('breaks', idx, { start_time: e.target.value })} />
                              <Input type="time" value={row.end_time} onChange={(e) => updateRow('breaks', idx, { end_time: e.target.value })} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeRow('breaks', idx)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || selectedEmployeeId === null}>
                        <Save className="mr-2 h-4 w-4" /> Guardar
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Días bloqueados</CardTitle>
                <CardDescription>Vacaciones, feriados o días puntuales sin atención</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-[160px_1fr_140px] items-end">
                  <div>
                    <label className="text-sm font-medium">Fecha</label>
                    <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Motivo (opcional)</label>
                    <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Vacaciones" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedEmployeeId || !blockDate || addBlockedDateMutation.isPending}
                    onClick={() => addBlockedDateMutation.mutate()}
                  >
                    <CalendarOff className="mr-2 h-4 w-4" /> Bloquear
                  </Button>
                </div>

                {blockedDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay fechas bloqueadas.</p>
                ) : (
                  <div className="space-y-2">
                    {blockedDates.map((d) => (
                      <div key={d.date} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <div className="text-sm font-medium">{d.date}</div>
                          <div className="text-xs text-muted-foreground">{d.reason || 'Sin motivo'}</div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBlockedDateMutation.mutate(d.date)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
