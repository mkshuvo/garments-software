'use client'

import { useState } from 'react'
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Collapse, 
  IconButton, 
  Typography,
  Chip
} from '@mui/material'
import { 
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { useServiceStatus, useBackendAvailability } from '@/hooks/useServiceStatus'

interface ServiceStatusBannerProps {
  showWhenHealthy?: boolean
  dismissible?: boolean
  showDetails?: boolean
  position?: 'top' | 'bottom'
}

export default function ServiceStatusBanner({
  showWhenHealthy = false,
  dismissible = true,
  showDetails = true,
  position = 'top'
}: ServiceStatusBannerProps) {
  const { isBackendHealthy, isFallbackMode, healthStatus } = useServiceStatus()
  const { refreshHealthStatus } = useBackendAvailability()
  
  const [dismissed, setDismissed] = useState(false)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const isDevelopment = process.env.NODE_ENV === 'development'

  // Don't show banner if dismissed or if backend is healthy and we don't want to show when healthy
  if (dismissed || (isBackendHealthy && !showWhenHealthy)) {
    return null
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshHealthStatus()
    } finally {
      setIsRefreshing(false)
    }
  }

  const getSeverity = () => {
    if (isBackendHealthy) return 'success'
    if (isFallbackMode && isDevelopment) return 'warning'
    return 'error'
  }

  const getTitle = () => {
    if (isBackendHealthy) return 'Backend Services Online'
    if (isFallbackMode && isDevelopment) return 'Development Mode - Using Mock Data'
    return 'Backend Services Unavailable'
  }

  const getMessage = () => {
    if (isBackendHealthy) {
      return `All backend services are operational. Response time: ${healthStatus?.responseTime}ms`
    }
    
    if (isFallbackMode && isDevelopment) {
      return 'Backend is not available, but the application is running in development mode with mock authentication and data.'
    }
    
    return `Backend services are currently unavailable. ${healthStatus?.error || 'Please try again later.'}`
  }

  const positionStyles = {
    top: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1400,
    },
    bottom: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1400,
    }
  }

  return (
    <Box sx={positionStyles[position]}>
      <Alert
        severity={getSeverity()}
        action={
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh status"
            >
              <RefreshIcon 
                sx={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </IconButton>
            
            {showDetails && (
              <IconButton
                size="small"
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                title={showDetailedInfo ? 'Hide details' : 'Show details'}
              >
                {showDetailedInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            
            {dismissible && (
              <IconButton
                size="small"
                onClick={() => setDismissed(true)}
                title="Dismiss"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
        icon={isBackendHealthy ? <CheckCircleIcon /> : <WarningIcon />}
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        <Typography variant="body2">
          {getMessage()}
        </Typography>
        
        {isDevelopment && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              label="Development Mode" 
              color="info" 
              size="small" 
              sx={{ mr: 1 }}
            />
            {isFallbackMode && (
              <Chip 
                label="Mock Authentication Active" 
                color="warning" 
                size="small" 
              />
            )}
          </Box>
        )}
        
        <Collapse in={showDetailedInfo}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Service Status Details
            </Typography>
            <Typography variant="body2" component="div">
              <strong>Last Checked:</strong> {healthStatus?.lastChecked?.toLocaleString()}<br />
              <strong>Status:</strong> {isBackendHealthy ? 'Healthy' : 'Unavailable'}<br />
              {healthStatus?.responseTime && (
                <>
                  <strong>Response Time:</strong> {healthStatus.responseTime}ms<br />
                </>
              )}
              {healthStatus?.error && (
                <>
                  <strong>Error:</strong> {healthStatus.error}<br />
                </>
              )}
              <strong>Retry Count:</strong> {healthStatus?.retryCount || 0}<br />
              {isFallbackMode && (
                <>
                  <strong>Fallback Mode:</strong> Active<br />
                  <strong>Authentication:</strong> Using mock data<br />
                </>
              )}
            </Typography>
          </Box>
        </Collapse>
      </Alert>
    </Box>
  )
}