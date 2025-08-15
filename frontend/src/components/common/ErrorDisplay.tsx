'use client'

import React, { useState, useCallback } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Stack,
  Chip,
  Paper,
  Divider,
  Tooltip
} from '@mui/material'
import {
  Error as ErrorIcon,
  Warning as WarningIcon,

  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material'
import { EnhancedError, ErrorSeverity, ErrorCategory } from '@/utils/errorHandling'
import { ValidationResult } from '@/services/validationService'

export interface ErrorDisplayProps {
  error?: EnhancedError | Error | string | null
  validationResult?: ValidationResult
  onRetry?: () => void
  onDismiss?: () => void
  showDetails?: boolean
  showRetryButton?: boolean
  showDismissButton?: boolean
  variant?: 'standard' | 'outlined' | 'filled'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const getSeverityColor = (severity: ErrorSeverity) => {
  switch (severity) {
    case ErrorSeverity.LOW:
      return 'info'
    case ErrorSeverity.MEDIUM:
      return 'warning'
    case ErrorSeverity.HIGH:
      return 'error'
    case ErrorSeverity.CRITICAL:
      return 'error'
    default:
      return 'error'
  }
}

const getCategoryIcon = (category: ErrorCategory) => {
  switch (category) {
    case ErrorCategory.VALIDATION:
      return <WarningIcon />
    case ErrorCategory.NETWORK:
      return <ErrorIcon />
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return <ErrorIcon />
    case ErrorCategory.SERVER:
      return <BugReportIcon />
    default:
      return <ErrorIcon />
  }
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  validationResult,
  onRetry,
  onDismiss,
  showDetails = false,
  showRetryButton = true,
  showDismissButton = false,
  variant = 'standard',
  className
}) => {
  const [expanded, setExpanded] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Handle enhanced error
  const enhancedError = error as EnhancedError
  const isEnhancedError = enhancedError && 'code' in enhancedError && 'category' in enhancedError

  // Handle validation errors
  const hasValidationErrors = validationResult && validationResult.errors.length > 0
  const hasValidationWarnings = validationResult && validationResult.warnings.length > 0

  // Determine what to display
  const shouldShowError = error || hasValidationErrors
  const shouldShowWarnings = hasValidationWarnings && !hasValidationErrors

  const handleToggleExpanded = useCallback(() => {
    setExpanded(!expanded)
  }, [expanded])

  const handleCopyError = useCallback(async () => {
    if (!error) return

    const errorInfo = isEnhancedError
      ? {
          code: enhancedError.code,
          category: enhancedError.category,
          severity: enhancedError.severity,
          userMessage: enhancedError.userMessage,
          technicalMessage: enhancedError.technicalMessage,
          timestamp: enhancedError.timestamp,
          context: enhancedError.context,
          details: enhancedError.details
        }
      : {
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }, [error, isEnhancedError, enhancedError])

  if (!shouldShowError && !shouldShowWarnings) {
    return null
  }

  // Render validation errors
  if (hasValidationErrors && validationResult) {
    return (
      <Box className={className}>
        <Alert
          severity="error"
          variant={variant}
          sx={{ mb: 1 }}
          action={
            showDismissButton && onDismiss ? (
              <Button size="small" onClick={onDismiss}>
                Dismiss
              </Button>
            ) : undefined
          }
        >
          <AlertTitle>Validation Errors</AlertTitle>
          <Stack spacing={1}>
            {validationResult.errors.map((validationError, index) => (
              <Typography key={index} variant="body2">
                <strong>{validationError.field}:</strong> {validationError.message}
              </Typography>
            ))}
          </Stack>
        </Alert>

        {/* Show warnings if any */}
        {hasValidationWarnings && (
          <Alert severity="warning" variant={variant} sx={{ mt: 1 }}>
            <AlertTitle>Warnings</AlertTitle>
            <Stack spacing={1}>
              {validationResult.warnings.map((warning, index) => (
                <Typography key={index} variant="body2">
                  <strong>{warning.field}:</strong> {warning.message}
                </Typography>
              ))}
            </Stack>
          </Alert>
        )}
      </Box>
    )
  }

  // Render validation warnings only
  if (shouldShowWarnings && validationResult) {
    return (
      <Alert
        severity="warning"
        variant={variant}
        className={className}
        action={
          showDismissButton && onDismiss ? (
            <Button size="small" onClick={onDismiss}>
              Dismiss
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>Warnings</AlertTitle>
        <Stack spacing={1}>
          {validationResult.warnings.map((warning, index) => (
            <Typography key={index} variant="body2">
              <strong>{warning.field}:</strong> {warning.message}
            </Typography>
          ))}
        </Stack>
      </Alert>
    )
  }

  // Render enhanced error
  if (isEnhancedError) {
    const severity = getSeverityColor(enhancedError.severity)
    const categoryIcon = getCategoryIcon(enhancedError.category)

    return (
      <Box className={className}>
        <Alert
          severity={severity}
          variant={variant}
          icon={categoryIcon}
          action={
            <Stack direction="row" spacing={1}>
              {enhancedError.retryable && showRetryButton && onRetry && (
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={onRetry}
                  variant="outlined"
                  color="inherit"
                >
                  Retry
                </Button>
              )}
              {showDetails && (
                <Tooltip title={copySuccess ? 'Copied!' : 'Copy error details'}>
                  <IconButton
                    size="small"
                    onClick={handleCopyError}
                    color="inherit"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {showDismissButton && onDismiss && (
                <Button size="small" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </Stack>
          }
        >
          <AlertTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">
                {enhancedError.userMessage}
              </Typography>
              <Chip
                label={enhancedError.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
              {enhancedError.retryable && (
                <Chip
                  label="Retryable"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </AlertTitle>

          {showDetails && (
            <>
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={handleToggleExpanded}
                  endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ p: 0, minWidth: 'auto' }}
                >
                  {expanded ? 'Hide Details' : 'Show Details'}
                </Button>
              </Box>

              <Collapse in={expanded}>
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'background.default',
                    borderRadius: 1
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Error Code
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {enhancedError.code}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Technical Message
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {enhancedError.technicalMessage}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Timestamp
                      </Typography>
                      <Typography variant="body2">
                        {enhancedError.timestamp.toLocaleString()}
                      </Typography>
                    </Box>

                    {enhancedError.context && Object.keys(enhancedError.context).length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Context
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              mt: 1,
                              backgroundColor: 'grey.50',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                              {JSON.stringify(enhancedError.context, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      </>
                    )}

                    {enhancedError.details && Object.keys(enhancedError.details).length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Technical Details
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1,
                              mt: 1,
                              backgroundColor: 'grey.50',
                              maxHeight: 200,
                              overflow: 'auto'
                            }}
                          >
                            <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                              {JSON.stringify(enhancedError.details, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      </>
                    )}
                  </Stack>
                </Paper>
              </Collapse>
            </>
          )}
        </Alert>
      </Box>
    )
  }

  // Render simple error
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  return (
    <Alert
      severity="error"
      variant={variant}
      className={className}
      action={
        <Stack direction="row" spacing={1}>
          {showRetryButton && onRetry && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              variant="outlined"
              color="inherit"
            >
              Retry
            </Button>
          )}
          {showDismissButton && onDismiss && (
            <Button size="small" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </Stack>
      }
    >
      <AlertTitle>Error</AlertTitle>
      <Typography variant="body2">{errorMessage}</Typography>
    </Alert>
  )
}

export default ErrorDisplay