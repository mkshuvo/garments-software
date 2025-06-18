'use client'

import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link as MuiLink,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore, LoginCredentials } from '@/stores/authStore'

// Validation schema
const loginSchema = yup.object({
  emailOrUsername: yup
    .string()
    .required('Email or username is required')
    .min(3, 'Must be at least 3 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      emailOrUsername: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearError()
      await login(data)
      router.push('/') // Redirect to dashboard after successful login
    } catch (err) {
      // Error is handled by the auth store
      console.error('Login failed:', err)
    }
  }

  if (isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Logo/Title */}
          <Typography component="h1" variant="h4" color="primary" sx={{ mb: 1 }}>
            GarmentsERP
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%', mb: 2 }}
              onClose={clearError}
            >
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <Controller
              name="emailOrUsername"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email or Username"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.emailOrUsername}
                  helperText={errors.emailOrUsername?.message}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link href="/register" passHref>
                  <MuiLink component="span" variant="body2">
                    Sign up here
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
