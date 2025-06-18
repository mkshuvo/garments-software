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
  MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'

// Validation schema
const registerSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  contactNumber: yup
    .string()
    .optional()
    .max(20, 'Contact number must not exceed 20 characters'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['Employee', 'Manager', 'Admin'], 'Please select a valid role'),
})

const roles = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Admin', label: 'Admin' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore()
  const [successMessage, setSuccessMessage] = React.useState('')

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
    reset,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: '',
      contactNumber: '',
      role: 'Employee',
    },
  })
  const onSubmit = async (data: {
    username: string;
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    contactNumber?: string;
    role: string;
  }) => {
    try {
      clearError()
      setSuccessMessage('')
      
      // Transform form data to match RegisterData interface
      const registerData = {
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        confirmPassword: data.confirmPassword,
        contactNumber: data.contactNumber || undefined,
        role: data.role,
      }
      
      await register(registerData)
      setSuccessMessage('Registration successful! You can now sign in.')
      reset()
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      // Error is handled by the auth store
      console.error('Registration failed:', err)
    }
  }

  if (isAuthenticated) {
    return null // Don't render anything while redirecting
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 4,
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
            maxWidth: 600,
          }}
        >
          {/* Logo/Title */}
          <Typography component="h1" variant="h4" color="primary" sx={{ mb: 1 }}>
            GarmentsERP
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Create your account
          </Typography>

          {/* Success Alert */}
          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {successMessage}
            </Alert>
          )}

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

          {/* Registration Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ width: '100%' }}
          >
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username"
                    variant="outlined"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                )}
              />

              <Controller
                name="fullName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    disabled={isLoading}
                    autoComplete="name"
                    sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
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
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    variant="outlined"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                )}
              />

              <Controller
                name="contactNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Contact Number (Optional)"
                    variant="outlined"
                    error={!!errors.contactNumber}
                    helperText={errors.contactNumber?.message}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                )}
              />

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Role"
                    variant="outlined"
                    error={!!errors.role}
                    helperText={errors.role?.message}
                    disabled={isLoading}
                  >
                    {roles.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>

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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" passHref>
                  <MuiLink component="span" variant="body2">
                    Sign in here
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
