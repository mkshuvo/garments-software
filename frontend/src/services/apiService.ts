import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, ApiError } from '@/config/api'

class ApiService {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(this.formatError(error))
      }
    )
  }

  private formatError(error: unknown): ApiError {
    if (typeof error === 'object' && error !== null && 'response' in error && (error as { response: unknown }).response) {
      const err = error as { response: { data?: { message?: string; errors?: string[] }, status: number } }
      return {
        message: err.response.data?.message || 'An error occurred',
        errors: err.response.data?.errors,
        status: err.response.status,
      }
    } else if (typeof error === 'object' && error !== null && 'request' in error && (error as { request: unknown }).request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
      }
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      return {
        message: (error as { message: string }).message || 'An unexpected error occurred',
      }
    } else {
      return {
        message: 'An unexpected error occurred',
      }
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  // HTTP Methods
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  // Token management
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  }

  removeToken(): void {
    this.clearToken()
  }
}

// Export singleton instance
export const apiService = new ApiService()
