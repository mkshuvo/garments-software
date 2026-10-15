import { createContext } from 'react'
import type { LocaleContextValue } from './LocaleContextValue'

export const LocaleContext = createContext<LocaleContextValue | null>(null)
