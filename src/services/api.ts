/**
 * Base API Service - Staff Timetable System
 *
 * Cliente HTTP base para todas las comunicaciones con la API
 * - Configuración de axios para /staff-timetable/api
 * - Manejo de autenticación reusada del sistema principal
 * - Interceptors para request/response
 * - Error handling centralizado
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type AxiosError
} from 'axios'
import type { ApiError } from '@/types/api'
import { config } from '@/config'

class ApiService {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
    this.initializeToken()
  }

  private setupInterceptors() {
    // Request interceptor para agregar token del sistema principal
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor para manejo de errores
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        const responseData = error.response?.data as { detail?: string; type?: string } | undefined
        const apiError: ApiError = {
          detail: responseData?.detail || error.message || 'Unknown error',
          type: responseData?.type
        }

        // Si es 401, limpiar token (aunque el token se gestiona en el sistema principal)
        if (error.response?.status === 401) {
          this.clearToken()
        }

        return Promise.reject(apiError)
      }
    )
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private initializeToken() {
    this.token = localStorage.getItem('auth_token')
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiService = new ApiService()
