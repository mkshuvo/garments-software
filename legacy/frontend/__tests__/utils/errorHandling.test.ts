// Tests for Enhanced Error Handling Utilities
import { ErrorHandler, RetryHandler, GracefulDegradationHandler, ErrorCategory, ErrorSeverity } from '@/utils/errorHandling';

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorLog();
  });

  describe('createError', () => {
    it('should create enhanced error with proper categorization', () => {
      const originalError = new Error('Test error');
      const enhancedError = ErrorHandler.createError(
        originalError,
        'TEST_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH
      );

      expect(enhancedError.code).toBe('TEST_ERROR');
      expect(enhancedError.category).toBe(ErrorCategory.VALIDATION);
      expect(enhancedError.severity).toBe(ErrorSeverity.HIGH);
      expect(enhancedError.technicalMessage).toBe('Test error');
      expect(enhancedError.userMessage).toContain('check your input');
      expect(enhancedError.timestamp).toBeInstanceOf(Date);
    });

    it('should handle string errors', () => {
      const enhancedError = ErrorHandler.createError(
        'String error message',
        'STRING_ERROR',
        ErrorCategory.CLIENT
      );

      expect(enhancedError.technicalMessage).toBe('String error message');
      expect(enhancedError.code).toBe('STRING_ERROR');
    });
  });

  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      const enhancedError = ErrorHandler.handleApiError(networkError);

      expect(enhancedError.code).toBe('NETWORK_ERROR');
      expect(enhancedError.category).toBe(ErrorCategory.NETWORK);
      expect(enhancedError.retryable).toBe(true);
      expect(enhancedError.userMessage).toContain('internet connection');
    });

    it('should handle HTTP 400 errors', () => {
      const httpError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid request',
            errorCode: 'INVALID_REQUEST'
          }
        }
      };

      const enhancedError = ErrorHandler.handleApiError(httpError);

      expect(enhancedError.code).toBe('INVALID_REQUEST');
      expect(enhancedError.category).toBe(ErrorCategory.VALIDATION);
      expect(enhancedError.retryable).toBe(false);
    });

    it('should handle HTTP 401 errors', () => {
      const httpError = {
        response: {
          status: 401
        }
      };

      const enhancedError = ErrorHandler.handleApiError(httpError);

      expect(enhancedError.code).toBe('UNAUTHORIZED');
      expect(enhancedError.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(enhancedError.userMessage).toContain('log in again');
    });

    it('should handle HTTP 500 errors as retryable', () => {
      const httpError = {
        response: {
          status: 500
        }
      };

      const enhancedError = ErrorHandler.handleApiError(httpError);

      expect(enhancedError.code).toBe('SERVER_ERROR');
      expect(enhancedError.category).toBe(ErrorCategory.SERVER);
      expect(enhancedError.retryable).toBe(true);
    });
  });

  describe('handleValidationError', () => {
    it('should handle single validation error', () => {
      const validationErrors = [
        { field: 'startDate', message: 'Start date is required' }
      ];

      const enhancedError = ErrorHandler.handleValidationError(validationErrors);

      expect(enhancedError.code).toBe('VALIDATION_ERROR');
      expect(enhancedError.category).toBe(ErrorCategory.VALIDATION);
      expect(enhancedError.technicalMessage).toBe('Start date is required');
      expect(enhancedError.context?.validationErrors).toEqual(validationErrors);
    });

    it('should handle multiple validation errors', () => {
      const validationErrors = [
        { field: 'startDate', message: 'Start date is required' },
        { field: 'endDate', message: 'End date is required' }
      ];

      const enhancedError = ErrorHandler.handleValidationError(validationErrors);

      expect(enhancedError.technicalMessage).toBe('2 validation errors occurred');
    });
  });

  describe('error logging', () => {
    it('should log errors to internal log', () => {
      const error = new Error('Test error');
      ErrorHandler.createError(error, 'TEST', ErrorCategory.CLIENT);

      const recentErrors = ErrorHandler.getRecentErrors(1);
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].code).toBe('TEST');
    });

    it('should maintain log size limit', () => {
      // Create more errors than the max log size
      for (let i = 0; i < 150; i++) {
        ErrorHandler.createError(new Error(`Error ${i}`), `TEST_${i}`, ErrorCategory.CLIENT);
      }

      const recentErrors = ErrorHandler.getRecentErrors(200);
      expect(recentErrors.length).toBeLessThanOrEqual(100); // Max log size
    });

    it('should provide error statistics', () => {
      ErrorHandler.createError(new Error('Network error'), 'NET1', ErrorCategory.NETWORK, ErrorSeverity.HIGH);
      ErrorHandler.createError(new Error('Validation error'), 'VAL1', ErrorCategory.VALIDATION, ErrorSeverity.MEDIUM);
      ErrorHandler.createError(new Error('Server error'), 'SRV1', ErrorCategory.SERVER, ErrorSeverity.HIGH);

      const stats = ErrorHandler.getErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.byCategory[ErrorCategory.NETWORK]).toBe(1);
      expect(stats.byCategory[ErrorCategory.VALIDATION]).toBe(1);
      expect(stats.byCategory[ErrorCategory.SERVER]).toBe(1);
      expect(stats.bySeverity[ErrorSeverity.HIGH]).toBe(2);
      expect(stats.bySeverity[ErrorSeverity.MEDIUM]).toBe(1);
      expect(stats.retryableCount).toBe(2); // Network and server errors are retryable
    });
  });
});

