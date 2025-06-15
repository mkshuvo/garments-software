import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// API endpoints
export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    changePassword: '/api/auth/change-password',
    roles: '/api/auth/roles',
  },
  // Add more endpoints as needed
  products: {
    list: '/api/products',
    create: '/api/products',
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
    details: (id: string) => `/api/products/${id}`,
  },
  inventory: {
    list: '/api/inventory',
    update: (id: string) => `/api/inventory/${id}`,
  },
  customers: {
    list: '/api/customers',
    create: '/api/customers',
    update: (id: string) => `/api/customers/${id}`,
    delete: (id: string) => `/api/customers/${id}`,
  },
  orders: {
    list: '/api/orders',
    create: '/api/orders',
    update: (id: string) => `/api/orders/${id}`,
    details: (id: string) => `/api/orders/${id}`,
  },
  invoices: {
    list: '/api/invoices',
    create: '/api/invoices',
    update: (id: string) => `/api/invoices/${id}`,
    details: (id: string) => `/api/invoices/${id}`,
  },
}
