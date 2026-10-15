import { useLocaleContext } from './UseLocaleContext'
import type { Locale } from './Locale'

export function useLocale(): Locale {
  return useLocaleContext().locale
}
