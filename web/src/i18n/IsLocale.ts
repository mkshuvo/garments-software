import type { Locale } from './Locale'
import { supportedLocales } from './Locale'

export function isLocale(candidate: string): candidate is Locale {
  return supportedLocales.some((locale) => locale === candidate)
}
