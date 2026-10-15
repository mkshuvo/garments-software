import { useContext } from 'react'
import { LocaleContext } from './LocaleContext'
import { LocaleProviderMissingError } from './LocaleProviderMissingError'
import type { LocaleContextValue } from './LocaleContextValue'

export function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext)

  if (value === null) {
    throw new LocaleProviderMissingError()
  }

  return value
}
