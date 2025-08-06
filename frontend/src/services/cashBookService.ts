import { apiService } from './apiService';

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
   * Save a cash book entry to the database
   */
  async saveCashBookEntry(entry: CashBookEntry): Promise<CashBookSaveResponse> {
    try {
      // Transform the frontend data structure to match the backend DTO
      const dto: CashBookEntryDto = {
        transactionDate: entry.transactionDate.toISOString(),
        referenceNumber: entry.referenceNumber,
        description: entry.description,
        creditTransactions: entry.creditTransactions.map(ct => ({
          date: ct.date.toISOString(),
          categoryName: ct.categoryName,
          particulars: ct.particulars,
          amount: ct.amount,
          contactName: ct.contactName
        })),
        debitTransactions: entry.debitTransactions.map(dt => ({
          date: dt.date.toISOString(),
          categoryName: dt.categoryName,
          supplierName: dt.supplierName,
          buyerName: dt.buyerName,
          particulars: dt.particulars,
          amount: dt.amount
        }))
      };

      const response = await apiService.post<CashBookSaveResponse>(`${this.baseUrl}/create-entry`, dto);
      return response;
    } catch (error: any) {
      console.error('Error saving cash book entry:', error);
      
      // Return a structured error response
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save cash book entry'
      };
    }
  }

  /**
   * Get categories for cash book entries
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`${this.baseUrl}/categories`);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get contacts for cash book entries
   */
  async getContacts(): Promise<any[]> {
    try {
      const response = await apiService.get<any[]>(`${this.baseUrl}/contacts`);
      return response;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }
}

export const cashBookService = new CashBookService();