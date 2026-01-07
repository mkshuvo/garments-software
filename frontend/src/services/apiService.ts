import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, ApiError } from '@/config/api'

class ApiService {
  private instance: AxiosInstance
  private isRedirecting = false
  private tokenValidationPromise: Promise<boolean> | null = null

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
    // Request interceptor to add auth token and validate it
    this.instance.interceptors.request.use(
      async (config) => {
        const token = this.getToken()
        if (token) {
          // Validate token before making request if it's an authenticated endpoint
          const isAuthRequired = !this.isPublicEndpoint(config.url || '')
          if (isAuthRequired && !(await this.isTokenValid(token))) {
            // Token is invalid, clear it and reject the request
            this.clearToken()
            throw new Error('Token is invalid or expired')
          }
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const status = error.response?.status

        if (status === 401) {
          return this.handle401Error(error)
        } else if (status === 403) {
          return this.handle403Error(error)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private async handle401Error(error: unknown): Promise<never> {
    // Prevent multiple simultaneous redirects
    if (this.isRedirecting) {
      return Promise.reject(this.formatError(error))
    }

    // Check if we're in development mode with fallback authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isFallbackMode = typeof window !== 'undefined' &&
      localStorage.getItem('auth_fallback_mode') === 'true'
    const shouldBypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

    if (isDevelopment && (isFallbackMode || shouldBypassAuth)) {
      console.warn('🔄 API call failed but in fallback mode - not redirecting to login')
      // In fallback mode, don't redirect but still reject the request
      // This allows individual services to handle the fallback
      return Promise.reject(this.formatError(error, 'Authentication required - please log in'))
    }

    this.isRedirecting = true

    try {
      // Clear token and auth state
      await this.clearAuthState()

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        const isAuthPage = this.isAuthRelatedPage(currentPath)

        if (!isAuthPage) {
          console.warn('Authentication failed - redirecting to login')
          // Use setTimeout to avoid redirect in interceptor context
          setTimeout(() => {
            window.location.href = '/login'
            this.isRedirecting = false
          }, 100)
        } else {
          this.isRedirecting = false
        }
      } else {
        this.isRedirecting = false
      }
    } catch (clearError) {
      console.error('Error clearing auth state:', clearError)
      this.isRedirecting = false
    }

    return Promise.reject(this.formatError(error, 'Your session has expired. Please log in again.'))
  }

  private handle403Error(error: unknown): Promise<never> {
    console.warn('Access denied - insufficient permissions')
    return Promise.reject(this.formatError(error, 'You do not have permission to access this resource.'))
  }

  private isAuthRelatedPage(path: string): boolean {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/setup-admin']
    return authPages.some(page => path.includes(page))
  }

  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password', '/api/health']
    return publicEndpoints.some(endpoint => url.includes(endpoint))
  }

  private async isTokenValid(token: string): Promise<boolean> {
    // Return cached validation result if available
    if (this.tokenValidationPromise) {
      return this.tokenValidationPromise
    }

    // Basic token format validation
    if (!token || token.split('.').length !== 3) {
      return false
    }

    try {
      // Decode JWT payload to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)

      // Check if token is expired (with 30 second buffer)
      if (payload.exp && payload.exp < currentTime + 30) {
        return false
      }

      return true
    } catch (error) {
      console.warn('Token validation failed:', error)
      return false
    }
  }

  private async clearAuthState(): Promise<void> {
    try {
      // Clear token from localStorage
      this.clearToken()

      // Clear auth store state
      const { useAuthStore } = await import('../stores/authStore')
      const authStore = useAuthStore.getState()
      authStore.logout()
    } catch (error) {
      console.error('Error clearing auth state:', error)
    }
  }

  private formatError(error: unknown, customMessage?: string): ApiError {
    if (typeof error === 'object' && error !== null && 'response' in error && (error as { response: unknown }).response) {
      const err = error as { response: { data?: { message?: string; errors?: string[] }, status: number } }
      return {
        message: customMessage || err.response.data?.message || this.getDefaultErrorMessage(err.response.status),
        errors: err.response.data?.errors,
        status: err.response.status,
      }
    } else if (typeof error === 'object' && error !== null && 'request' in error && (error as { request: unknown }).request) {
      return {
        message: customMessage || 'Network error - please check your connection',
        status: 0,
      }
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      return {
        message: customMessage || (error as { message: string }).message || 'An unexpected error occurred',
      }
    } else {
      return {
        message: customMessage || 'An unexpected error occurred',
      }
    }
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request - please check your input'
      case 401:
        return 'Authentication required - please log in'
      case 403:
        return 'Access denied - insufficient permissions'
      case 404:
        return 'Resource not found'
      case 409:
        return 'Conflict - resource already exists'
      case 422:
        return 'Validation failed - please check your input'
      case 429:
        return 'Too many requests - please try again later'
      case 500:
        return 'Server error - please try again later'
      case 502:
        return 'Service unavailable - please try again later'
      case 503:
        return 'Service temporarily unavailable'
      default:
        return 'An error occurred'
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

  async patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  // Token management
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
    // Clear any cached validation results when setting new token
    this.tokenValidationPromise = null
  }

  removeToken(): void {
    this.clearToken()
  }

  // Enhanced token validation method for external use
  async validateCurrentToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false
    return this.isTokenValid(token)
  }

  // Method to refresh token if supported by backend
  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getToken()
      if (!currentToken) {
        console.warn('No token available for refresh')
        return false
      }
      const response = await this.post<{ token: string }>('/api/auth/refresh', { token: currentToken })
      if (response.token) {
        this.setToken(response.token)
        return true
      }
      return false
    } catch (error) {
      console.warn('Token refresh failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
