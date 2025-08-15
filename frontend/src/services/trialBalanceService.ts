import { apiService } from './apiService';
import {
  TrialBalanceRequestDto,
  TrialBalanceResponseDto,
  TrialBalanceComparisonRequestDto,
  TrialBalanceComparisonResponseDto,
  AccountTransactionResponse,
  TransactionDetail,
  TrialBalanceData,
  DateRange,
  TrialBalanceComparison,
  AccountCategoryType
} from '@/types/trialBalance';
import { ErrorHandler, RetryHandler } from '@/utils/errorHandling';
import { TrialBalanceFormValidator } from '@/utils/trialBalanceValidation';
import { sanitizeString, validateTrialBalanceRequest, ClientRateLimiter } from '@/utils/securityUtils';

/**
 * Trial Balance API Service
 * Handles all API communication for trial balance reporting functionality
 * Includes error handling, retry logic, and request/response transformation
 */
class TrialBalanceService {
  private readonly baseUrl = '/api/trial-balance';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second
  private readonly rateLimiter = new ClientRateLimiter();

  /**
   * Generate trial balance report for the specified date range
   * @param dateRange - Start and end dates for the report
   * @param options - Additional options for report generation
   * @returns Promise<TrialBalanceData> - Transformed trial balance data
   */
  async generateTrialBalance(
    dateRange: DateRange,
    options: {
      groupByCategory?: boolean;
      includeZeroBalances?: boolean;
      categoryFilter?: AccountCategoryType[];
      enableRetry?: boolean;
      enableFallback?: boolean;
    } = {}
  ): Promise<TrialBalanceData> {
    // Client-side rate limiting
    const rateLimitKey = 'trial-balance-generate';
    if (!this.rateLimiter.isAllowed(rateLimitKey, 30, 60000)) { // 30 requests per minute
      throw ErrorHandler.createError(
        new Error('Rate limit exceeded. Please wait before making another request.'),
        'RATE_LIMIT_EXCEEDED',
        ErrorHandler.ErrorCategory.VALIDATION,
        ErrorHandler.ErrorSeverity.MEDIUM
      );
    }

    // Enhanced validation before making API call
    const securityValidation = validateTrialBalanceRequest({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      groupByCategory: options.groupByCategory,
      includeZeroBalances: options.includeZeroBalances
    });

    if (!securityValidation.isValid) {
      const validationErrors = securityValidation.errors.map(error => ({ field: 'security', message: error }));
      throw ErrorHandler.handleValidationError(validationErrors, { dateRange, options });
    }

    const validationResult = TrialBalanceFormValidator.validateDateRange(dateRange);
    if (!validationResult.isValid) {
      throw ErrorHandler.handleValidationError(validationResult.errors, { dateRange, options });
    }

    const request: TrialBalanceRequestDto = {
      startDate: this.formatDateForApi(dateRange.startDate),
      endDate: this.formatDateForApi(dateRange.endDate),
      groupByCategory: options.groupByCategory ?? true,
      includeZeroBalances: options.includeZeroBalances ?? false,
      categoryFilter: options.categoryFilter
    };

    const operation = async (): Promise<TrialBalanceData> => {
      try {
        // Use development endpoint if in development mode
        const endpoint = process.env.NODE_ENV === 'development' ? '/api/dev/trial-balance' : this.baseUrl;
        
        const response = await apiService.get<TrialBalanceResponseDto>(endpoint, { params: request });
        return this.transformTrialBalanceResponse(response);
      } catch (error) {
        throw ErrorHandler.handleApiError(error, 'Failed to generate trial balance report');
      }
    };

    // Use retry mechanism if enabled
    if (options.enableRetry !== false) {
      try {
        return await RetryHandler.executeWithRetry(operation, {
          maxAttempts: 3,
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            console.warn(`Trial balance generation attempt ${attempt} failed:`, error);
          }
        });
      } catch (error) {
        // If retry fails and fallback is enabled, try with cached or simplified data
        if (options.enableFallback) {
          return await this.getFallbackTrialBalance(dateRange, options);
        }
        throw error;
      }
    }

