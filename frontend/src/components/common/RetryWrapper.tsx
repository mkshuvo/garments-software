'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  LinearProgress,
  Alert,
  Fade,
  Paper
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { ErrorHandler } from '@/utils/errorHandling'
import { ErrorDisplay } from './ErrorDisplay'

export interface RetryWrapperProps<T> {
  operation: () => Promise<T>
  onSuccess: (data: T) => void
  onError?: (error: unknown) => void
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: unknown) => boolean
  children?: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  showProgress?: boolean
  showRetryButton?: boolean
  autoRetry?: boolean
  retryButtonText?: string
  className?: string
}

interface RetryState {
  isLoading: boolean
  error: unknown | null
  attempt: number
  maxAttempts: number
  nextRetryIn: number
  isRetrying: boolean
  hasSucceeded: boolean
}

export function RetryWrapper<T>({
  operation,
  onSuccess,
  onError,
  maxAttempts = 3,
  baseDelay = 1000,
  maxDelay = 10000,
  backoffFactor = 2,
  retryCondition,
  children,
  loadingComponent,
  errorComponent,
  showProgress = true,
  showRetryButton = true,
  autoRetry = false,

  className
}: RetryWrapperProps<T>) {
  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
    maxAttempts,
    nextRetryIn: 0,
    isRetrying: false,
    hasSucceeded: false
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  const executeOperation = useCallback(async (isRetry = false) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      isRetrying: isRetry,
      attempt: isRetry ? prev.attempt + 1 : 1
    }))

    try {
      const result = await operation()
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isRetrying: false,
        hasSucceeded: true
      }))

      onSuccess(result)
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error)
      const shouldRetry = retryCondition ? retryCondition(error) : enhancedError.retryable
      const canRetry = state.attempt < maxAttempts && shouldRetry

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: enhancedError,
        isRetrying: false
      }))

      if (onError) {
        onError(enhancedError)
      }

      // Auto retry if enabled and conditions are met
      if (autoRetry && canRetry) {
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, state.attempt),
          maxDelay
        )

        setState(prev => ({
          ...prev,
          nextRetryIn: Math.ceil(delay / 1000)
        }))

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setState(prev => {
            if (prev.nextRetryIn <= 1) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
              }
              return { ...prev, nextRetryIn: 0 }
            }
            return { ...prev, nextRetryIn: prev.nextRetryIn - 1 }
          })
        }, 1000)

        // Schedule retry
        retryTimeoutRef.current = setTimeout(() => {
          executeOperation(true)
        }, delay)
      }
    }
  }, [
    operation,
    onSuccess,
    onError,
    state.attempt,
    maxAttempts,
    baseDelay,
    maxDelay,
    backoffFactor,
    retryCondition,
    autoRetry
  ])

  const handleManualRetry = useCallback(() => {
    // Clear any pending auto-retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    setState(prev => ({ ...prev, nextRetryIn: 0 }))
    executeOperation(true)
  }, [executeOperation])

  const _handleCancelRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }

    setState(prev => ({ ...prev, nextRetryIn: 0 }))
  }, [])

  // Initial execution
  useEffect(() => {
    if (!state.hasSucceeded && !state.isLoading && !state.error) {
      executeOperation()
    }
  }, [executeOperation, state.hasSucceeded, state.isLoading, state.error])

  const canRetry = state.attempt < maxAttempts && state.error
  const progress = (state.attempt / maxAttempts) * 100

  const renderLoadingState = (): React.ReactNode => {
    if (!state.isLoading) return null
    
    return (
      <Fade in={true}>
        <Box>
          {loadingComponent ? loadingComponent : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  {state.isRetrying 
                    ? `Retrying... (Attempt ${state.attempt} of ${maxAttempts})`
                    : 'Loading...'
                  }
                </Typography>
                {showProgress && state.isRetrying && (
                  <Box sx={{ width: '100%', maxWidth: 300 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Progress: {Math.round(progress)}%
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}
        </Box>
      </Fade>
    )
  }

  const renderErrorState = (): React.ReactNode => {
    if (!state.error || state.isLoading) return null
    
    return (
      <Fade in={true}>
        <Box>
          {errorComponent || (
            <ErrorDisplay
              error={state.error as Error}
              onRetry={canRetry && showRetryButton ? handleManualRetry : undefined}
              showDetails={true}
              showRetryButton={Boolean(canRetry && showRetryButton)}
            />
          )}

          {/* Auto-retry countdown */}
          {Boolean(autoRetry && canRetry && state.nextRetryIn > 0) && (
            <Alert
              severity="info"
              sx={{ mt: 2 }}
              icon={<CheckCircleIcon />}
            >
              <Typography variant="body2">
                Retrying automatically in {state.nextRetryIn} seconds...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={((baseDelay - state.nextRetryIn * 1000) / baseDelay) * 100}
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
            </Alert>
          )}
        </Box>
      </Fade>
    )
  }

  const renderSuccessState = (): React.ReactNode => {
    if (!state.hasSucceeded || state.isLoading || state.error) return null
    
    return children
  }

  return (
    <div className={className}>
      {/* Loading State */}
      {renderLoadingState()}

      {/* Error State */}
      {renderErrorState()}

      {/* Success State */}
      {renderSuccessState()}
    </div>
  )
}

export default RetryWrapper