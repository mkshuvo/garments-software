import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { defaultLocale } from '@/i18n/DefaultLocale'
import { isLocale } from '@/i18n/IsLocale'
import { localeCookieName } from '@/i18n/LocaleCookieName'
import { allMessages } from '@/i18n/AllMessages'
import { translateMessage } from '@/i18n/TranslateMessage'
import type { Locale } from '@/i18n/Locale'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { bengaliFont, latinFont } from '@/theme/AppFonts'
import './globals.css'

export function generateMetadata(): Metadata {
  const messages = allMessages[defaultLocale()]

  return {
    title: translateMessage(messages, 'app.name'),
    description: translateMessage(messages, 'login.subtitle'),
  }
}

async function resolvedLocale(): Promise<Locale> {
  const stored = (await cookies()).get(localeCookieName)?.value
  return stored !== undefined && isLocale(stored) ? stored : defaultLocale()
}

export default async function RootLayout({ children }: { readonly children: ReactNode }) {
  const locale = await resolvedLocale()

  return (
    <html lang={locale} className={`${latinFont.variable} ${bengaliFont.variable}`}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>{children}</ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
