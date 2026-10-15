import { transactionService, SavedTransaction } from '../transactionService';
import { apiService } from '../apiService';

// Mock the apiService
jest.mock('../apiService');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the cache before each test
    transactionService.clearCache();
  });

  describe('getRecentTransactions', () => {
    it('should fetch transactions from API when cache is empty', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678',
          contactName: 'ABC Company'
        }
      ];

      const expectedResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(expectedResponse);

      // Act
      const result = await transactionService.getRecentTransactions(20);

      // Assert
      expect(mockedApiService.get).toHaveBeenCalledWith(
        '/api/cashbookentry/recent-independent-transactions?limit=20'
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should return cached data when available and not expired', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // First call to populate cache
      await transactionService.getRecentTransactions(20);

      // Clear mock to verify it's not called again
      mockedApiService.get.mockClear();

      // Act - Second call should use cache
      const result = await transactionService.getRecentTransactions(10);

      // Assert
      expect(mockedApiService.get).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Transactions loaded from cache');
      expect(result.transactions).toHaveLength(1);
      expect(result.totalCredits).toBe(1000.00);
    });

    it('should force refresh when requested', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // First call to populate cache
      await transactionService.getRecentTransactions(20);

      // Clear mock
      mockedApiService.get.mockClear();

      // Act - Force refresh
      const result = await transactionService.getRecentTransactions(20, true);

      // Assert
      expect(mockedApiService.get).toHaveBeenCalledWith(
        '/api/cashbookentry/recent-independent-transactions?limit=20'
      );
      expect(result).toEqual(apiResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('Failed to fetch transactions');
      mockedApiService.get.mockRejectedValue(error);

      // Act
      const result = await transactionService.getRecentTransactions();

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch transactions',
        transactions: [],
        totalCount: 0,
        totalCredits: 0,
        totalDebits: 0
      });
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Populate cache
      await transactionService.getRecentTransactions(20);

      // Clear mock
      mockedApiService.get.mockClear();

      // Act
      transactionService.clearCache();

      // Try to get transactions again
      await transactionService.getRecentTransactions(20);

      // Assert
      expect(mockedApiService.get).toHaveBeenCalled();
    });
  });

  describe('getTransactionsByType', () => {
    it('should filter transactions by type', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        },
        {
          id: '2',
          type: 'Debit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Office Supplies',
          particulars: 'Purchase of stationery',
          amount: 150.00,
          referenceNumber: 'CB-20240115-87654321'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 2,
        totalCredits: 1000.00,
        totalDebits: 150.00
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const creditTransactions = await transactionService.getTransactionsByType('Credit', 10);
      const debitTransactions = await transactionService.getTransactionsByType('Debit', 10);

      // Assert
      expect(creditTransactions).toHaveLength(1);
      expect(creditTransactions[0].type).toBe('Credit');
      expect(debitTransactions).toHaveLength(1);
      expect(debitTransactions[0].type).toBe('Debit');
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('should filter transactions by date range', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        },
        {
          id: '2',
          type: 'Debit',
          date: '2024-01-20T00:00:00.000Z',
          categoryName: 'Office Supplies',
          particulars: 'Purchase of stationery',
          amount: 150.00,
          referenceNumber: 'CB-20240120-87654321'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 2,
        totalCredits: 1000.00,
        totalDebits: 150.00
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      const startDate = new Date('2024-01-14');
      const endDate = new Date('2024-01-16');

      // Act
      const filteredTransactions = await transactionService.getTransactionsByDateRange(startDate, endDate);

      // Assert
      expect(filteredTransactions).toHaveLength(1);
      expect(filteredTransactions[0].id).toBe('1');
    });
  });

  describe('getRunningTotals', () => {
    it('should calculate running totals correctly', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        },
        {
          id: '2',
          type: 'Debit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Office Supplies',
          particulars: 'Purchase of stationery',
          amount: 150.00,
          referenceNumber: 'CB-20240115-87654321'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 2,
        totalCredits: 1000.00,
        totalDebits: 150.00
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const totals = await transactionService.getRunningTotals();

      // Assert
      expect(totals.totalCredits).toBe(1000.00);
      expect(totals.totalDebits).toBe(150.00);
      expect(totals.netAmount).toBe(850.00);
    });

    it('should return zero totals when no transactions', async () => {
      // Arrange
      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: [],
        totalCount: 0,
        totalCredits: 0,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const totals = await transactionService.getRunningTotals();

      // Assert
      expect(totals.totalCredits).toBe(0);
      expect(totals.totalDebits).toBe(0);
      expect(totals.netAmount).toBe(0);
    });
  });

  describe('searchTransactions', () => {
    it('should search transactions by category name', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        },
        {
          id: '2',
          type: 'Debit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Office Supplies',
          particulars: 'Purchase of stationery',
          amount: 150.00,
          referenceNumber: 'CB-20240115-87654321'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 2,
        totalCredits: 1000.00,
        totalDebits: 150.00
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const searchResults = await transactionService.searchTransactions('Sales');

      // Assert
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].categoryName).toBe('Sales Revenue');
    });

    it('should search transactions by contact name', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678',
          contactName: 'ABC Company'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const searchResults = await transactionService.searchTransactions('ABC');

      // Assert
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].contactName).toBe('ABC Company');
    });

    it('should return empty array when no matches found', async () => {
      // Arrange
      const mockTransactions: SavedTransaction[] = [
        {
          id: '1',
          type: 'Credit',
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          referenceNumber: 'CB-20240115-12345678'
        }
      ];

      const apiResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: mockTransactions,
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(apiResponse);

      // Act
      const searchResults = await transactionService.searchTransactions('NonExistent');

      // Assert
      expect(searchResults).toHaveLength(0);
    });
  });
});
