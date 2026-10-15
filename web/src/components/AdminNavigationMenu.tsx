'use client'

import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { designTokens } from '@/theme/Tokens'
import { adminNavigation } from '@/navigation/AdminNavigation'
import { useTranslations } from '@/i18n/UseTranslations'

export function AdminNavigationMenu() {
  const t = useTranslations()

  return (
    <Box
      component="nav"
      aria-label={t('app.sectionAdmin')}
      sx={{ display: 'flex', gap: designTokens.space.sm, flexWrap: 'wrap' }}
    >
      {adminNavigation.map((item) => (
        <Button key={item.href} component={Link} href={item.href} size="small">
          {t(item.key)}
        </Button>
      ))}
    </Box>
  )
}
