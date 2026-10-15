'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import { ErrorBoundary } from 'react-error-boundary'
import ServiceStatusIndicator from '@/components/ui/ServiceStatusIndicator'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Error fallback component for auth failures
function AuthErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const router = useRouter()
  const isDevelopmentMode = process.env.NODE_ENV === 'development'

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="60vh"
      gap={3}
      sx={{ p: 3 }}
    >
      <Alert severity="error" sx={{ maxWidth: 600 }}>
        <Typography variant="h6" gutterBottom>
          Authentication System Error
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error.message || 'An unexpected error occurred in the authentication system'}
        </Typography>
        {isDevelopmentMode && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label="Development Mode" 
              color="info" 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              💡 Tip: Set NEXT_PUBLIC_BYPASS_AUTH=true in .env.local to bypass authentication
            </Typography>
          </Box>
        )}
      </Alert>
      
      <Box display="flex" gap={2}>
        <Button 
          variant="contained" 
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/login')}
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  )
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized, 
    checkAuth,
    checkForBackendRecovery
  } = useAuthStore()
  const router = useRouter()
  
  // State management
  const [authCheckComplete, setAuthCheckComplete] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isDevelopmentMode] = useState(process.env.NODE_ENV === 'development')
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  
  // Refs to prevent race conditions and multiple simultaneous operations
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRedirectingRef = useRef(false)
  const isAuthCheckingRef = useRef(false)
  const mountedRef = useRef(true)

  // Cleanup function to clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }
    if (authCheckTimeoutRef.current) {
      clearTimeout(authCheckTimeoutRef.current)
      authCheckTimeoutRef.current = null
    }
  }, [])

  // Prevent multiple simultaneous redirects
  const performRedirect = useCallback(() => {
    if (isRedirectingRef.current || !mountedRef.current) {
      return
    }

    isRedirectingRef.current = true
    setRedirecting(true)
    
    // Clear any existing redirect timeout
    clearTimeouts()
    
    // Set a timeout to prevent infinite redirect loops
    redirectTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      
      try {
        router.replace('/login')
      } catch (redirectError) {
        console.error('Redirect to login failed:', redirectError)
        if (mountedRef.current) {
          setError('Unable to redirect to login page')
          setRedirecting(false)
          isRedirectingRef.current = false
        }
      }
    }, 2000) // 2 second delay for better UX
  }, [router, clearTimeouts])

  const handleRetry = useCallback(async () => {
    if (isAuthCheckingRef.current || !mountedRef.current) {
      return
    }

    isAuthCheckingRef.current = true
    setError(null)
    setRetryCount(prev => prev + 1)
    setAuthCheckComplete(false)
    setRedirecting(false)
    isRedirectingRef.current = false
    clearTimeouts()
    
    try {
      // Add timeout for auth check to prevent hanging
      const authCheckPromise = checkAuth()
      const timeoutPromise = new Promise((_, reject) => {
        authCheckTimeoutRef.current = setTimeout(() => {
          reject(new Error('Authentication check timed out after 30 seconds'))
        }, 30000) // 30 second timeout
      })

      await Promise.race([authCheckPromise, timeoutPromise])
      
      // Clear timeout if auth check completed successfully
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current)
        authCheckTimeoutRef.current = null
      }
    } catch (error) {
      console.error('Auth retry failed:', error)
      if (mountedRef.current) {
        setError(error instanceof Error ? error.message : 'Authentication failed')
      }
    } finally {
      if (mountedRef.current) {
        setAuthCheckComplete(true)
        isAuthCheckingRef.current = false
      }
    }
  }, [checkAuth, clearTimeouts])

  // Check for fallback mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fallbackMode = localStorage.getItem('auth_fallback_mode') === 'true'
      setIsFallbackMode(fallbackMode)
    }
  }, [isAuthenticated])

  // Periodic check for backend recovery when in fallback mode
  useEffect(() => {
    if (!isFallbackMode || !isAuthenticated) {
      return
    }

    const recoveryCheckInterval = setInterval(async () => {
      try {
        await checkForBackendRecovery()
      } catch (error) {
        console.error('Backend recovery check failed:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(recoveryCheckInterval)
  }, [isFallbackMode, isAuthenticated, checkForBackendRecovery])

  // Initialize auth check on mount with timeout protection
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthCheckingRef.current || !mountedRef.current) {
        return
      }

      isAuthCheckingRef.current = true
      
      try {
        setError(null)
        
        // Add timeout for initial auth check
        const authCheckPromise = checkAuth()
        const timeoutPromise = new Promise((_, reject) => {
          authCheckTimeoutRef.current = setTimeout(() => {
            reject(new Error('Initial authentication check timed out after 30 seconds'))
          }, 30000) // 30 second timeout
        })

        await Promise.race([authCheckPromise, timeoutPromise])
        
        // Clear timeout if auth check completed successfully
        if (authCheckTimeoutRef.current) {
          clearTimeout(authCheckTimeoutRef.current)
          authCheckTimeoutRef.current = null
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : 'Authentication initialization failed')
        }
      } finally {
        if (mountedRef.current) {
          setAuthCheckComplete(true)
          isAuthCheckingRef.current = false
        }
      }
    }

    // Only run if auth hasn't been initialized yet
    if (!isInitialized && !authCheckComplete) {
      initializeAuth()
    } else if (isInitialized) {
      setAuthCheckComplete(true)
    }
  }, [checkAuth, isInitialized, authCheckComplete])

  // Handle redirect logic after auth is fully initialized
  useEffect(() => {
    if (authCheckComplete && isInitialized && !isLoading && !isAuthenticated && !redirecting && !error && !isRedirectingRef.current) {
      // Check if we're in development mode and should show a different message
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      if (isDevelopment) {
        console.warn('🔒 Authentication required but user not authenticated in development mode')
        console.log('💡 Tip: Set NEXT_PUBLIC_BYPASS_AUTH=true to bypass authentication in development')
      }
      
      performRedirect()
    }
  }, [authCheckComplete, isInitialized, isLoading, isAuthenticated, redirecting, error, performRedirect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      clearTimeouts()
      isRedirectingRef.current = false
      isAuthCheckingRef.current = false
    }
  }, [clearTimeouts])

  // Show error state if authentication failed
  if (error && authCheckComplete) {
    return fallback || (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        gap={3}
        sx={{ p: 3 }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Error
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
          {isDevelopmentMode && (
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Development Mode" 
                color="info" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                💡 Tip: Set NEXT_PUBLIC_BYPASS_AUTH=true in .env.local to bypass authentication
              </Typography>
            </Box>
          )}
        </Alert>
        
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            onClick={handleRetry}
            disabled={isLoading || isAuthCheckingRef.current}
          >
            {(isLoading || isAuthCheckingRef.current) ? 'Retrying...' : `Retry${retryCount > 0 ? ` (${retryCount})` : ''}`}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => router.push('/login')}
            disabled={isRedirectingRef.current}
          >
            Go to Login
          </Button>
        </Box>
      </Box>
    )
  }

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
          {isLoading ? 'Checking authentication...' : 'Initializing authentication...'}
        </Typography>
        {isDevelopmentMode && (
          <Chip 
            label="Development Mode" 
            color="info" 
            size="small" 
          />
        )}
      </Box>
    )
  }

  // Show loading while redirecting to login
  if (redirecting || (isInitialized && !isAuthenticated && !error)) {
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
    return (
      <ErrorBoundary
        FallbackComponent={AuthErrorFallback}
        onError={(error, errorInfo) => {
          console.error('Authentication error boundary caught an error:', error, errorInfo)
        }}
        onReset={() => {
          // Reset error state and retry authentication
          setError(null)
          setAuthCheckComplete(false)
          setRedirecting(false)
          isRedirectingRef.current = false
          isAuthCheckingRef.current = false
          clearTimeouts()
        }}
      >
        {/* Show service status indicator */}
        <ServiceStatusIndicator 
          showDetails={isDevelopmentMode} 
          position="top-right" 
        />
        {children}
      </ErrorBoundary>
    )
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
