// Enhanced Error Handling Utilities for Trial Balance Reporting
import { TrialBalanceError, ValidationError } from '@/types/trialBalance';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  SERVER = 'server',
  CLIENT = 'client',
  DATA = 'data'
}

export interface EnhancedError extends Error {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
  timestamp: Date;
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  private static errorLog: EnhancedError[] = [];
  private static maxLogSize = 100;

  // Export enums as static properties for easier access
  static ErrorCategory = ErrorCategory;
  static ErrorSeverity = ErrorSeverity;

  /**
   * Create an enhanced error with proper categorization and user-friendly messages
   */
  static createError(
    originalError: unknown,
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, unknown>
  ): EnhancedError {
    const timestamp = new Date();
    let message = 'An unexpected error occurred';
    let technicalMessage = 'Unknown error';
    let retryable = false;

    // Extract information from original error
    if (originalError instanceof Error) {
      technicalMessage = originalError.message;
      message = this.getUserFriendlyMessage(originalError, category);
    } else if (typeof originalError === 'string') {
      technicalMessage = originalError;
      message = this.getUserFriendlyMessage(new Error(originalError), category);
    }

    // Determine if error is retryable
    retryable = this.isRetryableError(originalError, category);

    const enhancedError: EnhancedError = {
      name: 'EnhancedError',
      message: technicalMessage,
      code,
      category,
      severity,
      timestamp,
      userMessage: message,
      technicalMessage,
      retryable,
      context,
      details: this.extractErrorDetails(originalError)
    };

    // Log the error
    this.logError(enhancedError);

    return enhancedError;
  }

  /**
   * Handle API errors with specific error codes and messages
   */
  static handleApiError(error: unknown, defaultMessage: string = 'API request failed'): EnhancedError {
    if (this.isNetworkError(error)) {
      return this.createError(
        new Error('Network connection failed'),
        'NETWORK_ERROR',
        ErrorCategory.NETWORK,
        ErrorSeverity.HIGH,
        { type: 'network_failure', originalError: error }
      );
    }

    if (this.isHttpError(error)) {
      const httpError = error as { response: { status: number; data?: { message?: string; errorCode?: string } } };
      const status = httpError.response.status;
      const errorData = httpError.response.data;

      switch (status) {
        case 400:
          return this.createError(
            new Error(errorData?.message || 'Bad request'),
            errorData?.errorCode || 'BAD_REQUEST',
            ErrorCategory.VALIDATION,
            ErrorSeverity.MEDIUM,
            { status, errorData }
          );
        case 401:
          return this.createError(
            new Error('Authentication failed'),
            'UNAUTHORIZED',
            ErrorCategory.AUTHENTICATION,
            ErrorSeverity.HIGH,
            { status }
          );
        case 403:
          return this.createError(
            new Error('Access forbidden'),
            'FORBIDDEN',
            ErrorCategory.AUTHORIZATION,
            ErrorSeverity.HIGH,
            { status }
          );
        case 404:
          return this.createError(
            new Error('Resource not found'),
            'NOT_FOUND',
            ErrorCategory.CLIENT,
            ErrorSeverity.MEDIUM,
            { status }
          );
        case 429:
          return this.createError(
            new Error('Rate limit exceeded'),
            'RATE_LIMITED',
            ErrorCategory.CLIENT,
            ErrorSeverity.MEDIUM,
            { status }
          );
        case 500:
        case 502:
        case 503:
        case 504:
          return this.createError(
            new Error('Server error'),
            'SERVER_ERROR',
            ErrorCategory.SERVER,
            ErrorSeverity.HIGH,
            { status }
          );
        default:
          return this.createError(
            new Error(`HTTP ${status} error`),
            'HTTP_ERROR',
            ErrorCategory.CLIENT,
            ErrorSeverity.MEDIUM,
            { status }
          );
      }
    }

    return this.createError(error, 'UNKNOWN_ERROR', ErrorCategory.CLIENT, ErrorSeverity.MEDIUM);
  }

  /**
   * Handle validation errors with detailed field-level information
   */
  static handleValidationError(
    validationErrors: ValidationError[],
    context?: Record<string, unknown>
  ): EnhancedError {
    const message = validationErrors.length === 1
      ? validationErrors[0].message
      : `${validationErrors.length} validation errors occurred`;

    return this.createError(
      new Error(message),
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.MEDIUM,
      { ...context, validationErrors }
    );
  }

  /**
   * Get user-friendly error messages based on error category
   */
  private static getUserFriendlyMessage(error: Error, category: ErrorCategory): string {
    const commonMessages: Record<ErrorCategory, string> = {
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Your session has expired. Please log in again.',
      [ErrorCategory.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorCategory.SERVER]: 'The server is experiencing issues. Please try again later.',
      [ErrorCategory.CLIENT]: 'There was a problem with your request. Please try again.',
      [ErrorCategory.DATA]: 'There was an issue processing the data. Please verify your input.'
    };

    // Return category-specific message first
    if (commonMessages[category]) {
      return commonMessages[category];
    }

    // Check for specific error patterns as fallback
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return commonMessages[ErrorCategory.NETWORK];
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return commonMessages[ErrorCategory.AUTHENTICATION];
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return commonMessages[ErrorCategory.AUTHORIZATION];
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return commonMessages[ErrorCategory.VALIDATION];
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Determine if an error is retryable
   */
  private static isRetryableError(error: unknown, category: ErrorCategory): boolean {
    if (category === ErrorCategory.NETWORK) return true;
    if (category === ErrorCategory.SERVER) return true;

    if (this.isHttpError(error)) {
      const status = (error as { response: { status: number } }).response.status;
      return status >= 500 || status === 429; // Server errors and rate limiting
    }

    return false;
  }

  /**
   * Check if error is a network error
   */
  private static isNetworkError(error: unknown): boolean {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'request' in error &&
      !('response' in error)
    );
  }

