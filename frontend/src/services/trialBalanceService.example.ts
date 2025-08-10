/**
 * Trial Balance Service Usage Examples
 * This file demonstrates how to use the trialBalanceService in your components
 */

import { trialBalanceService } from './trialBalanceService';
import { AccountCategoryType } from '@/types/trialBalance';

// Example 1: Basic trial balance generation
export async function generateBasicTrialBalance() {
  try {
    const dateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const trialBalance = await trialBalanceService.generateTrialBalance(dateRange);
    
    console.log('Trial Balance Generated:', {
      finalBalance: trialBalance.finalBalance,
      totalTransactions: trialBalance.totalTransactions,
      calculationExpression: trialBalance.calculationExpression,
      categoriesCount: trialBalance.categories.length,
    });

    return trialBalance;
  } catch (error) {
    console.error('Failed to generate trial balance:', error);
    throw error;
  }
}

// Example 2: Trial balance with custom options
export async function generateCustomTrialBalance() {
  try {
    const dateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
    };

    const options = {
      groupByCategory: true,
      includeZeroBalances: false,
      categoryFilter: [AccountCategoryType.ASSETS, AccountCategoryType.LIABILITIES],
    };

    const trialBalance = await trialBalanceService.generateTrialBalance(dateRange, options);
    
    // Process only Assets and Liabilities categories
    const assetsCategory = trialBalance.categories.find(cat => cat.name === AccountCategoryType.ASSETS);
    const liabilitiesCategory = trialBalance.categories.find(cat => cat.name === AccountCategoryType.LIABILITIES);

    console.log('Assets Total:', assetsCategory?.subtotal || 0);
    console.log('Liabilities Total:', liabilitiesCategory?.subtotal || 0);

    return trialBalance;
  } catch (error) {
    console.error('Failed to generate custom trial balance:', error);
    throw error;
  }
}

// Example 3: Account drill-down functionality
export async function getAccountDetails(accountId: string) {
  try {
    const dateRange = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const accountTransactions = await trialBalanceService.getAccountTransactions(
      accountId,
      dateRange,
      { page: 1, pageSize: 50 }
    );

    console.log(`Account ${accountTransactions.accountName} Details:`, {
      totalTransactions: accountTransactions.totalCount,
      currentPage: accountTransactions.currentPage,
      pageSize: accountTransactions.pageSize,
    });

    // Process transactions
    accountTransactions.transactions.forEach(transaction => {
      console.log(`${transaction.date.toDateString()}: ${transaction.particulars} - ${transaction.creditAmount - transaction.debitAmount}`);
    });

    return accountTransactions;
  } catch (error) {
    console.error(`Failed to get account details for ${accountId}:`, error);
    throw error;
  }
}

// Example 4: Period comparison (Admin only)
export async function compareTrialBalancePeriods() {
  try {
    const period1 = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
    };

    const period2 = {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
    };

    const comparison = await trialBalanceService.compareTrialBalances(period1, period2, {
      groupByCategory: true,
      includeZeroBalances: false,
    });

    console.log('Period Comparison Results:', {
      period1Balance: comparison.period1.finalBalance,
      period2Balance: comparison.period2.finalBalance,
      totalVariances: comparison.variances.length,
    });

    // Find significant variances (>10% change)
    const significantVariances = comparison.variances.filter(
      variance => Math.abs(variance.percentageChange) > 10
    );

    console.log('Significant Variances (>10% change):', significantVariances);

    return comparison;
  } catch (error) {
    console.error('Failed to compare trial balance periods:', error);
    throw error;
  }
}

// Example 5: Date range validation
export function validateAndGenerateTrialBalance(startDate: Date, endDate: Date) {
  const dateRange = { startDate, endDate };

  // Validate date range before making API call
  if (!trialBalanceService.validateDateRange(dateRange)) {
    const errorMessage = trialBalanceService.getDateRangeValidationError(dateRange);
    console.error('Invalid date range:', errorMessage);
    throw new Error(errorMessage);
  }

  // Date range is valid, proceed with generation
  return trialBalanceService.generateTrialBalance(dateRange);
}

// Example 6: Error handling with retry logic
export async function generateTrialBalanceWithErrorHandling() {
  const maxAttempts = 3;
  let attempt = 1;

  while (attempt <= maxAttempts) {
    try {
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const result = await trialBalanceService.generateTrialBalance(dateRange);
      console.log(`Trial balance generated successfully on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        console.error('All attempts failed, giving up');
        throw error;
      }
      
      // Wait before retrying (exponential backoff is already handled by the service)
      attempt++;
    }
  }
}

// Example 7: React Hook usage pattern
export function useTrialBalanceExample() {
  // This would typically be in a React component or custom hook
  
  const generateReport = async (startDate: Date, endDate: Date) => {
    try {
      // Set loading state
      console.log('Loading trial balance...');
      
      const dateRange = { startDate, endDate };
      const result = await trialBalanceService.generateTrialBalance(dateRange);
      
      // Update state with results
      console.log('Trial balance loaded successfully');
      return result;
    } catch (error) {
      // Handle error state
      console.error('Error loading trial balance:', error);
      throw error;
    }
  };

  const drillDownAccount = async (accountId: string, dateRange: { startDate: Date; endDate: Date }) => {
    try {
      console.log(`Loading transactions for account ${accountId}...`);
      
      const transactions = await trialBalanceService.getAccountTransactions(accountId, dateRange);
      
      console.log('Account transactions loaded successfully');
      return transactions;
    } catch (error) {
      console.error('Error loading account transactions:', error);
      throw error;
    }
  };

  return {
    generateReport,
    drillDownAccount,
    validateDateRange: trialBalanceService.validateDateRange,
    getValidationError: trialBalanceService.getDateRangeValidationError,
  };
}

// Example 8: Utility functions for common date ranges
export const getCommonDateRanges = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return {
    thisMonth: {
      startDate: new Date(currentYear, currentMonth, 1),
      endDate: new Date(currentYear, currentMonth + 1, 0),
    },
    lastMonth: {
      startDate: new Date(currentYear, currentMonth - 1, 1),
      endDate: new Date(currentYear, currentMonth, 0),
    },
    thisQuarter: {
      startDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1),
      endDate: new Date(currentYear, Math.floor(currentMonth / 3) * 3 + 3, 0),
    },
    thisYear: {
      startDate: new Date(currentYear, 0, 1),
      endDate: new Date(currentYear, 11, 31),
    },
    lastYear: {
      startDate: new Date(currentYear - 1, 0, 1),
      endDate: new Date(currentYear - 1, 11, 31),
    },
  };
};

// Example usage in a component:
/*
import { generateBasicTrialBalance, getCommonDateRanges } from '@/services/trialBalanceService.example';

const TrialBalanceComponent = () => {
  const [trialBalance, setTrialBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateBasicTrialBalance();
      setTrialBalance(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const commonRanges = getCommonDateRanges();

  return (
    <div>
      <button onClick={handleGenerateReport} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Trial Balance'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {trialBalance && (
        <div>
          <h3>Trial Balance Results</h3>
          <p>Final Balance: {trialBalance.finalBalance}</p>
          <p>Total Transactions: {trialBalance.totalTransactions}</p>
          <p>Calculation: {trialBalance.calculationExpression}</p>
        </div>
      )}
    </div>
  );
};
*/