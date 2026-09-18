import type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  AuthResponse,
  LoginCredentials,
  Service,
  ServiceFormData,
  Appointment,
  AppointmentFormData,
  AppointmentStatus,
  AppointmentFilters,
  CalendarAppointment,
  RescheduleData,
  AvailableSlot,
  EmployeeAvailabilityConfig,
  EmployeeSummary,
} from './types'
import { mockApi } from './mock-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const USE_BACKEND = API_BASE_URL !== ''

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    opts: { redirectOnUnauthorized?: boolean } = {}
  ): Promise<T> {
    const token = this.getToken()
    const redirectOnUnauthorized = opts.redirectOnUnauthorized ?? true

    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Error de conexión con el servidor',
      }))
      error.status = response.status

      if (response.status === 401 && redirectOnUnauthorized) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/empleados/login'
        }
      }

      throw error
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  private isNetworkError(error: unknown): boolean {
    return error instanceof TypeError
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!USE_BACKEND) {
      const response = await mockApi.login(credentials.email, credentials.password)
      localStorage.setItem('auth_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    }

    try {
      const response = await this.request<AuthResponse>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        },
        { redirectOnUnauthorized: false }
      )

      localStorage.setItem('auth_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return response
    } catch (error) {
      if (this.isNetworkError(error)) {
        const response = await mockApi.login(credentials.email, credentials.password)
        localStorage.setItem('auth_token', response.access_token)
        localStorage.setItem('user', JSON.stringify(response.user))
        return response
      }

      throw error
    }
  }

  async logout(): Promise<void> {
    if (!USE_BACKEND) {
      await mockApi.logout()
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      return
    }

    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      if (!this.isNetworkError(error)) {
        throw error
      }
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  async getProfile(): Promise<ApiResponse<{ user: import('./types').User }>> {
    const storedUser = typeof window === 'undefined' ? null : localStorage.getItem('user')
    return {
      data: {
        user: storedUser ? JSON.parse(storedUser) : null,
      },
    }
  }

  // Services
  async getPublicServices(): Promise<ApiResponse<Service[]>> {
    if (!USE_BACKEND) {
      return mockApi.getActiveServices()
    }

    try {
      const response = await this.request<ApiResponse<Service[]>>(
        '/services/active',
        { method: 'GET' },
        { redirectOnUnauthorized: false }
      )

      return response
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getActiveServices()
      }

      throw error
    }
  }

  async getServices(): Promise<ApiResponse<Service[]>> {
    if (!USE_BACKEND) {
      return mockApi.getServices()
    }

    try {
      return this.request('/services')
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getServices()
      }

      throw error
    }
  }

  async getService(id: number): Promise<ApiResponse<Service>> {
    if (!USE_BACKEND) {
      return mockApi.getService(id)
    }

    try {
      return this.request(`/services/${id}`)
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getService(id)
      }

      throw error
    }
  }

  async createService(data: ServiceFormData): Promise<ApiResponse<Service>> {
    if (!USE_BACKEND) {
      return mockApi.createService(data)
    }

    try {
      return this.request('/services', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.createService(data)
      }

      throw error
    }
  }

  async updateService(id: number, data: ServiceFormData): Promise<ApiResponse<Service>> {
    if (!USE_BACKEND) {
      return mockApi.updateService(id, data)
    }

    try {
      return this.request(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.updateService(id, data)
      }

      throw error
    }
  }

  async deleteService(id: number): Promise<void> {
    if (!USE_BACKEND) {
      return mockApi.deleteService(id)
    }

    try {
      await this.request(`/services/${id}`, { method: 'DELETE' })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.deleteService(id)
      }

      throw error
    }
  }

  // Appointments
  async createAppointment(data: AppointmentFormData): Promise<ApiResponse<Appointment>> {
    if (!USE_BACKEND) {
      return mockApi.createAppointment(data)
    }

    try {
      return this.request('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }, { redirectOnUnauthorized: false })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.createAppointment(data)
      }

      throw error
    }
  }

  async confirmAppointment(token: string): Promise<ApiResponse<Appointment>> {
    if (!USE_BACKEND) {
      return mockApi.confirmAppointment(token)
    }

    try {
      return this.request(`/appointments/confirm/${token}`, {}, { redirectOnUnauthorized: false })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.confirmAppointment(token)
      }

      throw error
    }
  }

  async getAvailability(serviceId: number, date: string): Promise<ApiResponse<AvailableSlot[]>> {
    if (!USE_BACKEND) {
      return mockApi.getAvailability(serviceId, date)
    }

    try {
      const params = new URLSearchParams({ service_id: String(serviceId), date })
      return this.request(`/availability?${params.toString()}`, {}, { redirectOnUnauthorized: false })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getAvailability(serviceId, date)
      }

      throw error
    }
  }

  async getEmployees(): Promise<ApiResponse<EmployeeSummary[]>> {
    if (!USE_BACKEND) {
      return mockApi.getEmployees()
    }

    try {
      return this.request('/employees')
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getEmployees()
      }
      throw error
    }
  }

  async getEmployeeAvailability(id: number): Promise<ApiResponse<EmployeeAvailabilityConfig>> {
    if (!USE_BACKEND) {
      return mockApi.getEmployeeAvailability(id)
    }

    try {
      return this.request(`/employees/${id}/availability`)
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getEmployeeAvailability(id)
      }
      throw error
    }
  }

  async updateEmployeeAvailability(id: number, payload: Pick<EmployeeAvailabilityConfig, 'service_ids' | 'schedules' | 'breaks'>): Promise<ApiResponse<{ message: string }>> {
    if (!USE_BACKEND) {
      return mockApi.updateEmployeeAvailability(id, payload)
    }

    try {
      return this.request(`/employees/${id}/availability`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.updateEmployeeAvailability(id, payload)
      }
      throw error
    }
  }

  async addEmployeeBlockedDate(id: number, payload: { date: string; reason?: string | null }): Promise<ApiResponse<{ message: string }>> {
    if (!USE_BACKEND) {
      return mockApi.addEmployeeBlockedDate(id, payload)
    }

    try {
      return this.request(`/employees/${id}/blocked-dates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.addEmployeeBlockedDate(id, payload)
      }
      throw error
    }
  }

  async removeEmployeeBlockedDate(id: number, date: string): Promise<void> {
    if (!USE_BACKEND) {
      return mockApi.removeEmployeeBlockedDate(id, date)
    }

    try {
      await this.request(`/employees/${id}/blocked-dates/${date}`, { method: 'DELETE' })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.removeEmployeeBlockedDate(id, date)
      }
      throw error
    }
  }

  async getAppointmentsByDni(dni: string): Promise<ApiResponse<Appointment[]>> {
    if (!USE_BACKEND) {
      return mockApi.getAppointmentsByDni(dni)
    }

    try {
      return this.request(`/clients/${dni}/appointments`, {}, { redirectOnUnauthorized: false })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getAppointmentsByDni(dni)
      }
      if ((error as ApiError).status === 404) {
        return { data: [] }
      }

      throw error
    }
  }

  async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
    if (!USE_BACKEND) {
      return mockApi.getAppointments(filters)
    }

    const params = new URLSearchParams()
    if (filters?.scheduled_date) params.append('scheduled_date', filters.scheduled_date)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.client_dni) params.append('client_dni', filters.client_dni)
    if (filters?.client_name) params.append('client_name', filters.client_name)
    if (filters?.employee_id) params.append('employee_id', String(filters.employee_id))
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.per_page) params.append('per_page', String(filters.per_page))

    try {
      return this.request(`/appointments${params.toString() ? `?${params.toString()}` : ''}`)
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getAppointments(filters)
      }

      throw error
    }
  }

  async getAppointment(id: number): Promise<ApiResponse<Appointment>> {
    if (!USE_BACKEND) {
      return mockApi.getAppointment(id)
    }

    try {
      return this.request(`/appointments/${id}`)
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getAppointment(id)
      }

      throw error
    }
  }

  async updateAppointmentStatus(id: number, status: AppointmentStatus): Promise<ApiResponse<Appointment>> {
    if (!USE_BACKEND) {
      return mockApi.updateAppointmentStatus(id, status)
    }

    try {
      return this.request(`/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.updateAppointmentStatus(id, status)
      }

      throw error
    }
  }

  async getDashboardStats(): Promise<ApiResponse<{
    today_appointments: number
    pending_appointments: number
    completed_today: number
    active_services: number
  }>> {
    if (!USE_BACKEND) {
      return mockApi.getDashboardStats()
    }

    const today = new Date().toISOString().split('T')[0]
    const [todayAppointments, services] = await Promise.all([
      this.getAppointments({ scheduled_date: today, per_page: 100 }),
      this.getServices(),
    ])

    const items = todayAppointments.data
    return {
      data: {
        today_appointments: items.length,
        pending_appointments: items.filter((appointment) => appointment.status === 'scheduled').length,
        completed_today: items.filter((appointment) => appointment.status === 'completed').length,
        active_services: services.data.filter((service) => service.active).length,
      },
    }
  }

  async getTodayAppointments(): Promise<ApiResponse<Appointment[]>> {
    if (!USE_BACKEND) {
      return mockApi.getTodayAppointments()
    }

    const today = new Date().toISOString().split('T')[0]
    const response = await this.getAppointments({ scheduled_date: today, per_page: 100 })
    return { data: response.data }
  }

  // Calendar
  async getAppointmentsByDateRange(from: string, to: string): Promise<PaginatedResponse<CalendarAppointment>> {
    if (!USE_BACKEND) {
      return mockApi.getAppointmentsByDateRange(from, to)
    }

    const params = new URLSearchParams({
      scheduled_date_from: from,
      scheduled_date_to: to,
      per_page: '500',
    })

    try {
      return this.request(`/appointments?${params.toString()}`)
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.getAppointmentsByDateRange(from, to)
      }
      throw error
    }
  }

  async rescheduleAppointment(id: number, data: RescheduleData): Promise<ApiResponse<CalendarAppointment>> {
    if (!USE_BACKEND) {
      return mockApi.rescheduleAppointment(id, data)
    }

    try {
      return this.request(`/appointments/${id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (error) {
      if (this.isNetworkError(error)) {
        return mockApi.rescheduleAppointment(id, data)
      }
      throw error
    }
  }
}

export const api = new ApiClient()
