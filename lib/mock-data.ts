import type {
  Service,
  Appointment,
  User,
  AppointmentStatus,
  AppointmentFormData,
  AppointmentFilters,
  CalendarAppointment,
  RescheduleData,
  AvailableSlot,
  ServiceFormData,
  EmployeeAvailabilityConfig,
  EmployeeSummary,
} from './types'

export const mockUser: User = {
  id: 1,
  name: 'María García',
  email: 'maria@turnero.com',
  role: 'employee',
}

export const mockServices: Service[] = [
  { id: 1, name: 'Corte de cabello', duration_minutes: 30, price: '1200.00', active: true },
  { id: 2, name: 'Tintura', duration_minutes: 90, price: '3500.00', active: true },
  { id: 3, name: 'Barba', duration_minutes: 20, price: '900.00', active: true },
  { id: 4, name: 'Manicura', duration_minutes: 45, price: '1800.00', active: true },
  { id: 5, name: 'Pedicura', duration_minutes: 50, price: '2000.00', active: false },
]

const clientsByDni = new Map<string, number>([
  ['30123456', 1],
  ['32456789', 2],
  ['28765432', 3],
])

let clientIdCounter = 4
let appointmentIdCounter = 11
let serviceIdCounter = mockServices.length + 1

const today = new Date()
const daysFromNow = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const scheduleAt = (days: number, time: string) => `${daysFromNow(days)}T${time}:00`

export const mockAppointments: Array<Appointment & { client_dni: string; client_name?: string }> = [
  {
    id: 1,
    client_id: 1,
    client_dni: '30123456',
    client_name: 'Ana Pérez',
    service_id: 1,
    scheduled_at: scheduleAt(0, '09:00'),
    status: 'confirmed',
    confirmation_token: 'token-1',
    reminders: { remind_1_day_before: true, remind_30_mins_before: true, remind_1_hour_before: true },
  },
  {
    id: 2,
    client_id: 2,
    client_dni: '32456789',
    client_name: 'Laura Fernández',
    service_id: 2,
    scheduled_at: scheduleAt(0, '10:30'),
    status: 'scheduled',
    confirmation_token: 'token-2',
    reminders: { remind_1_day_before: false, remind_30_mins_before: true, remind_1_hour_before: true },
  },
  {
    id: 3,
    client_id: 3,
    client_dni: '28765432',
    client_name: 'Carolina Pérez',
    service_id: 4,
    scheduled_at: scheduleAt(1, '11:30'),
    status: 'completed',
    confirmation_token: 'token-3',
    reminders: { remind_1_day_before: true, remind_30_mins_before: false, remind_1_hour_before: true },
  },
  {
    id: 4,
    client_id: 1,
    client_dni: '30123456',
    client_name: 'Ana Pérez',
    service_id: 3,
    scheduled_at: scheduleAt(0, '11:00'),
    status: 'cancelled',
    confirmation_token: 'token-4',
    reminders: { remind_1_day_before: false, remind_30_mins_before: false, remind_1_hour_before: false },
  },
  {
    id: 5,
    client_id: 2,
    client_dni: '32456789',
    client_name: 'Laura Fernández',
    service_id: 2,
    scheduled_at: scheduleAt(0, '12:00'),
    status: 'no_show',
    confirmation_token: 'token-5',
    reminders: { remind_1_day_before: false, remind_30_mins_before: false, remind_1_hour_before: false },
  },
]

const localAppointments = [...mockAppointments]
const localServices = [...mockServices]

const employeeConfigs = new Map<number, EmployeeAvailabilityConfig>()

