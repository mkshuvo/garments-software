import type { AccessTokenPayload } from './AccessTokenPayload'

export function readAccessToken(payload: AccessTokenPayload): string | null {
  const candidate = payload.accessToken ?? payload.token
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null
}
