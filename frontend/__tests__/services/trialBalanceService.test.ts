import '@testing-library/jest-dom';
import { trialBalanceService } from '../../src/services/trialBalanceService';
import { apiService } from '../../src/services/apiService';
import { AccountCategoryType } from '../../src/types/trialBalance';

// Mock the apiService
jest.mock('../../src/services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('TrialBalanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTrialBalance', () => {
    const mockDateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const mockApiResponse = {
      dateRange: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
      categories: [
        {
          name: 'Assets',
          accounts: [
            {
              accountId: '123',
              accountName: 'Cash Account',
              categoryName: 'Assets',
              categoryDescription: 'Current Assets',
              particulars: 'Cash transactions',
              debitAmount: -1000,
              creditAmount: 1500,
              netBalance: 500,
              transactionCount: 5,
            },
          ],
          subtotal: 500,
        },
      ],
      totalDebits: -1000,
      totalCredits: 1500,
      finalBalance: 500,
      calculationExpression: '1500 - 1000 = 500',
      generatedAt: '2024-01-31T12:00:00Z',
      totalTransactions: 5,
    };

    it('should generate trial balance successfully', async () => {
      mockApiService.get.mockResolvedValue(mockApiResponse);

      const result = await trialBalanceService.generateTrialBalance(mockDateRange);

      expect(mockApiService.get).toHaveBeenCalledWith('/api/trial-balance', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          groupByCategory: true,
          includeZeroBalances: false,
        },
      });

      expect(result).toEqual({
        dateRange: mockDateRange,
        categories: [
          {
            name: AccountCategoryType.ASSETS,
            accounts: [
              {
                accountId: '123',
                accountName: 'Cash Account',
                categoryDescription: 'Current Assets',
                particulars: 'Cash transactions',
                debitAmount: -1000,
                creditAmount: 1500,
                netBalance: 500,
                transactionCount: 5,
              },
            ],
            subtotal: 500,
          },
        ],
        totalDebits: -1000,
        totalCredits: 1500,
        finalBalance: 500,
        calculationExpression: '1500 - 1000 = 500',
        generatedAt: new Date('2024-01-31T12:00:00Z'),
        totalTransactions: 5,
      });
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        message: 'Invalid date range',
        status: 400,
      };
      mockApiService.get.mockRejectedValue(mockError);

      await expect(
        trialBalanceService.generateTrialBalance(mockDateRange)
      ).rejects.toThrow('Invalid date range');
    });

    it('should retry on network errors', async () => {
      const networkError = { request: {} }; // Network error (no response)
      mockApiService.get
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue(mockApiResponse);

      const result = await trialBalanceService.generateTrialBalance(mockDateRange);

      expect(mockApiService.get).toHaveBeenCalledTimes(3);
      expect(result.finalBalance).toBe(500);
    });

    it('should pass custom options correctly', async () => {
      mockApiService.get.mockResolvedValue(mockApiResponse);

      await trialBalanceService.generateTrialBalance(mockDateRange, {
        groupByCategory: false,
        includeZeroBalances: true,
        categoryFilter: [AccountCategoryType.ASSETS, AccountCategoryType.LIABILITIES],
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/api/trial-balance', {
        params: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          groupByCategory: false,
          includeZeroBalances: true,
          categoryFilter: [AccountCategoryType.ASSETS, AccountCategoryType.LIABILITIES],
        },
      });
    });
  });

  describe('getAccountTransactions', () => {
    const mockDateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const mockTransactions = [
      {
        id: '1',
        date: '2024-01-15',
        categoryDescription: 'Cash Receipt',
        particulars: 'Payment received',
        referenceNumber: 'REF001',
        debitAmount: 0,
        creditAmount: 1000,
        runningBalance: 1000,
      },
    ];

    it('should fetch account transactions successfully', async () => {
      mockApiService.get.mockResolvedValue(mockTransactions);

      const result = await trialBalanceService.getAccountTransactions('123', mockDateRange);

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/api/trial-balance/account/123/transactions',
        {
          params: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
          },
        }
      );

      expect(result).toEqual({
        accountId: '123',
        accountName: 'Account 123',
        transactions: [
          {
            id: '1',
            date: new Date('2024-01-15'),
            categoryDescription: 'Cash Receipt',
            particulars: 'Payment received',
            referenceNumber: 'REF001',
            debitAmount: 0,
            creditAmount: 1000,
            runningBalance: 1000,
          },
        ],
        totalCount: 1,
        pageSize: 50,
        currentPage: 1,
      });
    });

    it('should handle pagination parameters', async () => {
      mockApiService.get.mockResolvedValue(mockTransactions);

      await trialBalanceService.getAccountTransactions('123', mockDateRange, {
        page: 2,
        pageSize: 25,
      });

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/api/trial-balance/account/123/transactions',
        {
          params: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            page: 2,
            pageSize: 25,
          },
        }
      );
    });
  });

  describe('compareTrialBalances', () => {
    const mockPeriod1 = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const mockPeriod2 = {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
    };

    const mockComparisonResponse = {
      period1: {
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
        categories: [],
        totalDebits: -1000,
        totalCredits: 1500,
        finalBalance: 500,
        calculationExpression: '1500 - 1000 = 500',
        generatedAt: '2024-01-31T12:00:00Z',
        totalTransactions: 5,
      },
      period2: {
        dateRange: { startDate: '2024-02-01', endDate: '2024-02-29' },
        categories: [],
        totalDebits: -1200,
        totalCredits: 1800,
        finalBalance: 600,
        calculationExpression: '1800 - 1200 = 600',
        generatedAt: '2024-02-29T12:00:00Z',
        totalTransactions: 7,
      },
      variances: [
        {
          accountId: '123',
          accountName: 'Cash Account',
          period1Balance: 500,
          period2Balance: 600,
          absoluteChange: 100,
          percentageChange: 20,
        },
      ],
    };

    it('should compare trial balances successfully', async () => {
      mockApiService.post.mockResolvedValue(mockComparisonResponse);

      const result = await trialBalanceService.compareTrialBalances(mockPeriod1, mockPeriod2);

      expect(mockApiService.post).toHaveBeenCalledWith('/api/trial-balance/compare', {
        period1: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
        period2: {
          startDate: '2024-02-01',
          endDate: '2024-02-29',
        },
        groupByCategory: true,
        includeZeroBalances: false,
      });

      expect(result.variances).toHaveLength(1);
      expect(result.variances[0].absoluteChange).toBe(100);
      expect(result.variances[0].percentageChange).toBe(20);
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const validRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      expect(trialBalanceService.validateDateRange(validRange)).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const invalidRange = {
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01'),
      };

      expect(trialBalanceService.validateDateRange(invalidRange)).toBe(false);
    });

    it('should reject date ranges that are too large', () => {
      const tooLargeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-02'), // More than 365 days
      };

      expect(trialBalanceService.validateDateRange(tooLargeRange)).toBe(false);
    });

    it('should reject missing dates', () => {
      const missingStartDate = {
        startDate: null as any,
        endDate: new Date('2024-01-31'),
      };

      const missingEndDate = {
        startDate: new Date('2024-01-01'),
        endDate: null as any,
      };

      expect(trialBalanceService.validateDateRange(missingStartDate)).toBe(false);
      expect(trialBalanceService.validateDateRange(missingEndDate)).toBe(false);
    });
  });

  describe('getDateRangeValidationError', () => {
    it('should return appropriate error messages', () => {
      const missingDates = {
        startDate: null as any,
        endDate: new Date('2024-01-31'),
      };

      const invalidOrder = {
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01'),
      };

      const tooLarge = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-02'),
      };

      const valid = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      expect(trialBalanceService.getDateRangeValidationError(missingDates)).toBe(
        'Start date and end date are required'
      );
      expect(trialBalanceService.getDateRangeValidationError(invalidOrder)).toBe(
        'Start date must not be later than end date'
      );
      expect(trialBalanceService.getDateRangeValidationError(tooLarge)).toBe(
        'Date range cannot exceed 365 days for performance reasons'
      );
      expect(trialBalanceService.getDateRangeValidationError(valid)).toBe('');
    });
  });
});