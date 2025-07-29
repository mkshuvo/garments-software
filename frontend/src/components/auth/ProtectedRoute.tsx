'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized, 
    checkAuth
  } = useAuthStore()
  const router = useRouter()
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Initialize auth check on mount
    const initializeAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setAuthCheckComplete(true)
      }
    }

    // Only run if auth hasn't been initialized yet
    if (!isInitialized && !authCheckComplete) {
      initializeAuth()
    } else if (isInitialized) {
      setAuthCheckComplete(true)
    }
  }, [checkAuth, isInitialized, authCheckComplete])

  useEffect(() => {
    // Handle redirect logic after auth is fully initialized
    if (authCheckComplete && isInitialized && !isLoading && !isAuthenticated && !redirecting) {
      setRedirecting(true)
      
      // Small delay to prevent race conditions
      const redirectTimer = setTimeout(() => {
        router.replace('/login')
      }, 100)

      return () => clearTimeout(redirectTimer)
    }
  }, [authCheckComplete, isInitialized, isLoading, isAuthenticated, redirecting, router])

  // Show loading while auth is being initialized or checked
  if (!authCheckComplete || isLoading || !isInitialized) {
    return fallback || (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Initializing authentication...
        </Typography>
      </Box>
    )
  }

  // Show loading while redirecting to login
  if (redirecting || (isInitialized && !isAuthenticated)) {
    return fallback || (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    )
  }

  // Only render children if user is authenticated and auth is fully initialized
  if (isInitialized && isAuthenticated && authCheckComplete) {
    return <>{children}</>
  }

  // Fallback loading state for edge cases
  return fallback || (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="60vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  )
}
