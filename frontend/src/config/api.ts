// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
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
    TRIAL_BALANCE: {
      BASE: '/api/trial-balance',
      GENERATE: '/api/trial-balance',
      ACCOUNT_TRANSACTIONS: '/api/trial-balance/account',
      COMPARE: '/api/trial-balance/compare',
    },
  },
  TIMEOUT: 10000, // 10 seconds
} as const

// API Response Types
export interface ApiResponse<T = unknown> {
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