    return await operation();
  }

  /**
   * Get detailed transaction information for a specific account (drill-down functionality)
   * @param accountId - The unique identifier of the account
   * @param startDate - Start date for filtering transactions
   * @param endDate - End date for filtering transactions
   * @param pagination - Optional pagination parameters
   * @returns Promise<TransactionDetail[]> - Account transaction details
   */
  async getAccountTransactions(
    accountId: string,
    startDate: Date,
    endDate: Date,
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<TransactionDetail[]> {
    // Client-side rate limiting
    const rateLimitKey = 'account-transactions';
    if (!this.rateLimiter.isAllowed(rateLimitKey, 60, 60000)) { // 60 requests per minute
      throw ErrorHandler.createError(
        new Error('Rate limit exceeded. Please wait before making another request.'),
        'RATE_LIMIT_EXCEEDED',
        ErrorHandler.ErrorCategory.VALIDATION,
        ErrorHandler.ErrorSeverity.MEDIUM
      );
    }

    // Sanitize account ID
    const sanitizedAccountId = sanitizeString(accountId, 36);
    if (!sanitizedAccountId || sanitizedAccountId !== accountId) {
      throw ErrorHandler.createError(
        new Error('Invalid account ID format'),
        'INVALID_ACCOUNT_ID',
        ErrorHandler.ErrorCategory.VALIDATION,
        ErrorHandler.ErrorSeverity.HIGH
      );
    }
    const params = {
      startDate: this.formatDateForApi(startDate),
      endDate: this.formatDateForApi(endDate),
      ...(pagination?.page && { page: pagination.page }),
      ...(pagination?.pageSize && { pageSize: pagination.pageSize })
    };

    try {
      const response = await this.executeWithRetry<TransactionDetail[]>(
        () => apiService.get<TransactionDetail[]>(
          `${this.baseUrl}/account/${accountId}/transactions`,
          { params }
        )
      );

      return response.map(transaction => ({
        ...transaction,
        date: this.parseDateFromApi(transaction.date.toString())
      }));
    } catch (error) {
      throw this.handleApiError(error, `Failed to fetch transactions for account ${accountId}`);
    }
  }

  /**
   * Compare trial balances across different periods (Admin only)
   * @param period1 - First period for comparison
   * @param period2 - Second period for comparison
   * @param options - Additional comparison options
   * @returns Promise<TrialBalanceComparison> - Comparison results with variance analysis
   */
  async compareTrialBalances(
    period1: DateRange,
    period2: DateRange,
    options: {
      groupByCategory?: boolean;
      includeZeroBalances?: boolean;
    } = {}
  ): Promise<TrialBalanceComparison> {
    // Client-side rate limiting (more restrictive for comparison)
    const rateLimitKey = 'trial-balance-compare';
    if (!this.rateLimiter.isAllowed(rateLimitKey, 10, 60000)) { // 10 requests per minute
      throw ErrorHandler.createError(
        new Error('Rate limit exceeded. Please wait before making another request.'),
        'RATE_LIMIT_EXCEEDED',
        ErrorHandler.ErrorCategory.VALIDATION,
        ErrorHandler.ErrorSeverity.MEDIUM
      );
    }

    // Validate both periods
    const period1Validation = validateTrialBalanceRequest({
      startDate: period1.startDate,
      endDate: period1.endDate,
      groupByCategory: options.groupByCategory,
      includeZeroBalances: options.includeZeroBalances
    });

    const period2Validation = validateTrialBalanceRequest({
      startDate: period2.startDate,
      endDate: period2.endDate,
      groupByCategory: options.groupByCategory,
      includeZeroBalances: options.includeZeroBalances
    });

    const allErrors = [...period1Validation.errors, ...period2Validation.errors];
    if (allErrors.length > 0) {
      const validationErrors = allErrors.map(error => ({ field: 'dateRange', message: error }));
      throw ErrorHandler.handleValidationError(validationErrors, { period1, period2, options });
    }
    const request: TrialBalanceComparisonRequestDto = {
      period1: {
        startDate: this.formatDateForApi(period1.startDate),
        endDate: this.formatDateForApi(period1.endDate)
      },
      period2: {
        startDate: this.formatDateForApi(period2.startDate),
        endDate: this.formatDateForApi(period2.endDate)
      },
      groupByCategory: options.groupByCategory ?? true,
      includeZeroBalances: options.includeZeroBalances ?? false
    };

    try {
      const response = await this.executeWithRetry<TrialBalanceComparisonResponseDto>(
        () => apiService.post<TrialBalanceComparisonResponseDto>(
          `${this.baseUrl}/compare`,
          request
        )
      );

      return this.transformTrialBalanceComparisonResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to compare trial balance periods');
    }
  }

  /**
   * Validate date range for trial balance generation
   * @param dateRange - Date range to validate
   * @returns boolean - True if valid, false otherwise
   */
  validateDateRange(dateRange: DateRange): boolean {
    if (!dateRange.startDate || !dateRange.endDate) {
      return false;
    }

    if (dateRange.startDate > dateRange.endDate) {
      return false;
    }

    // Check if date range is not too large (365 days max)
    const daysDifference = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysDifference <= 365;
  }

  /**
   * Get validation error message for invalid date range
   * @param dateRange - Date range to validate
   * @returns string - Error message or empty string if valid
   */
  getDateRangeValidationError(dateRange: DateRange): string {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'Start date and end date are required';
    }

    if (dateRange.startDate > dateRange.endDate) {
      return 'Start date must not be later than end date';
    }

    const daysDifference = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference > 365) {
      return 'Date range cannot exceed 365 days for performance reasons';
    }

    return '';
  }

  // Private helper methods

  /**
   * Execute API call with retry logic for network failures
   */
  private async executeWithRetry<T>(
    apiCall: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      // Only retry on network errors or 5xx server errors
      const shouldRetry = this.shouldRetryError(error) && retryCount < this.maxRetries;
      
      if (shouldRetry) {
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff
        await this.sleep(delay);
        return this.executeWithRetry(apiCall, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Determine if an error should trigger a retry
   */
  private shouldRetryError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      // Network errors (no response)
      if ('request' in error && !('response' in error)) {
        return true;
      }
      
      // Server errors (5xx)
      if ('response' in error && (error as { response: { status: number } }).response) {
        const status = (error as { response: { status: number } }).response.status;
        return status >= 500 && status < 600;
      }
    }
    
    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format Date object to ISO string for API
   */
  private formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Parse ISO date string from API to Date object
   */
  private parseDateFromApi(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Transform API response to frontend data structure
   */
  private transformTrialBalanceResponse(response: TrialBalanceResponseDto): TrialBalanceData {
    return {
      dateRange: {
        startDate: this.parseDateFromApi(response.dateRange.startDate),
        endDate: this.parseDateFromApi(response.dateRange.endDate)
      },
      categories: response.categories.map(category => ({
        name: category.name as AccountCategoryType,
        accounts: category.accounts.map(account => ({
          accountId: account.accountId,
          accountName: account.accountName,
          categoryDescription: account.categoryDescription,
          particulars: account.particulars,
          debitAmount: account.debitAmount,
          creditAmount: account.creditAmount,
          netBalance: account.netBalance,
          transactionCount: account.transactionCount
        })),
        subtotal: category.subtotal
      })),
      totalDebits: response.totalDebits,
      totalCredits: response.totalCredits,
      finalBalance: response.finalBalance,
      calculationExpression: response.calculationExpression,
      generatedAt: this.parseDateFromApi(response.generatedAt),
      totalTransactions: response.totalTransactions
    };
  }

  /**
   * Transform account transaction response
   */
  private transformAccountTransactionResponse(
    accountId: string,
    transactions: TransactionDetail[],
    pagination?: { page?: number; pageSize?: number }
  ): AccountTransactionResponse {
    // Find account name from first transaction or use accountId as fallback
    const accountName = transactions.length > 0 
      ? `Account ${accountId}` // This would ideally come from the API response
      : `Account ${accountId}`;

    return {
      accountId,
      accountName,
      transactions: transactions.map(transaction => ({
        ...transaction,
        date: this.parseDateFromApi(transaction.date.toString())
      })),
      totalCount: transactions.length,
      pageSize: pagination?.pageSize ?? 50,
      currentPage: pagination?.page ?? 1
    };
  }

  /**
   * Transform trial balance comparison response
   */
  private transformTrialBalanceComparisonResponse(
    response: TrialBalanceComparisonResponseDto
  ): TrialBalanceComparison {
    return {
      period1: this.transformTrialBalanceResponse(response.period1),
      period2: this.transformTrialBalanceResponse(response.period2),
      variances: response.variances.map(variance => ({
        accountId: variance.accountId,
        accountName: variance.accountName,
        period1Balance: variance.period1Balance,
        period2Balance: variance.period2Balance,
        absoluteChange: variance.absoluteChange,
        percentageChange: variance.percentageChange
      }))
    };
  }

  /**
   * Fallback trial balance generation for graceful degradation
   */
  private async getFallbackTrialBalance(
    dateRange: DateRange,
    options: {
      groupByCategory?: boolean;
      includeZeroBalances?: boolean;
      categoryFilter?: AccountCategoryType[];
    }
  ): Promise<TrialBalanceData> {
    // Return a basic structure with empty data but proper format
    // In a real implementation, this might fetch cached data or simplified calculations
    console.warn('Using fallback trial balance data due to service unavailability');
    
    return {
      dateRange,
      categories: [],
      totalDebits: 0,
      totalCredits: 0,
      finalBalance: 0,
      calculationExpression: '0 = 0',
      generatedAt: new Date(),
      totalTransactions: 0
    };
  }

  /**
   * Handle API errors with enhanced error information
   */
  private handleApiError(error: unknown, context: string): Error {
    return ErrorHandler.handleApiError(error, context);
  }

  /**
   * Enhanced error handling with graceful degradation
   */
  private async handlePartialDataFailure<T>(
    operations: Array<() => Promise<T>>,
    minimumSuccessRate: number = 0.5
  ): Promise<{ data: Awaited<T>[]; hasFailures: boolean }> {
    const results = await Promise.allSettled(operations.map(op => op()));
    
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<Awaited<T>> => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    const successRate = successfulResults.length / results.length;

    if (successRate < minimumSuccessRate) {
      throw ErrorHandler.createError(
        new Error(`Too many operations failed. Success rate: ${Math.round(successRate * 100)}%`),
        'PARTIAL_FAILURE',
        ErrorHandler.ErrorCategory.DATA,
        ErrorHandler.ErrorSeverity.HIGH,
        { failures, successRate }
      );
    }

    return {
      data: successfulResults,
      hasFailures: failures.length > 0
    };
  }
}

// Export singleton instance
export const trialBalanceService = new TrialBalanceService();