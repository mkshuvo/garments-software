import { ApiError } from './ApiError'

const environmentVariable = 'NEXT_PUBLIC_API_BASE_URL'

export function apiBaseUrl(): string {
  const configured = process.env[environmentVariable]?.trim()

  if (configured === undefined || configured.length === 0) {
    throw new ApiError('configuration', undefined, `${environmentVariable} is not set`)
  }

  if (!/^https?:\/\//.test(configured)) {
    throw new ApiError('configuration', undefined, `${environmentVariable} must be an absolute http(s) origin`)
  }

  return configured.endsWith('/') ? configured.slice(0, -1) : configured
}
