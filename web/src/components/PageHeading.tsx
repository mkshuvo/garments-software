'use client'

import Typography from '@mui/material/Typography'
import { useTranslations } from '@/i18n/UseTranslations'
import type { MessageKey } from '@/i18n/MessageKey'

export function PageHeading({ messageKey }: { readonly messageKey: MessageKey }) {
  const t = useTranslations()

  return (
    <Typography variant="h1" component="h1">
      {t(messageKey)}
    </Typography>
  )
}
