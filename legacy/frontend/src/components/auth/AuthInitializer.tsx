'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Box, CircularProgress, Typography } from '@mui/material'

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth, isInitialized, isLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth on app load if not already initialized
    if (!isInitialized) {
      checkAuth().catch((error) => {
        console.error('Auth initialization failed:', error)
      })
    }
  }, [checkAuth, isInitialized])

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
        suppressHydrationWarning
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Initializing application...
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}
