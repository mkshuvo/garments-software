import { accessTokenStore } from '@/api/AccessTokenStore'
import { apiClient } from '@/api/ApiClient'
import { authLoginPath } from '@/api/AuthLoginPath'
import { readAccessToken } from './ReadAccessToken'
import type { LoginCredentials } from './LoginCredentials'
import type { AccessTokenPayload } from './AccessTokenPayload'

// P1 replaces this with the real token + session contract; until then an absent token is treated
// as "not signed in" rather than assumed, so the UI cannot claim a session it does not have.
export async function signIn(credentials: LoginCredentials): Promise<boolean> {
  const response = await apiClient.post<AccessTokenPayload>(authLoginPath, credentials)
  const token = readAccessToken(response.data)

  if (token === null) {
    accessTokenStore.clear()
    return false
  }

  accessTokenStore.write(token)
  return true
}
