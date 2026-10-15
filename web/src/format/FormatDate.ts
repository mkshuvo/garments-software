import type { Locale } from '@/i18n/Locale'

const dateStyle: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, dateStyle).format(date)
}
