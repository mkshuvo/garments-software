'use client'

import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { designTokens } from '@/theme/Tokens'
import { useTranslations } from '@/i18n/UseTranslations'
import type { MessageKey } from '@/i18n/MessageKey'

export function EmptyState({ titleKey, bodyKey }: { readonly titleKey: MessageKey; readonly bodyKey: MessageKey }) {
  const t = useTranslations()

  return (
    <Paper
      variant="outlined"
      sx={{
        p: designTokens.space.xl,
        backgroundColor: designTokens.color.surfaceMuted,
        borderRadius: `${designTokens.radius.small}px`,
        textAlign: 'center',
      }}
    >
      <Typography variant="h2" sx={{ color: designTokens.color.textSecondary }}>
        {t(titleKey)}
      </Typography>
      <Typography variant="body2" sx={{ mt: designTokens.space.md, color: designTokens.color.textSecondary }}>
        {t(bodyKey)}
      </Typography>
    </Paper>
  )
}
