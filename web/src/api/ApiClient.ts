import axios from 'axios'
import { apiBaseUrl } from './ApiBaseUrl'
import { accessTokenStore } from './AccessTokenStore'
import { toApiError } from './ToApiError'

const requestTimeoutMs = 15_000

// L12: this is the only axios instance and the only auth interceptor in the frontend. The base
// URL is resolved per request because an unset NEXT_PUBLIC_API_BASE_URL must fail the request
// with a readable error, not crash the build that imports this module.
export const apiClient = axios.create({ timeout: requestTimeoutMs })

apiClient.interceptors.request.use((config) => {
  config.baseURL = apiBaseUrl()
  const token = accessTokenStore.read()

  if (token !== null) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
