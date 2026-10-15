import type { Locale } from './Locale'
import type { Translator } from './Translator'

export type LocaleContextValue = {
  readonly locale: Locale
  readonly t: Translator
  readonly selectLocale: (next: Locale) => void
}
