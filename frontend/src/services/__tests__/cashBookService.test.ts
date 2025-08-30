import { cashBookService, CreditTransaction, DebitTransaction } from '../cashBookService';
import { apiService } from '../apiService';

// Mock the apiService
jest.mock('../apiService');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

describe('CashBookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCreditTransaction', () => {
    it('should save credit transaction successfully', async () => {
      // Arrange
      const transaction: CreditTransaction = {
        id: '1',
        date: new Date('2024-01-15'),
        categoryName: 'Sales Revenue',
        particulars: 'Payment from customer',
        amount: 1000.00,
        contactName: 'ABC Company'
      };

      const expectedResponse = {
        success: true,
        message: 'Credit transaction saved successfully',
        transactionId: '123',
        referenceNumber: 'CB-20240115-12345678'
      };

      mockedApiService.post.mockResolvedValue(expectedResponse);

      // Act
      const result = await cashBookService.saveCreditTransaction(transaction);

      // Assert
      expect(mockedApiService.post).toHaveBeenCalledWith(
        '/api/cashbookentry/independent-credit-transaction',
        {
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Sales Revenue',
          particulars: 'Payment from customer',
          amount: 1000.00,
          contactName: 'ABC Company'
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const transaction: CreditTransaction = {
        id: '1',
        date: new Date('2024-01-15'),
        categoryName: 'Sales Revenue',
        particulars: 'Payment from customer',
        amount: 1000.00
      };

      const error = new Error('Network error');
      mockedApiService.post.mockRejectedValue(error);

      // Act
      const result = await cashBookService.saveCreditTransaction(transaction);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Network error'
      });
    });
  });

  describe('saveDebitTransaction', () => {
    it('should save debit transaction successfully', async () => {
      // Arrange
      const transaction: DebitTransaction = {
        id: '1',
        date: new Date('2024-01-15'),
        categoryName: 'Office Supplies',
        particulars: 'Purchase of stationery',
        amount: 150.00,
        supplierName: 'Office Depot'
      };

      const expectedResponse = {
        success: true,
        message: 'Debit transaction saved successfully',
        transactionId: '456',
        referenceNumber: 'CB-20240115-87654321'
      };

      mockedApiService.post.mockResolvedValue(expectedResponse);

      // Act
      const result = await cashBookService.saveDebitTransaction(transaction);

      // Assert
      expect(mockedApiService.post).toHaveBeenCalledWith(
        '/api/cashbookentry/independent-debit-transaction',
        {
          date: '2024-01-15T00:00:00.000Z',
          categoryName: 'Office Supplies',
          supplierName: 'Office Depot',
          buyerName: undefined,
          particulars: 'Purchase of stationery',
          amount: 150.00
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const transaction: DebitTransaction = {
        id: '1',
        date: new Date('2024-01-15'),
        categoryName: 'Office Supplies',
        particulars: 'Purchase of stationery',
        amount: 150.00
      };

      const error = new Error('Server error');
      mockedApiService.post.mockRejectedValue(error);

      // Act
      const result = await cashBookService.saveDebitTransaction(transaction);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Server error'
      });
    });
  });

  describe('getRecentTransactions', () => {
    it('should fetch recent transactions successfully', async () => {
      // Arrange
      const expectedResponse = {
        success: true,
        message: 'Recent transactions retrieved successfully',
        transactions: [
          {
            id: '1',
            type: 'Credit' as const,
            date: '2024-01-15T00:00:00.000Z',
            categoryName: 'Sales Revenue',
            particulars: 'Payment from customer',
            amount: 1000.00,
            referenceNumber: 'CB-20240115-12345678',
            contactName: 'ABC Company'
          }
        ],
        totalCount: 1,
        totalCredits: 1000.00,
        totalDebits: 0
      };

      mockedApiService.get.mockResolvedValue(expectedResponse);

      // Act
      const result = await cashBookService.getRecentTransactions(20);

      // Assert
      expect(mockedApiService.get).toHaveBeenCalledWith(
        '/api/cashbookentry/recent-independent-transactions?limit=20'
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const error = new Error('Failed to fetch');
      mockedApiService.get.mockRejectedValue(error);

      // Act
      const result = await cashBookService.getRecentTransactions();

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch',
        transactions: [],
        totalCount: 0,
        totalCredits: 0,
        totalDebits: 0
      });
    });
  });

  describe('getCategories', () => {
    it('should fetch categories successfully', async () => {
      // Arrange
      const expectedCategories = [
        { id: '1', name: 'Sales Revenue', type: 'Credit' },
        { id: '2', name: 'Office Supplies', type: 'Debit' }
      ];

      mockedApiService.get.mockResolvedValue(expectedCategories);

      // Act
      const result = await cashBookService.getCategories();

      // Assert
      expect(mockedApiService.get).toHaveBeenCalledWith('/api/cashbookentry/categories');
      expect(result).toEqual(expectedCategories);
    });

    it('should return empty array on error', async () => {
      // Arrange
      const error = new Error('Failed to fetch categories');
      mockedApiService.get.mockRejectedValue(error);

      // Act
      const result = await cashBookService.getCategories();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getContacts', () => {
    it('should fetch contacts successfully', async () => {
      // Arrange
      const expectedContacts = [
        { id: '1', name: 'ABC Company', type: 'Customer' },
        { id: '2', name: 'Office Depot', type: 'Supplier' }
      ];

      mockedApiService.get.mockResolvedValue(expectedContacts);

      // Act
      const result = await cashBookService.getContacts();

      // Assert
      expect(mockedApiService.get).toHaveBeenCalledWith('/api/cashbookentry/contacts');
      expect(result).toEqual(expectedContacts);
    });

    it('should return empty array on error', async () => {
      // Arrange
      const error = new Error('Failed to fetch contacts');
      mockedApiService.get.mockRejectedValue(error);

      // Act
      const result = await cashBookService.getContacts();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
