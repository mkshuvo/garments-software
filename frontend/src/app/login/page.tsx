'use client'

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowBack,
} from '@mui/icons-material'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const hasRedirected = useRef(false)

  // Synchronous check for auth state before first paint
  useLayoutEffect(() => {
    // Check localStorage directly for instant check (zustand persist stores here)
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('auth-storage')
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth)
          if (parsed?.state?.isAuthenticated && parsed?.state?.token && parsed?.state?.user) {
            // User is logged in, redirect immediately without rendering login form
            if (!hasRedirected.current) {
              hasRedirected.current = true
              const userRole = parsed.state.user.role || parsed.state.user.roles?.[0]
              const redirectPath = userRole === 'Admin' ? '/admin' : '/'
              router.replace(redirectPath)
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

  // Secondary check using zustand state (for state changes after mount)
  useEffect(() => {
    if (isInitialized && isAuthenticated && user && !hasRedirected.current) {
      hasRedirected.current = true
      const userRole = user.role || user.roles?.[0]
      const redirectPath = userRole === 'Admin' ? '/admin' : '/'
      router.replace(redirectPath)
    }
  }, [isAuthenticated, isInitialized, user, router])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous error
    setError('')

    // Basic validation
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

      // Use the async login method
      await login(response.user, response.token)
      // Success - redirect handled by useEffect
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Login failed. Please try again.')
      }
    }
  }

  // Show minimal loading while checking auth to prevent flash
  if (isCheckingAuth) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
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
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: 'text.secondary',
              }}
            >
              <ArrowBack />
            </IconButton>

            <Typography
              variant="h3"
              fontWeight="bold"
              color="primary.main"
              gutterBottom
            >
              GarmentsERP
            </Typography>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError('')}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email or Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              margin="normal"
              required
              autoComplete="username"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isLoading}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
              }}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Need help? Contact your administrator
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
