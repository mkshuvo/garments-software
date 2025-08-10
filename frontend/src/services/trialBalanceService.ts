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

/**
 * Trial Balance API Service
 * Handles all API communication for trial balance reporting functionality
 * Includes error handling, retry logic, and request/response transformation
 */
class TrialBalanceService {
  private readonly baseUrl = '/api/trial-balance';
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

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
    } = {}
  ): Promise<TrialBalanceData> {
    const request: TrialBalanceRequestDto = {
      startDate: this.formatDateForApi(dateRange.startDate),
      endDate: this.formatDateForApi(dateRange.endDate),
      groupByCategory: options.groupByCategory ?? true,
      includeZeroBalances: options.includeZeroBalances ?? false,
      categoryFilter: options.categoryFilter
    };

    try {
      const response = await this.executeWithRetry<TrialBalanceResponseDto>(
        () => apiService.get<TrialBalanceResponseDto>(this.baseUrl, { params: request })
      );

      return this.transformTrialBalanceResponse(response);
    } catch (error) {
      throw this.handleApiError(error, 'Failed to generate trial balance report');
    }
  }

  /**
   * Get detailed transaction information for a specific account (drill-down functionality)
   * @param accountId - The unique identifier of the account
   * @param dateRange - Date range for filtering transactions
   * @param pagination - Optional pagination parameters
   * @returns Promise<AccountTransactionResponse> - Account transaction details
   */
  async getAccountTransactions(
    accountId: string,
    dateRange: DateRange,
    pagination?: {
      page?: number;
      pageSize?: number;
    }
  ): Promise<AccountTransactionResponse> {
    const params = {
      startDate: this.formatDateForApi(dateRange.startDate),
      endDate: this.formatDateForApi(dateRange.endDate),
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

      return this.transformAccountTransactionResponse(accountId, response, pagination);
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
   * Handle and format API errors with user-friendly messages
   */
  private handleApiError(error: unknown, defaultMessage: string): Error {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const apiError = error as { message: string; status?: number };
      
      // Provide specific error messages based on status codes
      switch (apiError.status) {
        case 400:
          return new Error(apiError.message || 'Invalid request parameters. Please check your input.');
        case 401:
          return new Error('Authentication required. Please log in and try again.');
        case 403:
          return new Error('You do not have permission to access this feature.');
        case 404:
          return new Error('The requested resource was not found.');
        case 429:
          return new Error('Too many requests. Please wait a moment and try again.');
        case 500:
        case 502:
        case 503:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(apiError.message || defaultMessage);
      }
    }
    
    return new Error(defaultMessage);
  }
}

// Export singleton instance
export const trialBalanceService = new TrialBalanceService();