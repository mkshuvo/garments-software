'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { allMessages } from './AllMessages'
import { LocaleContext } from './LocaleContext'
import { translateMessage } from './TranslateMessage'
import { writeLocaleCookie } from './WriteLocaleCookie'
import type { Locale } from './Locale'
import type { LocaleContextValue } from './LocaleContextValue'

export function LocaleProvider({
  initialLocale,
  children,
}: {
  readonly initialLocale: Locale
  readonly children: ReactNode
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const value = useMemo<LocaleContextValue>(() => {
    const messages = allMessages[locale]

    return {
      locale,
      t: (key, values) => translateMessage(messages, key, values),
      selectLocale: (next) => {
        writeLocaleCookie(next)
        setLocale(next)
      },
    }
  }, [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
