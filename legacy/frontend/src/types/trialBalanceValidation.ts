// Trial Balance Type Guards and Validation Utilities
import {
  AccountCategoryType,
  UserRole,
  ExportFormat,
  DateRange,
  AccountBalance,
  AccountCategory,
  TrialBalanceData,
  TrialBalanceRequestDto,
  TrialBalanceResponseDto,
  AccountBalanceDto,
  AccountCategoryDto,
  ValidationError
} from './trialBalance';

// Type Guards
export function isAccountCategoryType(value: string): value is AccountCategoryType {
  return Object.values(AccountCategoryType).includes(value as AccountCategoryType);
}

export function isUserRole(value: string): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

export function isExportFormat(value: string): value is ExportFormat {
  return Object.values(ExportFormat).includes(value as ExportFormat);
}

export function isDateRange(obj: unknown): obj is DateRange {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'startDate' in obj &&
    'endDate' in obj &&
    (obj as Record<string, unknown>).startDate instanceof Date &&
    (obj as Record<string, unknown>).endDate instanceof Date
  );
}

export function isAccountBalance(obj: unknown): obj is AccountBalance {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'accountId' in obj &&
    'accountName' in obj &&
    'categoryDescription' in obj &&
    'particulars' in obj &&
    'debitAmount' in obj &&
    'creditAmount' in obj &&
    'netBalance' in obj &&
    'transactionCount' in obj &&
    typeof (obj as Record<string, unknown>).accountId === 'string' &&
    typeof (obj as Record<string, unknown>).accountName === 'string' &&
    typeof (obj as Record<string, unknown>).categoryDescription === 'string' &&
    typeof (obj as Record<string, unknown>).particulars === 'string' &&
    typeof (obj as Record<string, unknown>).debitAmount === 'number' &&
    typeof (obj as Record<string, unknown>).creditAmount === 'number' &&
    typeof (obj as Record<string, unknown>).netBalance === 'number' &&
    typeof (obj as Record<string, unknown>).transactionCount === 'number'
  );
}

export function isAccountCategory(obj: unknown): obj is AccountCategory {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'name' in obj &&
    'accounts' in obj &&
    'subtotal' in obj &&
    isAccountCategoryType((obj as Record<string, unknown>).name as string) &&
    Array.isArray((obj as Record<string, unknown>).accounts) &&
    ((obj as Record<string, unknown>).accounts as unknown[]).every(isAccountBalance) &&
    typeof (obj as Record<string, unknown>).subtotal === 'number'
  );
}

export function isTrialBalanceData(obj: unknown): obj is TrialBalanceData {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'dateRange' in obj &&
    'categories' in obj &&
    'totalDebits' in obj &&
    'totalCredits' in obj &&
    'finalBalance' in obj &&
    'calculationExpression' in obj &&
    'generatedAt' in obj &&
    'totalTransactions' in obj &&
    isDateRange((obj as Record<string, unknown>).dateRange) &&
    Array.isArray((obj as Record<string, unknown>).categories) &&
    ((obj as Record<string, unknown>).categories as unknown[]).every(isAccountCategory) &&
    typeof (obj as Record<string, unknown>).totalDebits === 'number' &&
    typeof (obj as Record<string, unknown>).totalCredits === 'number' &&
    typeof (obj as Record<string, unknown>).finalBalance === 'number' &&
    typeof (obj as Record<string, unknown>).calculationExpression === 'string' &&
    (obj as Record<string, unknown>).generatedAt instanceof Date &&
    typeof (obj as Record<string, unknown>).totalTransactions === 'number'
  );
}

export function isTrialBalanceResponseDto(obj: unknown): obj is TrialBalanceResponseDto {
  const record = obj as Record<string, unknown>;
  const dateRange = record.dateRange as Record<string, unknown>;

  return (
    obj !== null &&
    typeof obj === 'object' &&
    'dateRange' in obj &&
    'categories' in obj &&
    'totalDebits' in obj &&
    'totalCredits' in obj &&
    'finalBalance' in obj &&
    'calculationExpression' in obj &&
    'generatedAt' in obj &&
    'totalTransactions' in obj &&
    record.dateRange !== null &&
    typeof record.dateRange === 'object' &&
    'startDate' in dateRange &&
    'endDate' in dateRange &&
    typeof dateRange.startDate === 'string' &&
    typeof dateRange.endDate === 'string' &&
    Array.isArray(record.categories) &&
    typeof record.totalDebits === 'number' &&
    typeof record.totalCredits === 'number' &&
    typeof record.finalBalance === 'number' &&
    typeof record.calculationExpression === 'string' &&
    typeof record.generatedAt === 'string' &&
    typeof record.totalTransactions === 'number'
  );
}

// Validation Functions
export function validateDateRange(dateRange: DateRange): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!dateRange.startDate || !dateRange.endDate) {
    errors.push({
      field: 'dateRange',
      message: 'Both start date and end date are required'
    });
    return errors;
  }

  if (dateRange.startDate > dateRange.endDate) {
    errors.push({
      field: 'dateRange',
      message: 'Start date cannot be later than end date'
    });
  }

  // Check if date range is not too far in the future
  const today = new Date();
  if (dateRange.startDate > today) {
    errors.push({
      field: 'startDate',
      message: 'Start date cannot be in the future'
    });
  }

  if (dateRange.endDate > today) {
    errors.push({
      field: 'endDate',
      message: 'End date cannot be in the future'
    });
  }

  // Check for reasonable date range (not more than 5 years)
  const maxRangeMs = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
  if (dateRange.endDate.getTime() - dateRange.startDate.getTime() > maxRangeMs) {
    errors.push({
      field: 'dateRange',
      message: 'Date range cannot exceed 5 years'
    });
  }

  return errors;
}

