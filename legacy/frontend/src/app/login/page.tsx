'use client'

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Link as MuiLink,
} from '@mui/material'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import {
  FacebookIcon,
  XIcon,
  GoogleIcon,
  LinkedInIcon,
  VisibilityIcon,
  VisibilityOffIcon,
} from '@/components/icons/SocialIcons'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const hasRedirected = useRef(false)

  // Synchronous check for auth state before first paint
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('auth-storage')
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth)
          if (parsed?.state?.isAuthenticated && parsed?.state?.token && parsed?.state?.user) {
            if (!hasRedirected.current) {
              hasRedirected.current = true
              router.replace('/')
              return
            }
          }
        }
      } catch (e) {
        console.warn('Error checking stored auth:', e)
      }
    }
    setIsCheckingAuth(false)
  }, [router])

  // Secondary check using zustand state
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true
      router.replace('/')
    }
  }, [isAuthenticated, isInitialized, user, router])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email or username is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login({
        email: email.trim(),
        password: password
      })

      await login(response.user, response.token)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F4F7FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#4318FF' }} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F4F7FE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 480,
          p: { xs: 4, sm: 6 },
          borderRadius: '24px',
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2B3674',
              mb: 1,
            }}
          >
            Sign In
          </Typography>
          <Typography variant="body2" sx={{ color: '#A3AED0' }}>
            Don&apos;t have an account yet?{' '}
            <MuiLink
              href="#"
              sx={{
                color: '#4318FF',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign Up
            </MuiLink>
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ mb: 3, borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#2B3674',
                fontWeight: 500,
                mb: 1,
              }}
            >
              Email Address
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter email address *"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#A3AED0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4318FF',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                },
              }}
            />
          </Box>

          {/* Password Field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#2B3674',
                fontWeight: 500,
                mb: 1,
              }}
            >
              Your Password
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter password *"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
                      sx={{ color: '#A3AED0' }}
                    >
                      {showPassword ? <VisibilityOffIcon size={20} /> : <VisibilityIcon size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: '#E2E8F0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#A3AED0',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4318FF',
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '14px 16px',
                },
              }}
            />
          </Box>

          {/* Remember Me & Forgot Password */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#E2E8F0',
                    '&.Mui-checked': { color: '#4318FF' },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#2B3674' }}>
                  Remember me
                </Typography>
              }
            />
            <MuiLink
              href="#"
              sx={{
                color: '#4318FF',
                fontWeight: 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Forgot Password?
            </MuiLink>
          </Box>

          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.75,
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
              boxShadow: '0px 4px 12px rgba(67, 24, 255, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3610E8 0%, #6644EE 100%)',
                boxShadow: '0px 8px 20px rgba(67, 24, 255, 0.35)',
              },
              '&:disabled': {
                background: '#E2E8F0',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={{ my: 4 }}>
          <Divider>
            <Typography variant="caption" sx={{ color: '#A3AED0', px: 2 }}>
              or sign in with
            </Typography>
          </Divider>
        </Box>

        {/* Social Login Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <IconButton
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#1877F2',
              color: 'white',
              '&:hover': { backgroundColor: '#1565C0' },
            }}
          >
            <FacebookIcon size={20} />
          </IconButton>
          <IconButton
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#000000',
              color: 'white',
              '&:hover': { backgroundColor: '#333333' },
            }}
          >
            <XIcon size={20} />
          </IconButton>
          <IconButton
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#EA4335',
              color: 'white',
              '&:hover': { backgroundColor: '#D32F2F' },
            }}
          >
            <GoogleIcon size={20} />
          </IconButton>
          <IconButton
            sx={{
              width: 44,
              height: 44,
              backgroundColor: '#0A66C2',
              color: 'white',
              '&:hover': { backgroundColor: '#0D47A1' },
            }}
          >
            <LinkedInIcon size={20} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}
