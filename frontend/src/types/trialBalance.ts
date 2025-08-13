// Trial Balance Reporting Types
// This file contains all TypeScript interfaces and types for the trial balance reporting feature

// Enums
export enum AccountCategoryType {
  ASSETS = 'Assets',
  LIABILITIES = 'Liabilities',
  EQUITY = 'Equity',
  INCOME = 'Income',
  EXPENSES = 'Expenses'
}

export enum UserRole {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  EMPLOYEE = 'Employee'
}

export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv'
}

// Core Data Interfaces
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  categoryDescription: string;
  particulars: string; // Transaction description/particulars
  debitAmount: number; // Always negative for debits
  creditAmount: number; // Always positive for credits
  netBalance: number;
  transactionCount: number;
}

export interface AccountCategory {
  name: AccountCategoryType;
  accounts: AccountBalance[];
  subtotal: number;
}

export interface TrialBalanceData {
  dateRange: DateRange;
  categories: AccountCategory[];
  totalDebits: number;
  totalCredits: number;
  finalBalance: number;
  calculationExpression: string;
  generatedAt: Date;
  totalTransactions: number;
}

// Comparison Types
export interface AccountVariance {
  accountId: string;
  accountName: string;
  period1Balance: number;
  period2Balance: number;
  absoluteChange: number;
  percentageChange: number;
}

export interface TrialBalanceComparison {
  period1: TrialBalanceData;
  period2: TrialBalanceData;
  variances: AccountVariance[];
}

// Request/Response DTOs
export interface TrialBalanceRequestDto {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  groupByCategory?: boolean;
  includeZeroBalances?: boolean;
  categoryFilter?: AccountCategoryType[];
}

export interface TrialBalanceResponseDto {
  dateRange: {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  };
  categories: AccountCategoryDto[];
  totalDebits: number;
  totalCredits: number;
  finalBalance: number;
  calculationExpression: string;
  generatedAt: string; // ISO date string
  totalTransactions: number;
}

export interface AccountCategoryDto {
  name: string;
  accounts: AccountBalanceDto[];
  subtotal: number;
}

export interface AccountBalanceDto {
  accountId: string;
  accountName: string;
  categoryName: string;
  categoryDescription: string;
  particulars: string; // Transaction description/particulars
  debitAmount: number; // Negative values
  creditAmount: number; // Positive values
  netBalance: number;
  transactionCount: number;
}

export interface TrialBalanceComparisonRequestDto {
  period1: {
    startDate: string;
    endDate: string;
  };
  period2: {
    startDate: string;
    endDate: string;
  };
  groupByCategory?: boolean;
  includeZeroBalances?: boolean;
}

export interface TrialBalanceComparisonResponseDto {
  period1: TrialBalanceResponseDto;
  period2: TrialBalanceResponseDto;
  variances: AccountVarianceDto[];
}

export interface AccountVarianceDto {
  accountId: string;
  accountName: string;
  period1Balance: number;
  period2Balance: number;
  absoluteChange: number;
  percentageChange: number;
}

// UI Component Props Types
export interface DateRangePreset {
  label: string;
  startDate: Date;
  endDate: Date;
}

export interface TrialBalancePageProps {
  defaultDateRange?: DateRange;
  userRole: UserRole;
}

export interface TrialBalanceReportProps {
  data: TrialBalanceData;
  showCalculationDetails: boolean;
  onAccountClick: (accountId: string) => void;
  groupByCategory: boolean;
}

export interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
  maxRange?: number; // Maximum days allowed
  presets?: DateRangePreset[];
}

export interface AccountDrillDownProps {
  accountId: string;
  accountName: string;
  dateRange: DateRange;
  isOpen: boolean;
  onClose: () => void;
}

export interface ExportOptionsProps {
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  exportProgress?: number;
}

// Transaction Detail Types (for drill-down)
export interface TransactionDetail {
  id: string;
  date: Date;
  categoryDescription: string;
  particulars: string;
  referenceNumber: string;
  debitAmount: number;
  creditAmount: number;
  runningBalance: number;
}

// Sorting options for transaction drill-down
export enum TransactionSortField {
  DATE = 'date',
  AMOUNT = 'amount',
  DESCRIPTION = 'description',
  REFERENCE = 'reference'
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface TransactionSortOptions {
  field: TransactionSortField;
  direction: SortDirection;
}

export interface AccountTransactionResponse {
  accountId: string;
  accountName: string;
  transactions: TransactionDetail[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

// Error Types
export interface TrialBalanceError {
  code: string;
  message: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Loading States
export interface TrialBalanceLoadingState {
  isLoading: boolean;
  isExporting: boolean;
  exportProgress?: number;
  error?: TrialBalanceError;
}

// Export Types
export interface ExportRequest {
  format: ExportFormat;
  dateRange: DateRange;
  includeCalculationDetails: boolean;
  filename?: string;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  fileSize: number;
  generatedAt: Date;
}