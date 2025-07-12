'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Divider,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Email,
  Lock,
  ArrowBack,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuthStore } from '@/stores/authStore'
import { LoginDto } from '@/services/authService'

// Performance monitoring hook
const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startTime = performance.now()
      return () => {
        const endTime = performance.now()
        console.log(`${componentName} render time: ${endTime - startTime}ms`)
      }
    }
  })
}

// Keyboard shortcuts hook
const useKeyboardShortcuts = (onSubmit: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit form
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        onSubmit()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSubmit])
}

// Enhanced types
type LoginFormState = 'idle' | 'submitting' | 'success' | 'error'

// Constants
const VALIDATION_RULES = {
  MIN_USERNAME_LENGTH: 3,
  MIN_PASSWORD_LENGTH: 6,
} as const

// Validation schema
const loginSchema = yup.object({
  emailOrUsername: yup
    .string()
    .required('Email or username is required')
    .min(VALIDATION_RULES.MIN_USERNAME_LENGTH, `Must be at least ${VALIDATION_RULES.MIN_USERNAME_LENGTH} characters`)
    .trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(VALIDATION_RULES.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`),
})

type LoginFormData = yup.InferType<typeof loginSchema>

// Custom hook for login form management
const useLoginForm = () => {
  const { login } = useAuthStore()

  // Form setup with better error handling
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
    mode: 'onSubmit', // Change to onSubmit to prevent premature validation
    reValidateMode: 'onSubmit', // Don't revalidate on change
  })

  // Memoized submit handler with error handling
  const onSubmit = useCallback(async (data: LoginFormData) => {
    try {
      // Don't clear error here - let it persist until login attempt succeeds
      await login(data as LoginDto)
    } catch (loginError: unknown) {
      // Error is handled by the store, but we can add additional logging here
      console.error('Login failed:', loginError)
      // Re-throw to allow form-level error handling
      throw loginError
    }
  }, [login])

  return { form, onSubmit }
}

function LoginPage() {
  const redirectTo = '/' // Default redirect path
  usePerformanceMonitor('LoginPage')
  
  const router = useRouter()
  const { isAuthenticated, isLoading, error: authError, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formState, setFormState] = useState<LoginFormState>('idle')

  // Use custom hook for form management
  const { form, onSubmit } = useLoginForm()
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setFormState('success')
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  // Don't automatically clear errors on mount - let them persist
  // useEffect(() => {
  //   clearError()
  // }, []) // Commented out to allow errors to persist

  // Enhanced focus management - fix the selector
  useEffect(() => {
    const firstField = document.querySelector('[data-testid="email-input"] input') as HTMLInputElement
    if (firstField && !isAuthenticated) {
      // Delay focus to ensure proper rendering
      const timeoutId = setTimeout(() => {
        firstField.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isAuthenticated])

  // Monitor auth state to update form state
  useEffect(() => {
    console.log('Auth state changed:', { formState, isAuthenticated, authError })
    if (formState === 'submitting') {
      // Check if login was successful or failed
      if (isAuthenticated) {
        console.log('Login successful, setting form state to success')
        setFormState('success')
      } else if (authError) {
        console.log('Login failed, setting form state to error')
        setFormState('error')
      }
    }
  }, [isAuthenticated, authError, formState])

  // Focus management for error states
  useEffect(() => {
    if (authError && formState === 'error') {
      const errorElement = document.getElementById('login-error')
      if (errorElement) {
        errorElement.focus()
        // Announce error to screen readers
        errorElement.setAttribute('aria-live', 'assertive')
      }
    }
  }, [authError, formState])

  // Memoized callbacks
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const handleClearError = useCallback(() => {
    clearError()
    setFormState('idle')
  }, [clearError])

  // Enhanced submit handler with form state management
  const enhancedOnSubmit = useCallback(async (data: LoginFormData) => {
    console.log('Form submission started', { data, formState, authError })
    setFormState('submitting')
    try {
      await onSubmit(data)
      console.log('Form submission completed successfully')
      // Don't set success here - let the redirect useEffect handle it
    } catch (error) {
      console.log('Form submission failed', { error, authError })
      setFormState('error')
      // Don't clear the error here - let it persist until user manually clears it
      console.error('Login submission error:', error)
    }
  }, [onSubmit, formState, authError])

  // Add keyboard shortcuts - but prevent interference with form submission
  useKeyboardShortcuts(() => {
    if (!isSubmitting && formState !== 'submitting') {
      // Use the React Hook Form handleSubmit instead of dispatching events
      handleSubmit(enhancedOnSubmit)()
    }
  })

  // Enhanced loading state with better UX
  if (isLoading && !isSubmitting) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        role="status"
        aria-label="Loading authentication status"
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Checking authentication...
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                alignSelf: 'flex-start',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box textAlign="center">
              <Typography
                variant="h3"
                fontWeight="bold"
                color="primary.main"
                gutterBottom
              >
                GarmentsERP
              </Typography>
              <Typography variant="h4" fontWeight="600" gutterBottom>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your account to continue
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          {/* Enhanced Error Alert */}
          {authError && (
            <Alert
              severity="error"
              onClose={handleClearError}
              id="login-error"
              data-testid="login-error"
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              sx={{ 
                borderRadius: 2,
                mb: 3,
                '&:focus': {
                  outline: '2px solid',
                  outlineColor: 'error.main',
                  outlineOffset: '2px',
                }
              }}
            >
              <Typography component="span" sx={{ fontWeight: 500 }}>
                {authError}
              </Typography>
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form" 
            onSubmit={handleSubmit(enhancedOnSubmit)}
            noValidate
            role="form"
            aria-labelledby="login-title"
            aria-describedby={authError ? 'login-error' : 'login-description'}
            sx={{ width: '100%' }}
          >
            <Typography 
              id="login-description" 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 2, textAlign: 'center' }}
            >
              Enter your credentials to access your account
            </Typography>
            <Stack spacing={3}>
              {/* Email/Username Field */}
              <Controller
                name="emailOrUsername"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email or Username"
                    variant="outlined"
                    fullWidth
                    error={!!errors.emailOrUsername}
                    helperText={errors.emailOrUsername?.message}
                    disabled={isLoading || isSubmitting}
                    aria-describedby={errors.emailOrUsername ? 'email-error' : undefined}
                    data-testid="email-input"
                    onChange={field.onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" aria-hidden="true" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading || isSubmitting}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    data-testid="password-input"
                    onChange={field.onChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" aria-hidden="true" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={isLoading || isSubmitting}
                            data-testid="password-toggle"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}
              />

              {/* Login Button */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading || isSubmitting || formState === 'submitting'}
                startIcon={
                  (isLoading || isSubmitting || formState === 'submitting') ? 
                    <CircularProgress size={20} color="inherit" /> : 
                    <LoginIcon />
                }
                data-testid="login-button"
                aria-describedby={authError ? 'login-error' : undefined}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:disabled': {
                    opacity: 0.7,
                  },
                }}
              >
                {(isLoading || isSubmitting || formState === 'submitting') ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <Typography
                component="span"
                variant="body2"
                onClick={() => router.push('/register')}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                  '&:focus': { 
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                    borderRadius: 1,
                  },
                }}
              >
                Contact your administrator
              </Typography>
            </Typography>
            
            {/* Development info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <Typography 
                variant="caption" 
                color="text.disabled" 
                sx={{ mt: 2, display: 'block' }}
              >
                Form State: {formState} | Loading: {isLoading.toString()} | Submitting: {isSubmitting.toString()}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

// Export memoized component with display name for debugging
const MemoizedLoginPage = React.memo(LoginPage)
MemoizedLoginPage.displayName = 'LoginPage'

export default MemoizedLoginPage
