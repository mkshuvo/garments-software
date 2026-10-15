import { isLocale } from './IsLocale'
import type { Locale } from './Locale'

const fallbackLocale: Locale = 'en'

export function defaultLocale(): Locale {
  const configured = process.env.NEXT_PUBLIC_DEFAULT_LOCALE
  return configured !== undefined && isLocale(configured) ? configured : fallbackLocale
}
