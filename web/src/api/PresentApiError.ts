import type { ApiErrorPresentation } from './ApiErrorPresentation'
import type { ApiError } from './ApiError'

export function presentApiError(error: ApiError): ApiErrorPresentation {
  switch (error.kind) {
    case 'configuration':
      return { messageKey: 'errors.missingBaseUrl' }
    case 'network':
      return { messageKey: 'errors.network' }
    case 'unauthorized':
      return { messageKey: 'errors.unauthorized' }
    case 'rejected':
      return error.status === undefined
        ? { messageKey: 'errors.unexpected' }
        : { messageKey: 'errors.rejected', values: { status: error.status } }
  }
}
