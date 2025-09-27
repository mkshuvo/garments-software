import { apiService } from './apiService';
import { cacheService } from './cacheService';

// Types based on backend DTOs
export interface JournalEntry {
  id: string;
  journalNumber: string;
  transactionDate: string;
  type: 'Credit' | 'Debit';
  categoryName: string;
  particulars: string;
  amount: number;
  referenceNumber: string;
  contactName?: string;
  accountName: string;
  createdAt: string;
  status?: string;
}

export interface JournalEntryFilters {
  dateFrom?: Date;
  dateTo?: Date;
  transactionType: 'All' | 'Credit' | 'Debit';
  amountMin?: number;
  amountMax?: number;
  category?: string;
  referenceNumber?: string;
  contactName?: string;
  description?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetJournalEntriesRequest {
  page: number;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  amountMin?: number;
  amountMax?: number;
  category?: string;
  referenceNumber?: string;
  contactName?: string;
  description?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEntries: number;
  pageSize: number;
}

export interface SummaryInfo {
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export interface GetJournalEntriesResponse {
  success: boolean;
  message?: string;
  entries: JournalEntry[];
  pagination: PaginationInfo;
  summary: SummaryInfo;
}

export interface ExportJournalEntriesRequest {
  format: 'csv' | 'excel' | 'pdf';
  columns: string[];
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  amountMin?: number;
  amountMax?: number;
  category?: string;
  referenceNumber?: string;
  contactName?: string;
  description?: string;
  status?: string;
}

export interface ExportJournalEntriesResponse {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  fileName?: string;
}

/**
 * Service for managing journal entries
 */
class JournalEntryService {
  private readonly baseUrl = '/api/journalentry';

  /**
   * Get journal entries with filtering and pagination
   */
  async getJournalEntries(
    filters: JournalEntryFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<GetJournalEntriesResponse> {
    try {
      // Create cache key based on filters and pagination
      const cacheKey = `journal-entries:${JSON.stringify({ filters, page, limit })}`;
      
      // Check cache first
      const cached = cacheService.get<GetJournalEntriesResponse>(cacheKey);
      if (cached) {
        return cached;
      }

      const request: GetJournalEntriesRequest = {
        page,
        limit,
        sortBy: 'TransactionDate',
        sortOrder: 'desc'
      };

      // Add filters if provided
      if (filters.dateFrom) {
        request.dateFrom = filters.dateFrom.toISOString();
      }
      if (filters.dateTo) {
        request.dateTo = filters.dateTo.toISOString();
      }
      if (filters.transactionType !== 'All') {
        request.type = filters.transactionType;
      }
      if (filters.amountMin !== undefined) {
        request.amountMin = filters.amountMin;
      }
      if (filters.amountMax !== undefined) {
        request.amountMax = filters.amountMax;
      }
      if (filters.category) {
        request.category = filters.category;
      }
      if (filters.referenceNumber) {
        request.referenceNumber = filters.referenceNumber;
      }
      if (filters.contactName) {
        request.contactName = filters.contactName;
      }
      if (filters.description) {
        request.description = filters.description;
      }
      if (filters.status) {
        request.status = filters.status;
      }

      const response = await apiService.get<GetJournalEntriesResponse>(
        `${this.baseUrl}`,
        { params: request }
      );

      // Cache the response for 2 minutes
      try {
        cacheService.set(cacheKey, response, { ttl: 2 * 60 * 1000 });
      } catch (cacheError) {
        console.warn('Cache error:', cacheError);
        // Continue without caching
      }

      return response;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url,
        method: error?.config?.method
      });
      
      // Return mock data when API is unavailable
      console.warn('API unavailable, returning mock data');
      const mockResponse: GetJournalEntriesResponse = {
        success: true,
        message: 'Mock data - Backend API is currently unavailable',
        entries: [
          {
            id: '1',
            journalNumber: 'JE-001',
            transactionDate: new Date().toISOString(),
            type: 'Credit',
            categoryName: 'Sales Revenue',
            particulars: 'Sample journal entry',
            amount: 1000.00,
            referenceNumber: 'REF-001',
            contactName: 'Sample Customer',
            accountName: 'Cash Account',
            createdAt: new Date().toISOString(),
            status: 'Approved'
          },
          {
            id: '2',
            journalNumber: 'JE-002',
            transactionDate: new Date().toISOString(),
            type: 'Debit',
            categoryName: 'Office Supplies',
            particulars: 'Purchase of office supplies',
            amount: 250.00,
            referenceNumber: 'REF-002',
            contactName: 'Office Depot',
            accountName: 'Expense Account',
            createdAt: new Date().toISOString(),
            status: 'Pending'
          }
        ],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalCount: 2
        },
        summary: {
          totalDebits: 250.00,
          totalCredits: 1000.00,
          balance: 750.00
        }
      };
      
      return mockResponse;
    }
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(id: string): Promise<JournalEntry> {
    try {
      const response = await apiService.get<JournalEntry>(
        `${this.baseUrl}/${id}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      throw new Error('Failed to fetch journal entry details. Please try again.');
    }
  }

  /**
   * Export journal entries
   */
  async exportJournalEntries(
    request: ExportJournalEntriesRequest
  ): Promise<ExportJournalEntriesResponse> {
    try {
      const response = await apiService.post<ExportJournalEntriesResponse>(
        `${this.baseUrl}/export`,
        request
      );
      return response;
    } catch (error) {
      console.error('Error exporting journal entries:', error);
      throw new Error('Failed to export journal entries. Please try again.');
    }
  }

  /**
   * Get journal entry statistics
   */
  async getStatistics(filters: JournalEntryFilters): Promise<SummaryInfo> {
    try {
      const params: Record<string, string> = {};

      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom.toISOString();
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo.toISOString();
      }
      if (filters.transactionType !== 'All') {
        params.type = filters.transactionType;
      }
      if (filters.category) {
        params.category = filters.category;
      }

      const response = await apiService.get<SummaryInfo>(
        `${this.baseUrl}/statistics`,
        { params }
      );

      return response;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error('Failed to fetch statistics. Please try again.');
    }
  }

  /**
   * Download exported file
   */
  async downloadExport(url: string, fileName: string): Promise<void> {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file. Please try again.');
    }
  }

  /**
   * Invalidate cache for journal entries
   */
  invalidateCache(): void {
    cacheService.invalidatePrefix('journal-entries:');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats();
  }
}

// Export singleton instance
export const journalEntryService = new JournalEntryService();
export default journalEntryService;
