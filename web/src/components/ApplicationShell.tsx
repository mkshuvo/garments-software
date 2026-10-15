'use client'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { designTokens } from '@/theme/Tokens'
import { AdminNavigationMenu } from './AdminNavigationMenu'
import { ApplicationDate } from './ApplicationDate'
import { LocaleSwitcher } from './LocaleSwitcher'
import { useTranslations } from '@/i18n/UseTranslations'
import type { ReactNode } from 'react'

export function ApplicationShell({ children }: { readonly children: ReactNode }) {
  const t = useTranslations()

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: designTokens.color.surfaceBase }}>
      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar variant="dense">
          <Typography variant="h2" sx={{ flexGrow: 1 }}>
            {t('app.name')}
          </Typography>
          <AdminNavigationMenu />
          <ApplicationDate />
          <LocaleSwitcher />
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ py: designTokens.space.xl, width: designTokens.layout.contentMaxWidth }}>
        {children}
      </Container>
    </Box>
  )
}
