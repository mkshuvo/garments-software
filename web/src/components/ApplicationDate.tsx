'use client'

import Typography from '@mui/material/Typography'
import { formatDate } from '@/format/FormatDate'
import { useLocale } from '@/i18n/UseLocale'
import { useTranslations } from '@/i18n/UseTranslations'

export function ApplicationDate() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <Typography variant="caption" component="span">
      {t('admin.openedOn', { date: formatDate(new Date(), locale) })}
    </Typography>
  )
}