  /**
   * Check if error is an HTTP error with response
   */
  private static isHttpError(error: unknown): boolean {
    return Boolean(
      error &&
      typeof error === 'object' &&
      'response' in error &&
      (error as { response: unknown }).response &&
      typeof (error as { response: { status: unknown } }).response === 'object' &&
      'status' in (error as { response: { status: unknown } }).response
    );
  }

  /**
   * Extract additional details from error object
   */
  private static extractErrorDetails(error: unknown): Record<string, unknown> {
    const details: Record<string, unknown> = {};

    if (error && typeof error === 'object') {
      // Extract common error properties
      const errorObj = error as Record<string, unknown>;

      if ('stack' in errorObj) details.stack = errorObj.stack;
      if ('code' in errorObj) details.originalCode = errorObj.code;
      if ('errno' in errorObj) details.errno = errorObj.errno;
      if ('syscall' in errorObj) details.syscall = errorObj.syscall;
      if ('response' in errorObj) {
        const response = errorObj.response as Record<string, unknown>;
        details.responseStatus = response.status;
        details.responseData = response.data;
      }
    }

    return details;
  }

  /**
   * Log error to internal error log
   */
  private static logError(error: EnhancedError): void {
    this.errorLog.unshift(error);

    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.category.toUpperCase()} ERROR [${error.code}]`);
      console.error('User Message:', error.userMessage);
      console.error('Technical Message:', error.technicalMessage);
      console.error('Severity:', error.severity);
      console.error('Retryable:', error.retryable);
      if (error.context) console.error('Context:', error.context);
      if (error.details) console.error('Details:', error.details);
      console.groupEnd();
    }
  }

  /**
   * Get recent errors for debugging
   */
  static getRecentErrors(count: number = 10): EnhancedError[] {
    return this.errorLog.slice(0, count);
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    retryableCount: number;
  } {
    const stats = {
      total: this.errorLog.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      retryableCount: 0
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      stats.byCategory[category] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });

    // Count errors
    this.errorLog.forEach(error => {
      stats.byCategory[error.category]++;
      stats.bySeverity[error.severity]++;
      if (error.retryable) stats.retryableCount++;
    });

    return stats;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryHandler {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      retryCondition?: (error: unknown) => boolean;
      onRetry?: (attempt: number, error: unknown) => void;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      retryCondition = (error) => {
        try {
          return ErrorHandler.handleApiError(error).retryable;
        } catch {
          return false;
        }
      },
      onRetry
    } = options;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt or if error is not retryable
        if (attempt === maxAttempts || !retryCondition(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt - 1),
          maxDelay
        );

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt, error);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

/**
 * Graceful degradation handler
 */
export class GracefulDegradationHandler {
  /**
   * Handle partial data loading failures
   */
  static handlePartialFailure<T>(
    results: Array<{ success: boolean; data?: T; error?: unknown }>,
    options: {
      minimumSuccessRate?: number;
      fallbackData?: T[];
      onPartialFailure?: (failures: unknown[]) => void;
    } = {}
  ): { data: T[]; hasFailures: boolean; failureCount: number } {
    const {
      minimumSuccessRate = 0.5,
      fallbackData = [],
      onPartialFailure
    } = options;

    const successfulResults = results.filter(result => result.success);
    const failures = results.filter(result => !result.success);
    const successRate = successfulResults.length / results.length;

    // If success rate is too low, use fallback data
    if (successRate < minimumSuccessRate) {
      if (onPartialFailure) {
        onPartialFailure(failures.map(f => f.error));
      }
      return {
        data: fallbackData,
        hasFailures: true,
        failureCount: failures.length
      };
    }

    // Return successful data
    const data = successfulResults
      .map(result => result.data)
      .filter((item): item is T => item !== undefined);

    return {
      data,
      hasFailures: failures.length > 0,
      failureCount: failures.length
    };
  }

  /**
   * Provide fallback functionality when primary feature fails
   */
  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T> | T,
    options: {
      fallbackCondition?: (error: unknown) => boolean;
      onFallback?: (error: unknown) => void;
    } = {}
  ): Promise<{ data: T; usedFallback: boolean }> {
    const {
      fallbackCondition = () => true,
      onFallback
    } = options;

    try {
      const data = await primaryOperation();
      return { data, usedFallback: false };
    } catch (error) {
      if (fallbackCondition(error)) {
        if (onFallback) {
          onFallback(error);
        }
        const fallbackData = await fallbackOperation();
        return { data: fallbackData, usedFallback: true };
      }
      throw error;
    }
  }
}

// Export utility functions
export const createTrialBalanceError = (
  message: string,
  code: string = 'TRIAL_BALANCE_ERROR'
): TrialBalanceError => ({
  code,
  message,
  details: `Error occurred at ${new Date().toISOString()}`
});

export const isRetryableError = (error: unknown): boolean => {
  const enhancedError = ErrorHandler.handleApiError(error);
  return enhancedError.retryable;
};

export const getErrorMessage = (error: unknown): string => {
  const enhancedError = ErrorHandler.handleApiError(error);
  return enhancedError.userMessage;
};