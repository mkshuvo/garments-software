import type { ApiFailureKind } from './ApiFailureKind'

export class ApiError extends Error {
  public readonly kind: ApiFailureKind

  public readonly status: number | undefined

  public readonly detail: string | undefined

  public constructor(kind: ApiFailureKind, status?: number, detail?: string) {
    super(`api:${kind}${status === undefined ? '' : `:${status}`}${detail === undefined ? '' : ` ${detail}`}`)
    this.kind = kind
    this.status = status
    this.detail = detail
  }
}
