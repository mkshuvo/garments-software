import { localeCookieName } from './LocaleCookieName'
import type { Locale } from './Locale'

const oneYearInSeconds = 60 * 60 * 24 * 365

export function writeLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${localeCookieName}=${locale};path=/;max-age=${oneYearInSeconds};samesite=lax`
}