describe('RetryHandler', () => {
  it('should retry failed operations', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const result = await RetryHandler.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 10, // Short delay for testing
      retryCondition: () => true // Always retry for this test
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should respect retry condition', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Non-retryable error'));
    const retryCondition = jest.fn().mockReturnValue(false);

    await expect(
      RetryHandler.executeWithRetry(operation, {
        maxAttempts: 3,
        retryCondition
      })
    ).rejects.toThrow('Non-retryable error');

    expect(operation).toHaveBeenCalledTimes(1);
    expect(retryCondition).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should call onRetry callback', async () => {
    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const onRetry = jest.fn();

    await RetryHandler.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 10,
      retryCondition: () => true, // Always retry for this test
      onRetry
    });

    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;
    
    global.setTimeout = jest.fn().mockImplementation((callback, delay) => {
      delays.push(delay);
      return originalSetTimeout(callback, 0); // Execute immediately for testing
    });

    let attempts = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    await RetryHandler.executeWithRetry(operation, {
      maxAttempts: 3,
      baseDelay: 100,
      backoffFactor: 2,
      retryCondition: () => true // Always retry for this test
    });

    expect(delays).toEqual([100, 200]); // 100 * 2^0, 100 * 2^1

    global.setTimeout = originalSetTimeout;
  });
});

describe('GracefulDegradationHandler', () => {
  describe('handlePartialFailure', () => {
    it('should return successful results when success rate is acceptable', () => {
      const results = [
        { success: true, data: 'data1' },
        { success: true, data: 'data2' },
        { success: false, error: new Error('Failed') }
      ];

      const result = GracefulDegradationHandler.handlePartialFailure(results, {
        minimumSuccessRate: 0.5
      });

      expect(result.data).toEqual(['data1', 'data2']);
      expect(result.hasFailures).toBe(true);
      expect(result.failureCount).toBe(1);
    });

    it('should use fallback data when success rate is too low', () => {
      const results = [
        { success: false, error: new Error('Failed1') },
        { success: false, error: new Error('Failed2') },
        { success: true, data: 'data1' }
      ];

      const fallbackData = ['fallback1', 'fallback2'];
      const onPartialFailure = jest.fn();

      const result = GracefulDegradationHandler.handlePartialFailure(results, {
        minimumSuccessRate: 0.8,
        fallbackData,
        onPartialFailure
      });

      expect(result.data).toEqual(fallbackData);
      expect(result.hasFailures).toBe(true);
      expect(result.failureCount).toBe(2);
      expect(onPartialFailure).toHaveBeenCalledWith([
        new Error('Failed1'),
        new Error('Failed2')
      ]);
    });
  });

  describe('withFallback', () => {
    it('should return primary result when operation succeeds', async () => {
      const primaryOperation = jest.fn().mockResolvedValue('primary');
      const fallbackOperation = jest.fn().mockResolvedValue('fallback');

      const result = await GracefulDegradationHandler.withFallback(
        primaryOperation,
        fallbackOperation
      );

      expect(result.data).toBe('primary');
      expect(result.usedFallback).toBe(false);
      expect(fallbackOperation).not.toHaveBeenCalled();
    });

    it('should use fallback when primary operation fails', async () => {
      const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackOperation = jest.fn().mockResolvedValue('fallback');
      const onFallback = jest.fn();

      const result = await GracefulDegradationHandler.withFallback(
        primaryOperation,
        fallbackOperation,
        { onFallback }
      );

      expect(result.data).toBe('fallback');
      expect(result.usedFallback).toBe(true);
      expect(onFallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should respect fallback condition', async () => {
      const primaryOperation = jest.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackOperation = jest.fn().mockResolvedValue('fallback');
      const fallbackCondition = jest.fn().mockReturnValue(false);

      await expect(
        GracefulDegradationHandler.withFallback(
          primaryOperation,
          fallbackOperation,
          { fallbackCondition }
        )
      ).rejects.toThrow('Primary failed');

      expect(fallbackOperation).not.toHaveBeenCalled();
    });
  });
});