const defaultEmployeeConfig = (user: EmployeeSummary): EmployeeAvailabilityConfig => ({
  user,
  service_ids: localServices.filter((s) => s.active).map((s) => s.id),
  schedules: [
    { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
    { day_of_week: 5, start_time: '09:00', end_time: '18:00' },
  ],
  breaks: [
    { day_of_week: 1, start_time: '12:00', end_time: '13:00' },
    { day_of_week: 2, start_time: '12:00', end_time: '13:00' },
    { day_of_week: 3, start_time: '12:00', end_time: '13:00' },
    { day_of_week: 4, start_time: '12:00', end_time: '13:00' },
    { day_of_week: 5, start_time: '12:00', end_time: '13:00' },
  ],
  blocked_dates: [],
})

const toService = (data: Partial<Service> | ServiceFormData): Service => ({
  id: 'id' in data && typeof data.id === 'number' ? data.id : serviceIdCounter++,
  name: data.name || '',
  duration_minutes: Number(data.duration_minutes || 30),
  price: typeof data.price === 'string' ? data.price : Number(data.price || 0).toFixed(2),
  active: data.active ?? true,
  description: 'description' in data ? data.description : undefined,
})

const getDateOnly = (scheduledAt: string) => scheduledAt.split('T')[0]

const findClientId = (dni: string) => {
  const existing = clientsByDni.get(dni)
  if (existing) return existing
  const id = clientIdCounter++
  clientsByDni.set(dni, id)
  return id
}

export function generateAvailableSlots(serviceId: number, date: string): AvailableSlot[] {
  const service = localServices.find((s) => s.id === serviceId)
  if (!service) return []

  const bookedTimes = localAppointments
    .filter((a) => getDateOnly(a.scheduled_at) === date && a.status !== 'cancelled')
    .map((a) => a.scheduled_at.slice(11, 16))

  const slots: AvailableSlot[] = []

  for (let hour = 9; hour < 19; hour++) {
    for (const minutes of [0, 30]) {
      const time = `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      const endMinutes = minutes + service.duration_minutes
      const endHour = hour + Math.floor(endMinutes / 60)
      const endMinute = endMinutes % 60

      if (endHour >= 19 && endMinute > 0) continue

      slots.push({ time, available: !bookedTimes.includes(time) })
    }
  }

  return slots
}

export const mockApi = {
  login: async (email: string, password: string) => {
    if (email === 'maria@turnero.com' && password === 'password123') {
      return { user: mockUser, token_type: 'Bearer', access_token: 'mock-token' }
    }

    throw { message: 'Credenciales inválidas', errors: { email: ['Email o contraseña incorrectos'] } }
  },

  logout: async () => undefined,

  getActiveServices: async () => ({ data: localServices.filter((s) => s.active) }),
  getServices: async () => ({ data: localServices }),
  getService: async (id: number) => ({ data: localServices.find((s) => s.id === id)! }),

  createService: async (data: ServiceFormData) => {
    const newService = toService(data)
    localServices.push(newService)
    return { data: newService }
  },

  updateService: async (id: number, data: ServiceFormData) => {
    const index = localServices.findIndex((s) => s.id === id)
    if (index === -1) throw { message: 'Servicio no encontrado' }
    localServices[index] = toService({ ...localServices[index], ...data })
    return { data: localServices[index] }
  },

  deleteService: async (id: number) => {
    const index = localServices.findIndex((s) => s.id === id)
    if (index === -1) throw { message: 'Servicio no encontrado' }
    localServices.splice(index, 1)
  },

  createAppointment: async (data: Partial<AppointmentFormData>) => {
    const dni = data.dni || '00000000'
    const clientId = findClientId(dni)
    const confirmationToken = `token-${appointmentIdCounter}`
    const newAppointment: Appointment & { client_dni: string; client_name?: string } = {
      id: appointmentIdCounter++,
      client_id: clientId,
      client_dni: dni,
      client_name: `${data.first_name || 'Cliente'} ${data.last_name || ''}`.trim(),
      service_id: data.service_id || 0,
      scheduled_at: data.scheduled_at || '',
      status: 'scheduled',
      confirmation_token: confirmationToken,
      reminders: {
        remind_1_day_before: !!data.remind_1_day_before,
        remind_30_mins_before: !!data.remind_30_mins_before,
        remind_1_hour_before: true,
      },
    }

    localAppointments.push(newAppointment)
    return { data: newAppointment }
  },

  getAppointmentsByDni: async (dni: string) => ({
    data: localAppointments.filter((a) => a.client_dni === dni),
  }),

  getAvailability: async (serviceId: number, date: string): Promise<{ data: AvailableSlot[] }> => {
    return { data: generateAvailableSlots(serviceId, date) }
  },

  getEmployees: async (): Promise<{ data: EmployeeSummary[] }> => ({
    data: [mockUser],
  }),

  getEmployeeAvailability: async (id: number): Promise<{ data: EmployeeAvailabilityConfig }> => {
    const user = id === mockUser.id ? mockUser : { ...mockUser, id }
    const summary: EmployeeSummary = { id: user.id, name: user.name, email: user.email, role: user.role }
    const existing = employeeConfigs.get(id)
    return { data: existing ?? defaultEmployeeConfig(summary) }
  },

  updateEmployeeAvailability: async (id: number, payload: Pick<EmployeeAvailabilityConfig, 'service_ids' | 'schedules' | 'breaks'>) => {
    const current = await mockApi.getEmployeeAvailability(id)
    const next: EmployeeAvailabilityConfig = { ...current.data, ...payload }
    employeeConfigs.set(id, next)
    return { data: { message: 'Availability updated.' } }
  },

  addEmployeeBlockedDate: async (id: number, payload: { date: string; reason?: string | null }) => {
    const current = await mockApi.getEmployeeAvailability(id)
    const filtered = current.data.blocked_dates.filter((d) => d.date !== payload.date)
    const next: EmployeeAvailabilityConfig = {
      ...current.data,
      blocked_dates: [...filtered, { date: payload.date, reason: payload.reason ?? null }].sort((a, b) => a.date.localeCompare(b.date)),
    }
    employeeConfigs.set(id, next)
    return { data: { message: 'Blocked date saved.' } }
  },

  removeEmployeeBlockedDate: async (id: number, date: string) => {
    const current = await mockApi.getEmployeeAvailability(id)
    const next: EmployeeAvailabilityConfig = {
      ...current.data,
      blocked_dates: current.data.blocked_dates.filter((d) => d.date !== date),
    }
    employeeConfigs.set(id, next)
  },

  confirmAppointment: async (token: string) => {
    const index = localAppointments.findIndex((a) => a.confirmation_token === token)
    if (index === -1) throw { message: 'Turno no encontrado' }

    localAppointments[index] = { ...localAppointments[index], status: 'confirmed' }
    return { data: localAppointments[index] }
  },

  getAppointments: async (filters?: AppointmentFilters) => {
    let filtered = [...localAppointments]

    if (filters?.scheduled_date) {
      filtered = filtered.filter((a) => getDateOnly(a.scheduled_at) === filters.scheduled_date)
    }
    if (filters?.status) {
      filtered = filtered.filter((a) => a.status === filters.status)
    }
    if (filters?.client_dni) {
      filtered = filtered.filter((a) => a.client_dni === filters.client_dni)
    }

    return {
      data: filtered,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: filters?.per_page || 50,
        total: filtered.length,
      },
    }
  },

  getAppointment: async (id: number) => ({
    data: localAppointments.find((a) => a.id === id)!,
  }),

  updateAppointmentStatus: async (id: number, status: AppointmentStatus) => {
    const index = localAppointments.findIndex((a) => a.id === id)
    if (index === -1) throw { message: 'Turno no encontrado' }
    localAppointments[index] = { ...localAppointments[index], status }
    return { data: localAppointments[index] }
  },

  getDashboardStats: async () => {
    const todayAppointments = localAppointments.filter((a) => getDateOnly(a.scheduled_at) === daysFromNow(0))
    return {
      data: {
        today_appointments: todayAppointments.length,
        pending_appointments: todayAppointments.filter((a) => a.status === 'scheduled').length,
        completed_today: todayAppointments.filter((a) => a.status === 'completed').length,
        active_services: localServices.filter((s) => s.active).length,
      },
    }
  },

  getTodayAppointments: async () => ({
    data: localAppointments.filter((a) => getDateOnly(a.scheduled_at) === daysFromNow(0)),
  }),

  getAppointmentsByDateRange: async (from: string, to: string) => {
    const filtered = localAppointments.filter((a) => {
      const date = getDateOnly(a.scheduled_at)
      return date >= from && date <= to
    })
    return {
      data: filtered as CalendarAppointment[],
      meta: { current_page: 1, last_page: 1, per_page: 500, total: filtered.length },
    }
  },

  rescheduleAppointment: async (id: number, data: RescheduleData) => {
    const index = localAppointments.findIndex((a) => a.id === id)
    if (index === -1) throw { message: 'Turno no encontrado', status: 404 }

    const dateOnly = data.scheduled_at.split(' ')[0]
    const timeOnly = data.scheduled_at.split(' ')[1]
    const conflict = localAppointments.some(
      (a) => a.id !== id && a.employee_id === data.employee_id && getDateOnly(a.scheduled_at) === dateOnly && a.scheduled_at.slice(11, 16) === timeOnly?.slice(0, 5) && a.status !== 'cancelled'
    )
    if (conflict) throw { message: 'El horario seleccionado no está disponible.', status: 409 }

    localAppointments[index] = {
      ...localAppointments[index],
      scheduled_at: data.scheduled_at.replace(' ', 'T'),
      employee_id: data.employee_id,
    }
    return { data: localAppointments[index] as CalendarAppointment }
  },
}
