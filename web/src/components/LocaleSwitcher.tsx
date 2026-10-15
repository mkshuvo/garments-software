'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { supportedLocales } from '@/i18n/Locale'
import { useLocale } from '@/i18n/UseLocale'
import { useLocaleContext } from '@/i18n/UseLocaleContext'
import type { Locale } from '@/i18n/Locale'
import type { MessageKey } from '@/i18n/MessageKey'

const localeLabelKeys: Record<Locale, MessageKey> = {
  en: 'locale.en',
  bn: 'locale.bn',
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const { t, selectLocale } = useLocaleContext()

  return (
    <Box role="group" aria-label={t('locale.switch')} sx={{ display: 'flex', gap: 0.5 }}>
      {supportedLocales.map((option) => (
        <Button
          key={option}
          size="small"
          variant={option === locale ? 'contained' : 'text'}
          onClick={() => {
            selectLocale(option)
          }}
        >
          {t(localeLabelKeys[option])}
        </Button>
      ))}
    </Box>
  )
}
