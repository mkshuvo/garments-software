import { AxiosError } from 'axios'
import { ApiError } from './ApiError'

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status

    if (status === undefined) {
      return new ApiError('network', undefined, error.message)
    }

    return new ApiError(status === 401 ? 'unauthorized' : 'rejected', status, error.response?.statusText)
  }

  return new ApiError('network', undefined, error instanceof Error ? error.message : String(error))
}
