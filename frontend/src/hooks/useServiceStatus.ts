import { useEffect, useState } from 'react'
import { healthCheckService, type HealthStatus } from '@/services/healthCheckService'

interface ServiceStatusInfo {
  isBackendHealthy: boolean
  isUsingFallback: boolean
  isFallbackMode: boolean
  healthStatus: HealthStatus | null
  shouldUseMockAuth: boolean
  lastError?: string
  responseTime?: number
}

export function useServiceStatus(): ServiceStatusInfo {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)

  useEffect(() => {
    // Get initial health status
    setHealthStatus(healthCheckService.getHealthStatus())

    // Check if we're in fallback mode
    if (typeof window !== 'undefined') {
      setIsFallbackMode(localStorage.getItem('auth_fallback_mode') === 'true')
    }

    // Subscribe to health status changes
    const unsubscribe = healthCheckService.onHealthStatusChange((status) => {
      setHealthStatus(status)
    })

    // Listen for storage changes to detect fallback mode changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_fallback_mode') {
        setIsFallbackMode(e.newValue === 'true')
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
    }

    return () => {
      unsubscribe()
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [])

  return {
    isBackendHealthy: healthStatus?.isHealthy || false,
    isUsingFallback: healthStatus?.isUsingFallback || false,
    isFallbackMode,
    healthStatus,
    shouldUseMockAuth: healthCheckService.shouldUseMockAuth(),
    lastError: healthStatus?.error,
    responseTime: healthStatus?.responseTime
  }
}

export function useBackendAvailability() {
  const { isBackendHealthy, isFallbackMode, healthStatus } = useServiceStatus()

  const checkBackendRecovery = async (): Promise<boolean> => {
    if (!isFallbackMode) return false
    
    try {
      const backendStatus = await healthCheckService.detectBackendAvailability()
      return backendStatus.isAvailable
    } catch (error) {
      console.error('Error checking backend recovery:', error)
      return false
    }
  }

  const refreshHealthStatus = async (): Promise<void> => {
    try {
      await healthCheckService.checkHealth({ retryAttempts: 2 })
    } catch (error) {
      console.error('Error refreshing health status:', error)
    }
  }

  return {
    isBackendHealthy,
    isFallbackMode,
    isBackendUnavailable: healthCheckService.isBackendUnavailable(),
    shouldUseMockAuth: healthCheckService.shouldUseMockAuth(),
    checkBackendRecovery,
    refreshHealthStatus,
    lastChecked: healthStatus?.lastChecked,
    retryCount: healthStatus?.retryCount || 0
  }
}