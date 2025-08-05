// Health Check Service
// This service monitors backend availability and provides health status

interface HealthStatus {
  isHealthy: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
  retryCount: number;
  isUsingFallback?: boolean;
  fallbackReason?: string;
}

interface HealthCheckOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

class HealthCheckService {
  private healthStatus: HealthStatus = {
    isHealthy: false,
    lastChecked: new Date(),
    retryCount: 0,
    isUsingFallback: false
  };

  private healthCheckInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: HealthStatus) => void> = [];

  constructor() {
    // Start periodic health checks
    this.startPeriodicHealthCheck();
  }

  async checkHealth(options: HealthCheckOptions = {}): Promise<HealthStatus> {
    const {
      timeout = 5000,
      retryAttempts = 3,
      retryDelay = 1000
    } = options;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const healthEndpoint = `${apiUrl}/api/health`;

    // In development, if we're explicitly bypassing auth, don't try to check backend health
    const isDevelopment = process.env.NODE_ENV === 'development';
    const shouldBypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

    if (isDevelopment && shouldBypassAuth) {

      this.healthStatus = {
        isHealthy: false,
        lastChecked: new Date(),
        error: 'Backend health check skipped - using fallback mode',
        retryCount: 0,
        isUsingFallback: true,
        fallbackReason: 'Explicit auth bypass enabled'
      };
      this.notifyListeners();
      return this.healthStatus;
    }

    let lastError: string | undefined;

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const startTime = Date.now();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(healthEndpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        if (response.ok) {
          this.healthStatus = {
            isHealthy: true,
            lastChecked: new Date(),
            responseTime,
            retryCount: 0,
            isUsingFallback: false
          };

          this.notifyListeners();
          return this.healthStatus;
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = `Request timeout after ${timeout}ms`;
          } else {
            lastError = error.message;
          }
        } else {
          lastError = 'Unknown error occurred';
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // All attempts failed - determine if we should use fallback
    const shouldUseFallback = isDevelopment && this.shouldActivateFallback(lastError);

    this.healthStatus = {
      isHealthy: false,
      lastChecked: new Date(),
      error: lastError,
      retryCount: this.healthStatus.retryCount + 1,
      isUsingFallback: shouldUseFallback,
      fallbackReason: shouldUseFallback ? 'Backend unavailable in development mode' : undefined
    };

    this.notifyListeners();
    return this.healthStatus;
  }

  getHealthStatus(): HealthStatus {
    return { ...this.healthStatus };
  }

  onHealthStatusChange(callback: (status: HealthStatus) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.healthStatus);
      } catch (error) {
        console.error('Error in health status listener:', error);
      }
    });
  }

  private startPeriodicHealthCheck(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth({ retryAttempts: 1 }); // Single attempt for periodic checks
    }, 30000);

    // Initial health check
    this.checkHealth({ retryAttempts: 1 });
  }

  stopPeriodicHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async waitForHealthy(maxWaitTime: number = 10000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkHealth({ retryAttempts: 1 });
      if (status.isHealthy) {
        return true;
      }

      // Wait 1 second before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  private shouldActivateFallback(error?: string): boolean {
    // Activate fallback in development when backend is clearly unavailable
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment) return false;

    // Common indicators that backend is not running
    const backendUnavailableIndicators = [
      'fetch failed',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'Request timeout',
      'Network request failed',
      'Failed to fetch'
    ];

    return error ? backendUnavailableIndicators.some(indicator =>
      error.toLowerCase().includes(indicator.toLowerCase())
    ) : false;
  }

  isBackendUnavailable(): boolean {
    return !this.healthStatus.isHealthy &&
      this.healthStatus.retryCount > 0 &&
      this.shouldActivateFallback(this.healthStatus.error);
  }

  shouldUseMockAuth(): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    return isDevelopment && (
      this.healthStatus.isUsingFallback ||
      this.isBackendUnavailable() ||
      process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'
    );
  }

  async detectBackendAvailability(): Promise<{
    isAvailable: boolean;
    shouldUseFallback: boolean;
    reason?: string;
  }> {
    const healthStatus = await this.checkHealth({ retryAttempts: 2, timeout: 3000 });

    return {
      isAvailable: healthStatus.isHealthy,
      shouldUseFallback: healthStatus.isUsingFallback || false,
      reason: healthStatus.error || healthStatus.fallbackReason
    };
  }

  getServiceInfo() {
    return {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      healthEndpoint: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/health`,
      isDevelopment: process.env.NODE_ENV === 'development',
      isUsingFallback: this.healthStatus.isUsingFallback,
      shouldUseMockAuth: this.shouldUseMockAuth()
    };
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();
export type { HealthStatus, HealthCheckOptions };