export function validateTrialBalanceRequest(request: TrialBalanceRequestDto): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate date strings
  if (!request.startDate) {
    errors.push({
      field: 'startDate',
      message: 'Start date is required'
    });
  } else {
    const startDate = new Date(request.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push({
        field: 'startDate',
        message: 'Invalid start date format'
      });
    }
  }

  if (!request.endDate) {
    errors.push({
      field: 'endDate',
      message: 'End date is required'
    });
  } else {
    const endDate = new Date(request.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push({
        field: 'endDate',
        message: 'Invalid end date format'
      });
    }
  }

  // Validate date range if both dates are valid
  if (request.startDate && request.endDate) {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const dateRangeErrors = validateDateRange({ startDate, endDate });
      errors.push(...dateRangeErrors);
    }
  }

  // Validate category filter if provided
  if (request.categoryFilter && Array.isArray(request.categoryFilter)) {
    const invalidCategories = request.categoryFilter.filter(
      category => !isAccountCategoryType(category)
    );

    if (invalidCategories.length > 0) {
      errors.push({
        field: 'categoryFilter',
        message: `Invalid category types: ${invalidCategories.join(', ')}`
      });
    }
  }

  return errors;
}

export function validateAccountBalance(balance: AccountBalance): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!balance.accountId || balance.accountId.trim() === '') {
    errors.push({
      field: 'accountId',
      message: 'Account ID is required'
    });
  }

  if (!balance.accountName || balance.accountName.trim() === '') {
    errors.push({
      field: 'accountName',
      message: 'Account name is required'
    });
  }

  if (typeof balance.debitAmount !== 'number' || isNaN(balance.debitAmount)) {
    errors.push({
      field: 'debitAmount',
      message: 'Debit amount must be a valid number'
    });
  }

  if (typeof balance.creditAmount !== 'number' || isNaN(balance.creditAmount)) {
    errors.push({
      field: 'creditAmount',
      message: 'Credit amount must be a valid number'
    });
  }

  if (typeof balance.netBalance !== 'number' || isNaN(balance.netBalance)) {
    errors.push({
      field: 'netBalance',
      message: 'Net balance must be a valid number'
    });
  }

  if (balance.transactionCount < 0) {
    errors.push({
      field: 'transactionCount',
      message: 'Transaction count cannot be negative'
    });
  }

  return errors;
}

// Utility Functions for Data Transformation
export function transformResponseToTrialBalanceData(response: TrialBalanceResponseDto): TrialBalanceData {
  return {
    dateRange: {
      startDate: new Date(response.dateRange.startDate),
      endDate: new Date(response.dateRange.endDate)
    },
    categories: response.categories.map(transformCategoryDto),
    totalDebits: response.totalDebits,
    totalCredits: response.totalCredits,
    finalBalance: response.finalBalance,
    calculationExpression: response.calculationExpression,
    generatedAt: new Date(response.generatedAt),
    totalTransactions: response.totalTransactions
  };
}

function transformCategoryDto(categoryDto: AccountCategoryDto): AccountCategory {
  return {
    name: categoryDto.name as AccountCategoryType,
    accounts: categoryDto.accounts.map(transformAccountBalanceDto),
    subtotal: categoryDto.subtotal
  };
}

function transformAccountBalanceDto(accountDto: AccountBalanceDto): AccountBalance {
  return {
    accountId: accountDto.accountId,
    accountName: accountDto.accountName,
    categoryDescription: accountDto.categoryDescription,
    particulars: accountDto.particulars,
    debitAmount: accountDto.debitAmount,
    creditAmount: accountDto.creditAmount,
    netBalance: accountDto.netBalance,
    transactionCount: accountDto.transactionCount
  };
}

export function createTrialBalanceRequest(
  startDate: Date,
  endDate: Date,
  options?: {
    groupByCategory?: boolean;
    includeZeroBalances?: boolean;
    categoryFilter?: AccountCategoryType[];
  }
): TrialBalanceRequestDto {
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    groupByCategory: options?.groupByCategory ?? true,
    includeZeroBalances: options?.includeZeroBalances ?? false,
    categoryFilter: options?.categoryFilter
  };
}

// Date utility functions
export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateRangeForDisplay(dateRange: DateRange): string {
  return `${formatDateForDisplay(dateRange.startDate)} - ${formatDateForDisplay(dateRange.endDate)}`;
}

// Currency formatting utility
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Calculation validation
export function validateCalculationExpression(expression: string, expectedResult: number): boolean {
  try {
    // Basic validation - check if expression contains expected mathematical operators
    const hasValidOperators = /^[\d\s+\-=.]+$/.test(expression);
    if (!hasValidOperators) return false;

    // Check if the expression ends with the expected result
    const parts = expression.split('=');
    if (parts.length !== 2) return false;

    const result = parseFloat(parts[1].trim());
    return Math.abs(result - expectedResult) < 0.01; // Allow for small floating point differences
  } catch {
    return false;
  }
}