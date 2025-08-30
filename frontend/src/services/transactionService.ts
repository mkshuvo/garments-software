import { apiService } from './apiService';

export interface SavedTransaction {
  id: string;
  type: 'Credit' | 'Debit';
  date: string;
  categoryName: string;
  particulars: string;
  amount: number;
  referenceNumber: string;
  contactName?: string;
  supplierName?: string;
}

export interface RecentTransactionsResponse {
  success: boolean;
  message: string;
  transactions: SavedTransaction[];
  totalCount: number;
  totalCredits: number;
  totalDebits: number;
}

class TransactionService {
  private readonly baseUrl = '/api/cashbookentry';
  private cache: {
    transactions: SavedTransaction[];
    lastFetched: number;
    cacheDuration: number;
  } = {
    transactions: [],
    lastFetched: 0,
    cacheDuration: 30000 // 30 seconds
  };

  /**
   * Get recent transactions with caching
   */
  async getRecentTransactions(limit: number = 20, forceRefresh: boolean = false): Promise<RecentTransactionsResponse> {
    try {
      // Check cache first
      const now = Date.now();
      if (!forceRefresh && 
          this.cache.transactions.length > 0 && 
          (now - this.cache.lastFetched) < this.cache.cacheDuration) {
        return {
          success: true,
          message: 'Transactions loaded from cache',
          transactions: this.cache.transactions.slice(0, limit),
          totalCount: this.cache.transactions.length,
          totalCredits: this.cache.transactions
            .filter(t => t.type === 'Credit')
            .reduce((sum, t) => sum + t.amount, 0),
          totalDebits: this.cache.transactions
            .filter(t => t.type === 'Debit')
            .reduce((sum, t) => sum + t.amount, 0)
        };
      }

      // Fetch from API
      const response = await apiService.get<RecentTransactionsResponse>(
        `${this.baseUrl}/recent-independent-transactions?limit=${limit}`
      );

      // Update cache
      if (response.success) {
        this.cache.transactions = response.transactions;
        this.cache.lastFetched = now;
      }

      return response;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch recent transactions',
        transactions: [],
        totalCount: 0,
        totalCredits: 0,
        totalDebits: 0
      };
    }
  }

  /**
   * Clear the transaction cache
   */
  clearCache(): void {
    this.cache.transactions = [];
    this.cache.lastFetched = 0;
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(type: 'Credit' | 'Debit', limit: number = 20): Promise<SavedTransaction[]> {
    const response = await this.getRecentTransactions(limit * 2); // Get more to filter
    if (response.success) {
      return response.transactions
        .filter(t => t.type === type)
        .slice(0, limit);
    }
    return [];
  }

  /**
   * Get transactions by date range
   */
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<SavedTransaction[]> {
    const response = await this.getRecentTransactions(100); // Get more to filter
    if (response.success) {
      return response.transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }
    return [];
  }

  /**
   * Get running totals
   */
  async getRunningTotals(): Promise<{ totalCredits: number; totalDebits: number; netAmount: number }> {
    const response = await this.getRecentTransactions(1000); // Get all transactions
    if (response.success) {
      const totalCredits = response.totalCredits;
      const totalDebits = response.totalDebits;
      const netAmount = totalCredits - totalDebits;
      
      return { totalCredits, totalDebits, netAmount };
    }
    
    return { totalCredits: 0, totalDebits: 0, netAmount: 0 };
  }

  /**
   * Search transactions by category or particulars
   */
  async searchTransactions(searchTerm: string): Promise<SavedTransaction[]> {
    const response = await this.getRecentTransactions(1000); // Get all transactions
    if (response.success) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return response.transactions.filter(t => 
        t.categoryName.toLowerCase().includes(lowerSearchTerm) ||
        t.particulars.toLowerCase().includes(lowerSearchTerm) ||
        (t.contactName && t.contactName.toLowerCase().includes(lowerSearchTerm)) ||
        (t.supplierName && t.supplierName.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return [];
  }
}

export const transactionService = new TransactionService();