'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useTranslations } from '@/i18n/UseTranslations'
import type { MessageKey } from '@/i18n/MessageKey'
import type { MessageValues } from '@/i18n/MessageValues'

export function ErrorState({
  messageKey,
  values,
  onRetry,
}: {
  readonly messageKey: MessageKey
  readonly values?: MessageValues
  readonly onRetry?: () => void
}) {
  const t = useTranslations()

  return (
    <Alert
      severity="error"
      action={
        onRetry === undefined ? undefined : (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        )
      }
    >
      {t(messageKey, values)}
    </Alert>
  )
}
