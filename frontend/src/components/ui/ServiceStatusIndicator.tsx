'use client'

import { useEffect, useState } from 'react'
import { Box, Chip, Tooltip, IconButton, Alert, Collapse } from '@mui/material'
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material'
import { healthCheckService, type HealthStatus } from '@/services/healthCheckService'

interface ServiceStatusIndicatorProps {
  showDetails?: boolean
  position?: 'top-right' | 'bottom-right' | 'inline'
  size?: 'small' | 'medium'
}

export default function ServiceStatusIndicator({ 
  showDetails = false, 
  position = 'top-right',
  size = 'small'
}: ServiceStatusIndicatorProps) {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [showDetailedStatus, setShowDetailedStatus] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    // Get initial health status
    setHealthStatus(healthCheckService.getHealthStatus())

    // Subscribe to health status changes
    const unsubscribe = healthCheckService.onHealthStatusChange((status) => {
      setHealthStatus(status)
    })

    return unsubscribe
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await healthCheckService.checkHealth({ retryAttempts: 2 })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = () => {
    if (!healthStatus) return 'default'
    if (healthStatus.isHealthy) return 'success'
    if (isDevelopment) return 'warning'
    return 'error'
  }

  const getStatusIcon = () => {
    if (!healthStatus) return <WarningIcon fontSize="small" />
    if (healthStatus.isHealthy) return <CheckCircleIcon fontSize="small" />
    if (isDevelopment) return <WarningIcon fontSize="small" />
    return <ErrorIcon fontSize="small" />
  }

  const getStatusText = () => {
    if (!healthStatus) return 'Checking...'
    if (healthStatus.isHealthy) return 'Backend Online'
    if (isDevelopment) return 'Mock Mode'
    return 'Backend Offline'
  }

  const getTooltipText = () => {
    if (!healthStatus) return 'Checking backend status...'
    
    if (healthStatus.isHealthy) {
      return `Backend is healthy (${healthStatus.responseTime}ms)`
    }
    
    if (isDevelopment) {
      return 'Backend unavailable - using mock authentication for development'
    }
    
    return `Backend unavailable: ${healthStatus.error || 'Unknown error'}`
  }

  const positionStyles = {
    'top-right': {
      position: 'fixed' as const,
      top: 16,
      right: 16,
      zIndex: 1300,
    },
    'bottom-right': {
      position: 'fixed' as const,
      bottom: 16,
      right: 16,
      zIndex: 1300,
    },
    'inline': {}
  }

  if (!healthStatus) {
    return null
  }

  const statusChip = (
    <Tooltip title={getTooltipText()}>
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        size={size}
        variant={healthStatus.isHealthy ? 'filled' : 'outlined'}
        onClick={showDetails ? () => setShowDetailedStatus(!showDetailedStatus) : undefined}
        sx={{ 
          cursor: showDetails ? 'pointer' : 'default',
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '16px' : '20px'
          }
        }}
      />
    </Tooltip>
  )

  const refreshButton = (
    <Tooltip title="Refresh backend status">
      <IconButton
        size="small"
        onClick={handleRefresh}
        disabled={isRefreshing}
        sx={{ ml: 1 }}
      >
        <RefreshIcon 
          fontSize="small" 
          sx={{ 
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} 
        />
      </IconButton>
    </Tooltip>
  )

  const detailsContent = showDetails && (
    <Collapse in={showDetailedStatus}>
      <Alert 
        severity={healthStatus.isHealthy ? 'success' : isDevelopment ? 'warning' : 'error'}
        sx={{ mt: 1, maxWidth: 400 }}
        action={
          <IconButton
            size="small"
            onClick={() => setShowDetailedStatus(false)}
          >
            <ExpandLessIcon />
          </IconButton>
        }
      >
        <Box>
          <strong>Backend Status Details</strong>
          <br />
          <small>
            Last checked: {healthStatus.lastChecked.toLocaleTimeString()}
            <br />
            {healthStatus.isHealthy ? (
              <>
                Response time: {healthStatus.responseTime}ms
                <br />
                Status: All services operational
              </>
            ) : (
              <>
                Error: {healthStatus.error || 'Unknown error'}
                <br />
                Retry count: {healthStatus.retryCount}
                <br />
                {isDevelopment && (
                  <>
                    Mode: Development fallback active
                    <br />
                    Authentication: Using mock data
                  </>
                )}
              </>
            )}
          </small>
        </Box>
      </Alert>
    </Collapse>
  )

  return (
    <Box sx={positionStyles[position]}>
      <Box display="flex" alignItems="center">
        {statusChip}
        {refreshButton}
        {showDetails && (
          <IconButton
            size="small"
            onClick={() => setShowDetailedStatus(!showDetailedStatus)}
            sx={{ ml: 0.5 }}
          >
            {showDetailedStatus ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      {detailsContent}
    </Box>
  )
}