import { journalEntryService } from '@/services/journalEntryService';
import { apiService } from '@/services/apiService';
import { cacheService } from '@/services/cacheService';

// Mock the dependencies
jest.mock('@/services/apiService');
jest.mock('@/services/cacheService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockCacheService = cacheService as jest.Mocked<typeof cacheService>;

describe('JournalEntryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getJournalEntries', () => {
    it('should return cached data when available', async () => {
      const mockFilters = {
        transactionType: 'All' as const,
        category: '',
        referenceNumber: '',
        contactName: '',
        description: '',
        status: 'All'
      };

      const mockCachedResponse = {
        success: true,
        entries: [
          {
            id: '1',
            journalNumber: 'JE-2024-01-0001',
            transactionDate: '2024-01-01',
            type: 'Credit' as const,
            categoryName: 'Sales',
            particulars: 'Test transaction',
            amount: 1000,
            referenceNumber: 'REF001',
            contactName: 'Test Customer',
            accountName: 'Sales Account',
            createdAt: '2024-01-01T00:00:00Z',
            status: 'Posted',
            transactionStatus: 'Posted',
            createdBy: 'System',
            journalType: 'General',
            formattedAmount: '$1,000.00',
            formattedDate: 'Jan 01, 2024',
            formattedCreatedDate: 'Jan 01, 2024 00:00',
            typeColor: 'success',
            statusColor: 'info'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalEntries: 1,
          pageSize: 20,
          hasNextPage: false,
          hasPreviousPage: false,
          startEntry: 1,
          endEntry: 1
        },
        summary: {
          totalEntries: 1,
          totalDebits: 0,
          totalCredits: 1000,
          balance: -1000,
          creditEntries: 1,
          debitEntries: 0,
          entriesByStatus: { Posted: 1 },
          entriesByType: { Credit: 1 },
          formattedTotalDebits: '$0.00',
          formattedTotalCredits: '$1,000.00',
          formattedBalance: '$-1,000.00',
          isBalanced: false,
          balanceColor: 'error'
        }
      };

      mockCacheService.get.mockReturnValue(mockCachedResponse);

      const result = await journalEntryService.getJournalEntries(mockFilters, 1, 20);

      expect(mockCacheService.get).toHaveBeenCalledWith(
        expect.stringContaining('journal-entries:')
      );
      expect(mockApiService.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedResponse);
    });

    it('should fetch from API when cache miss', async () => {
      const mockFilters = {
        transactionType: 'All' as const,
        category: '',
        referenceNumber: '',
        contactName: '',
        description: '',
        status: 'All'
      };

      const mockApiResponse = {
        success: true,
        entries: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalEntries: 0,
          pageSize: 20,
          hasNextPage: false,
          hasPreviousPage: false,
          startEntry: 0,
          endEntry: 0
        },
        summary: {
          totalEntries: 0,
          totalDebits: 0,
          totalCredits: 0,
          balance: 0,
          creditEntries: 0,
          debitEntries: 0,
          entriesByStatus: {},
          entriesByType: {},
          formattedTotalDebits: '$0.00',
          formattedTotalCredits: '$0.00',
          formattedBalance: '$0.00',
          isBalanced: true,
          balanceColor: 'success'
        }
      };

      mockCacheService.get.mockReturnValue(null);
      mockApiService.get.mockResolvedValue(mockApiResponse);

      const result = await journalEntryService.getJournalEntries(mockFilters, 1, 20);

      expect(mockCacheService.get).toHaveBeenCalled();
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/api/journalentry/journal-entries',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            limit: 20,
            sortBy: 'TransactionDate',
            sortOrder: 'desc'
          })
        })
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('journal-entries:'),
        mockApiResponse,
        { ttl: 2 * 60 * 1000 }
      );
      expect(result).toEqual(mockApiResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockFilters = {
        transactionType: 'All' as const,
        category: '',
        referenceNumber: '',
        contactName: '',
        description: '',
        status: 'All'
      };

      mockCacheService.get.mockReturnValue(null);
      mockApiService.get.mockRejectedValue(new Error('API Error'));

      await expect(
        journalEntryService.getJournalEntries(mockFilters, 1, 20)
      ).rejects.toThrow('Failed to fetch journal entries. Please try again.');
    });
  });

  describe('getJournalEntryById', () => {
    it('should fetch journal entry by ID', async () => {
      const mockEntry = {
        id: '1',
        journalNumber: 'JE-2024-01-0001',
        transactionDate: '2024-01-01',
        type: 'Credit' as const,
        categoryName: 'Sales',
        particulars: 'Test transaction',
        amount: 1000,
        referenceNumber: 'REF001',
        contactName: 'Test Customer',
        accountName: 'Sales Account',
        createdAt: '2024-01-01T00:00:00Z',
        status: 'Posted',
        transactionStatus: 'Posted',
        createdBy: 'System',
        journalType: 'General',
        formattedAmount: '$1,000.00',
        formattedDate: 'Jan 01, 2024',
        formattedCreatedDate: 'Jan 01, 2024 00:00',
        typeColor: 'success',
        statusColor: 'info'
      };

      mockApiService.get.mockResolvedValue(mockEntry);

      const result = await journalEntryService.getJournalEntryById('1');

      expect(mockApiService.get).toHaveBeenCalledWith('/api/journalentry/journal-entries/1');
      expect(result).toEqual(mockEntry);
    });

    it('should handle API errors gracefully', async () => {
      mockApiService.get.mockRejectedValue(new Error('API Error'));

      await expect(
        journalEntryService.getJournalEntryById('1')
      ).rejects.toThrow('Failed to fetch journal entry details. Please try again.');
    });
  });

  describe('exportJournalEntries', () => {
    it('should export journal entries successfully', async () => {
      const mockExportRequest = {
        format: 'csv' as const,
        columns: ['journalNumber', 'transactionDate', 'amount'],
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const mockExportResponse = {
        success: true,
        fileName: 'journal-entries-2024-01-01.csv',
        downloadUrl: '/api/exports/journal-entries-2024-01-01.csv',
        exportedRecords: 10
      };

      mockApiService.post.mockResolvedValue(mockExportResponse);

      const result = await journalEntryService.exportJournalEntries(mockExportRequest);

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/api/journalentry/journal-entries/export',
        mockExportRequest
      );
      expect(result).toEqual(mockExportResponse);
    });

    it('should handle export errors gracefully', async () => {
      const mockExportRequest = {
        format: 'csv' as const,
        columns: ['journalNumber', 'transactionDate', 'amount']
      };

      mockApiService.post.mockRejectedValue(new Error('Export Error'));

      await expect(
        journalEntryService.exportJournalEntries(mockExportRequest)
      ).rejects.toThrow('Failed to export journal entries. Please try again.');
    });
  });

  describe('getStatistics', () => {
    it('should fetch statistics successfully', async () => {
      const mockFilters = {
        transactionType: 'All' as const,
        category: '',
        referenceNumber: '',
        contactName: '',
        description: '',
        status: 'All'
      };

      const mockStats = {
        totalEntries: 100,
        totalDebits: 50000,
        totalCredits: 45000,
        balance: 5000,
        creditEntries: 50,
        debitEntries: 50,
        entriesByStatus: { Posted: 100 },
        entriesByType: { Credit: 50, Debit: 50 },
        formattedTotalDebits: '$50,000.00',
        formattedTotalCredits: '$45,000.00',
        formattedBalance: '$5,000.00',
        isBalanced: false,
        balanceColor: 'error'
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await journalEntryService.getStatistics(mockFilters);

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/api/journalentry/journal-entries/statistics',
        expect.objectContaining({
          params: expect.objectContaining({
            type: 'All'
          })
        })
      );
      expect(result).toEqual(mockStats);
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache with correct prefix', () => {
      journalEntryService.invalidateCache();

      expect(mockCacheService.invalidatePrefix).toHaveBeenCalledWith('journal-entries:');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const mockStats = {
        hits: 10,
        misses: 5,
        size: 15
      };

      mockCacheService.getStats.mockReturnValue(mockStats);

      const result = journalEntryService.getCacheStats();

      expect(mockCacheService.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});

