import { useLocaleContext } from './UseLocaleContext'
import type { Translator } from './Translator'

export function useTranslations(): Translator {
  return useLocaleContext().t
}
