import { apiService } from './apiService';

export interface CreditTransactionDto {
  date: string; // ISO date string
  categoryName: string;
  particulars: string;
  amount: number;
  contactName?: string;
  referenceNumber?: string;
}

export interface DebitTransactionDto {
  date: string; // ISO date string
  categoryName: string;
  supplierName?: string;
  buyerName?: string;
  particulars: string;
  amount: number;
  referenceNumber?: string;
}

export interface TransactionSaveResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  journalEntryId?: string;
}

export interface SavedTransaction {
  id: string;
  date: string;
  type: 'Credit' | 'Debit';
  categoryName: string;
  particulars: string;
  amount: number;
  referenceNumber: string;
  contactName?: string;
  createdAt: string;
}

class TransactionService {
  private readonly baseUrl = '/api/cashbookentry';

  /**
   * Save a credit transaction independently
   */
  async saveCreditTransaction(transaction: {
    date: Date;
    categoryName: string;
    particulars: string;
    amount: number;
    contactName?: string;
  }): Promise<TransactionSaveResponse> {
    try {
      const dto: CreditTransactionDto = {
        date: transaction.date.toISOString(),
        categoryName: transaction.categoryName,
        particulars: transaction.particulars,
        amount: transaction.amount,
        contactName: transaction.contactName,
        referenceNumber: this.generateReferenceNumber('CR')
      };

      const response = await apiService.post<TransactionSaveResponse>(`${this.baseUrl}/credit-transaction`, dto);
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
   * Save a debit transaction independently
   */
  async saveDebitTransaction(transaction: {
    date: Date;
    categoryName: string;
    supplierName?: string;
    buyerName?: string;
    particulars: string;
    amount: number;
  }): Promise<TransactionSaveResponse> {
    try {
      const dto: DebitTransactionDto = {
        date: transaction.date.toISOString(),
        categoryName: transaction.categoryName,
        supplierName: transaction.supplierName,
        buyerName: transaction.buyerName,
        particulars: transaction.particulars,
        amount: transaction.amount,
        referenceNumber: this.generateReferenceNumber('DR')
      };

      const response = await apiService.post<TransactionSaveResponse>(`${this.baseUrl}/debit-transaction`, dto);
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
   * Get recent transactions from the database
   */
  async getRecentTransactions(limit: number = 50): Promise<SavedTransaction[]> {
    try {
      const response = await apiService.get<SavedTransaction[]>(`${this.baseUrl}/recent-transactions?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  /**
   * Generate a reference number for transactions
   */
  private generateReferenceNumber(type: 'CR' | 'DR'): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `${type}-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${timestamp}`;
  }
}

export const transactionService = new TransactionService();