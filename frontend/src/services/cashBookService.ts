import { apiService } from './apiService';

export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface Contact {
  id: string;
  name: string;
  type: string;
}

export interface CashBookEntry {
  id: string;
  transactionDate: Date;
  referenceNumber: string;
  description: string;
  creditTransactions: CreditTransaction[];
  debitTransactions: DebitTransaction[];
}

export interface CreditTransaction {
  id: string;
  date: Date;
  categoryName: string;
  particulars: string;
  amount: number;
  contactName?: string;
}

export interface DebitTransaction {
  id: string;
  date: Date;
  categoryName: string;
  supplierName?: string;
  buyerName?: string;
  particulars: string;
  amount: number;
}

export interface CashBookEntryDto {
  transactionDate: string; // ISO date string
  referenceNumber: string;
  description?: string;
  creditTransactions: CreditTransactionDto[];
  debitTransactions: DebitTransactionDto[];
}

export interface CreditTransactionDto {
  date: string; // ISO date string
  categoryName: string;
  particulars: string;
  amount: number;
  contactName?: string;
}

export interface DebitTransactionDto {
  date: string; // ISO date string
  categoryName: string;
  supplierName?: string;
  buyerName?: string;
  particulars: string;
  amount: number;
}

export interface SingleTransactionResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  referenceNumber?: string;
}

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

export interface CashBookSaveResponse {
  success: boolean;
  message: string;
  journalEntryId?: string;
  accountsCreated?: number;
  contactsCreated?: number;
  transactionsProcessed?: number;
}

class CashBookService {
  private readonly baseUrl = '/api/cashbookentry';

  /**
   * Save a single credit transaction to the database (independent)
   */
  async saveCreditTransaction(transaction: CreditTransaction): Promise<SingleTransactionResponse> {
    try {
      const dto: CreditTransactionDto = {
        date: transaction.date.toISOString(),
        categoryName: transaction.categoryName,
        particulars: transaction.particulars,
        amount: transaction.amount,
        contactName: transaction.contactName
      };

      const response = await apiService.post<SingleTransactionResponse>(`${this.baseUrl}/independent-credit-transaction`, dto);
      return response;
    } catch (error) {
      console.error('Error saving credit transaction:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save credit transaction'
      };
    }
  }

  /**
   * Save a single debit transaction to the database (independent)
   */
  async saveDebitTransaction(transaction: DebitTransaction): Promise<SingleTransactionResponse> {
    try {
      const dto: DebitTransactionDto = {
        date: transaction.date.toISOString(),
        categoryName: transaction.categoryName,
        supplierName: transaction.supplierName,
        buyerName: transaction.buyerName,
        particulars: transaction.particulars,
        amount: transaction.amount
      };

      const response = await apiService.post<SingleTransactionResponse>(`${this.baseUrl}/independent-debit-transaction`, dto);
      return response;
    } catch (error) {
      console.error('Error saving debit transaction:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save debit transaction'
      };
    }
  }

  /**
   * Get categories for cash book entries
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiService.get<Category[]>(`${this.baseUrl}/categories`);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get contacts for cash book entries
   */
  async getContacts(): Promise<Contact[]> {
    try {
      const response = await apiService.get<Contact[]>(`${this.baseUrl}/contacts`);
      return response;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  /**
   * Get recent transactions for display
   */
  async getRecentTransactions(limit: number = 20): Promise<RecentTransactionsResponse> {
    try {
      const response = await apiService.get<RecentTransactionsResponse>(`${this.baseUrl}/recent-independent-transactions?limit=${limit}`);
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
}

export const cashBookService = new CashBookService();