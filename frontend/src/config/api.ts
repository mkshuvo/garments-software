// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      CHANGE_PASSWORD: '/api/auth/change-password',
      ROLES: '/api/auth/roles',
    },
    HEALTH: {
      BASIC: '/api/health',
      DETAILED: '/api/health/detailed',
    },
  },
  TIMEOUT: 10000, // 10 seconds
} as const

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  data?: T
  errors?: string[]
}

// Error Response Type
export interface ApiError {
  message: string
  errors?: string[]
  status?: number
}
