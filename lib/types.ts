// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// Auth types
export interface User {
  id: number
  name: string
  email: string
  role: string
  created_at?: string
  updated_at?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token_type: string
  access_token: string
}

// Service types
export interface Service {
  id: number
  name: string
  duration_minutes: number
  price: string
  active: boolean
  created_at?: string
  updated_at?: string
  description?: string | null
}

export interface ServiceFormData {
  name: string
  duration_minutes: number
  price: number | string
  active: boolean
}

// Appointment/Turno types
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export interface AppointmentReminders {
  remind_1_day_before: boolean
  remind_30_mins_before: boolean
  remind_1_hour_before: boolean
}

export interface Appointment {
  id: number
  client_id: number
  client_name?: string | null
  client_dni?: string | null
  employee_id?: number | null
  service_id: number
  scheduled_at: string
  status: AppointmentStatus
  reminders: AppointmentReminders
  confirmation_token?: string
}

export interface AppointmentFormData {
  first_name: string
  last_name: string
  dni: string
  phone: string
  email: string
  service_id: number
  scheduled_at: string
  remind_1_day_before: boolean
  remind_30_mins_before: boolean
}

export interface AvailableSlot {
  time: string
  available: boolean
}

export interface EmployeeSummary {
  id: number
  name: string
  email: string
  role: string
}

export interface EmployeeAvailabilityConfig {
  user: EmployeeSummary
  service_ids: number[]
  schedules: Array<{ day_of_week: number; start_time: string; end_time: string }>
  breaks: Array<{ day_of_week: number; start_time: string; end_time: string }>
  blocked_dates: Array<{ date: string; reason: string | null }>
}

// Calendar types
export interface CalendarAppointment {
  id: number
  client_id: number
  client_name?: string | null
  client_dni?: string | null
  employee_id?: number | null
  service_id: number
  scheduled_at: string
  status: AppointmentStatus
  reminders: AppointmentReminders
}

export interface RescheduleData {
  scheduled_at: string
  employee_id: number
}

// Status transitions — single source of truth matching the backend domain state machine
export const STATUS_TRANSITIONS: Record<AppointmentStatus, { value: AppointmentStatus; label: string }[]> = {
  scheduled: [
    { value: 'confirmed', label: 'Confirmar' },
    { value: 'cancelled', label: 'Cancelar' },
  ],
  confirmed: [
    { value: 'completed', label: 'Completar' },
    { value: 'no_show', label: 'No asistió' },
    { value: 'cancelled', label: 'Cancelar' },
  ],
  completed: [],
  cancelled: [],
  no_show: [],
}

// Filter types
export interface AppointmentFilters {
  scheduled_date?: string
  client_dni?: string
  client_name?: string
  status?: AppointmentStatus | ''
  service_id?: number | ''
  employee_id?: number | ''
  page?: number
  per_page?: number
}
