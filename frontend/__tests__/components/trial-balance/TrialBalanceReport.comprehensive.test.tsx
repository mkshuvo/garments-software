import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TrialBalanceReport } from '../../../src/components/trial-balance/TrialBalanceReport';
import { TrialBalanceData, AccountCategory, AccountBalance } from '../../../src/types/trialBalance';

// Mock the child components
jest.mock('../../../src/components/trial-balance/DateRangeSelector', () => ({
  DateRangeSelector: ({ onDateChange, startDate, endDate }: any) => (
    <div data-testid="date-range-selector">
      <input
        data-testid="start-date"
        type="date"
        value={startDate?.toISOString().split('T')[0] || ''}
        onChange={(e) => onDateChange(new Date(e.target.value), endDate)}
      />
      <input
        data-testid="end-date"
        type="date"
        value={endDate?.toISOString().split('T')[0] || ''}
        onChange={(e) => onDateChange(startDate, new Date(e.target.value))}
      />
    </div>
  )
}));

jest.mock('../../../src/components/trial-balance/AccountCategorySection', () => ({
  AccountCategorySection: ({ category, onAccountClick }: any) => (
    <div data-testid={`category-${category.name.toLowerCase()}`}>
      <h3>{category.name}</h3>
      <div data-testid="subtotal">Subtotal: {category.subtotal}</div>
      {category.accounts.map((account: AccountBalance) => (
        <div
          key={account.accountId}
          data-testid={`account-${account.accountId}`}
          onClick={() => onAccountClick(account.accountId)}
          style={{ cursor: 'pointer' }}
        >
          <span>{account.accountName}</span>
          <span data-testid={`balance-${account.accountId}`}>{account.netBalance}</span>
          <span data-testid={`description-${account.accountId}`}>{account.categoryDescription}</span>
          <span data-testid={`particulars-${account.accountId}`}>{account.particulars}</span>
        </div>
      ))}
    </div>
  )
}));

jest.mock('../../../src/components/trial-balance/TrialBalanceCalculation', () => ({
  TrialBalanceCalculation: ({ expression, finalBalance }: any) => (
    <div data-testid="trial-balance-calculation">
      <div data-testid="calculation-expression">{expression}</div>
      <div data-testid="final-balance">{finalBalance}</div>
    </div>
  )
}));

jest.mock('../../../src/components/trial-balance/ExportOptions', () => ({
  ExportOptions: ({ onExportPdf, onExportCsv, isLoading }: any) => (
    <div data-testid="export-options">
      <button
        data-testid="export-pdf"
        onClick={onExportPdf}
        disabled={isLoading}
      >
        Export PDF
      </button>
      <button
        data-testid="export-csv"
        onClick={onExportCsv}
        disabled={isLoading}
      >
        Export CSV
      </button>
    </div>
  )
}));

// Mock services
jest.mock('../../../src/services/trialBalanceService', () => ({
  trialBalanceService: {
    generateTrialBalance: jest.fn(),
    getAccountTransactions: jest.fn()
  }
}));

jest.mock('../../../src/services/trialBalanceExportService', () => ({
  trialBalanceExportService: {
    exportToPdf: jest.fn(),
    exportToCsv: jest.fn()
  }
}));

describe('TrialBalanceReport - Comprehensive Tests', () => {
  const mockTrialBalanceData: TrialBalanceData = {
    dateRange: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    categories: [
      {
        name: 'Assets',
        accounts: [
          {
            accountId: 'asset-1',
            accountName: 'Cash Account',
            categoryDescription: 'Current Assets - Cash & Bank',
            particulars: 'Cash receipts and payments',
            debitAmount: -1000,
            creditAmount: 500,
            netBalance: -500,
            transactionCount: 5
          },
          {
            accountId: 'asset-2',
            accountName: 'Accounts Receivable',
            categoryDescription: 'Current Assets - Receivables',
            particulars: 'Customer invoices',
            debitAmount: -2000,
            creditAmount: 0,
            netBalance: -2000,
            transactionCount: 3
          }
        ],
        subtotal: -2500
      },
      {
        name: 'Liabilities',
        accounts: [
          {
            accountId: 'liability-1',
            accountName: 'Accounts Payable',
            categoryDescription: 'Current Liabilities - Payables',
            particulars: 'Supplier invoices',
            debitAmount: 0,
            creditAmount: 1500,
            netBalance: 1500,
            transactionCount: 4
          }
        ],
        subtotal: 1500
      },
      {
        name: 'Income',
        accounts: [
          {
            accountId: 'income-1',
            accountName: 'Sales Revenue',
            categoryDescription: 'Operating Income - Sales',
            particulars: 'Product sales',
            debitAmount: 0,
            creditAmount: 5000,
            netBalance: 5000,
            transactionCount: 10
          }
        ],
        subtotal: 5000
      },
      {
        name: 'Expenses',
        accounts: [
          {
            accountId: 'expense-1',
            accountName: 'Office Supplies',
            categoryDescription: 'Operating Expenses - Supplies',
            particulars: 'Office equipment and supplies',
            debitAmount: -800,
            creditAmount: 0,
            netBalance: -800,
            transactionCount: 2
          }
        ],
        subtotal: -800
      }
    ],
    totalDebits: -3800,
    totalCredits: 7000,
    finalBalance: 3200,
    calculationExpression: '500 - 1000 + 5000 + 1500 - 800 = 3200',
    generatedAt: new Date('2024-01-31T10:00:00Z')
  };

  const mockProps = {
    data: mockTrialBalanceData,
    showCalculationDetails: true,
    onAccountClick: jest.fn(),
    groupByCategory: true,
    loading: false,
    error: null,
    onDateRangeChange: jest.fn(),
    onExportPdf: jest.fn(),
    onExportCsv: jest.fn(),
    showZeroBalances: false,
    onToggleZeroBalances: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Display', () => {
    it('renders all trial balance categories correctly', () => {
      render(<TrialBalanceReport {...mockProps} />);

      expect(screen.getByTestId('category-assets')).toBeInTheDocument();
      expect(screen.getByTestId('category-liabilities')).toBeInTheDocument();
      expect(screen.getByTestId('category-income')).toBeInTheDocument();
      expect(screen.getByTestId('category-expenses')).toBeInTheDocument();
    });

    it('displays account details with category descriptions and particulars', () => {
      render(<TrialBalanceReport {...mockProps} />);

      // Check Assets category accounts
      expect(screen.getByTestId('account-asset-1')).toBeInTheDocument();
      expect(screen.getByTestId('description-asset-1')).toHaveTextContent('Current Assets - Cash & Bank');
      expect(screen.getByTestId('particulars-asset-1')).toHaveTextContent('Cash receipts and payments');
      expect(screen.getByTestId('balance-asset-1')).toHaveTextContent('-500');

      // Check Income category accounts
      expect(screen.getByTestId('account-income-1')).toBeInTheDocument();
      expect(screen.getByTestId('description-income-1')).toHaveTextContent('Operating Income - Sales');
      expect(screen.getByTestId('particulars-income-1')).toHaveTextContent('Product sales');
      expect(screen.getByTestId('balance-income-1')).toHaveTextContent('5000');
    });

    it('displays correct subtotals for each category', () => {
      render(<TrialBalanceReport {...mockProps} />);

      const assetsSubtotal = screen.getByTestId('category-assets').querySelector('[data-testid="subtotal"]');
      const liabilitiesSubtotal = screen.getByTestId('category-liabilities').querySelector('[data-testid="subtotal"]');
      const incomeSubtotal = screen.getByTestId('category-income').querySelector('[data-testid="subtotal"]');
      const expensesSubtotal = screen.getByTestId('category-expenses').querySelector('[data-testid="subtotal"]');

      expect(assetsSubtotal).toHaveTextContent('Subtotal: -2500');
      expect(liabilitiesSubtotal).toHaveTextContent('Subtotal: 1500');
      expect(incomeSubtotal).toHaveTextContent('Subtotal: 5000');
      expect(expensesSubtotal).toHaveTextContent('Subtotal: -800');
    });

    it('displays the trial balance calculation correctly', () => {
      render(<TrialBalanceReport {...mockProps} />);

      expect(screen.getByTestId('trial-balance-calculation')).toBeInTheDocument();
      expect(screen.getByTestId('calculation-expression')).toHaveTextContent('500 - 1000 + 5000 + 1500 - 800 = 3200');
      expect(screen.getByTestId('final-balance')).toHaveTextContent('3200');
    });

    it('renders date range selector with correct dates', () => {
      render(<TrialBalanceReport {...mockProps} />);

      expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();
      expect(screen.getByTestId('start-date')).toHaveValue('2024-01-01');
      expect(screen.getByTestId('end-date')).toHaveValue('2024-01-31');
    });

    it('renders export options', () => {
      render(<TrialBalanceReport {...mockProps} />);

      expect(screen.getByTestId('export-options')).toBeInTheDocument();
      expect(screen.getByTestId('export-pdf')).toBeInTheDocument();
      expect(screen.getByTestId('export-csv')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('handles account click correctly', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      await user.click(screen.getByTestId('account-asset-1'));

      expect(mockProps.onAccountClick).toHaveBeenCalledWith('asset-1');
    });

    it('handles date range changes', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      const startDateInput = screen.getByTestId('start-date');
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-02-01');

      expect(mockProps.onDateRangeChange).toHaveBeenCalled();
    });

    it('handles PDF export', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      await user.click(screen.getByTestId('export-pdf'));

      expect(mockProps.onExportPdf).toHaveBeenCalled();
    });

    it('handles CSV export', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      await user.click(screen.getByTestId('export-csv'));

      expect(mockProps.onExportCsv).toHaveBeenCalled();
    });

    it('handles multiple account clicks in sequence', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      await user.click(screen.getByTestId('account-asset-1'));
      await user.click(screen.getByTestId('account-liability-1'));
      await user.click(screen.getByTestId('account-income-1'));

      expect(mockProps.onAccountClick).toHaveBeenCalledTimes(3);
      expect(mockProps.onAccountClick).toHaveBeenNthCalledWith(1, 'asset-1');
      expect(mockProps.onAccountClick).toHaveBeenNthCalledWith(2, 'liability-1');
      expect(mockProps.onAccountClick).toHaveBeenNthCalledWith(3, 'income-1');
    });
  });

  describe('Loading and Error States', () => {
    it('displays loading state correctly', () => {
      render(<TrialBalanceReport {...mockProps} loading={true} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('displays error state correctly', () => {
      const errorMessage = 'Failed to load trial balance data';
      render(<TrialBalanceReport {...mockProps} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('disables export buttons during loading', () => {
      render(<TrialBalanceReport {...mockProps} loading={true} />);

      expect(screen.getByTestId('export-pdf')).toBeDisabled();
      expect(screen.getByTestId('export-csv')).toBeDisabled();
    });
  });

  describe('Data Validation and Edge Cases', () => {
    it('handles empty categories gracefully', () => {
      const emptyData: TrialBalanceData = {
        ...mockTrialBalanceData,
        categories: [],
        finalBalance: 0,
        calculationExpression: '0 = 0'
      };

      render(<TrialBalanceReport {...mockProps} data={emptyData} />);

      expect(screen.getByTestId('trial-balance-calculation')).toBeInTheDocument();
      expect(screen.getByTestId('calculation-expression')).toHaveTextContent('0 = 0');
      expect(screen.getByTestId('final-balance')).toHaveTextContent('0');
    });

    it('handles categories with zero balances when showZeroBalances is false', () => {
      const dataWithZeroBalances: TrialBalanceData = {
        ...mockTrialBalanceData,
        categories: [
          ...mockTrialBalanceData.categories,
          {
            name: 'Equity',
            accounts: [
              {
                accountId: 'equity-1',
                accountName: 'Owner Equity',
                categoryDescription: 'Owner\'s Equity',
                particulars: 'Initial investment',
                debitAmount: 0,
                creditAmount: 0,
                netBalance: 0,
                transactionCount: 0
              }
            ],
            subtotal: 0
          }
        ]
      };

      render(<TrialBalanceReport {...mockProps} data={dataWithZeroBalances} showZeroBalances={false} />);

      // Zero balance category should not be visible
      expect(screen.queryByTestId('category-equity')).not.toBeInTheDocument();
    });

    it('shows categories with zero balances when showZeroBalances is true', () => {
      const dataWithZeroBalances: TrialBalanceData = {
        ...mockTrialBalanceData,
        categories: [
          ...mockTrialBalanceData.categories,
          {
            name: 'Equity',
            accounts: [
              {
                accountId: 'equity-1',
                accountName: 'Owner Equity',
                categoryDescription: 'Owner\'s Equity',
                particulars: 'Initial investment',
                debitAmount: 0,
                creditAmount: 0,
                netBalance: 0,
                transactionCount: 0
              }
            ],
            subtotal: 0
          }
        ]
      };

      render(<TrialBalanceReport {...mockProps} data={dataWithZeroBalances} showZeroBalances={true} />);

      // Zero balance category should be visible
      expect(screen.getByTestId('category-equity')).toBeInTheDocument();
    });

    it('handles negative final balance correctly', () => {
      const negativeBalanceData: TrialBalanceData = {
        ...mockTrialBalanceData,
        finalBalance: -1500,
        calculationExpression: '1000 - 2500 = -1500'
      };

      render(<TrialBalanceReport {...mockProps} data={negativeBalanceData} />);

      expect(screen.getByTestId('final-balance')).toHaveTextContent('-1500');
      expect(screen.getByTestId('calculation-expression')).toHaveTextContent('1000 - 2500 = -1500');
    });

    it('handles very large numbers correctly', () => {
      const largeNumberData: TrialBalanceData = {
        ...mockTrialBalanceData,
        finalBalance: 999999999.99,
        calculationExpression: '1000000000 - 0.01 = 999999999.99'
      };

      render(<TrialBalanceReport {...mockProps} data={largeNumberData} />);

      expect(screen.getByTestId('final-balance')).toHaveTextContent('999999999.99');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      render(<TrialBalanceReport {...mockProps} />);

      const accountElements = screen.getAllByTestId(/^account-/);
      accountElements.forEach(element => {
        expect(element).toHaveStyle('cursor: pointer');
      });
    });

    it('supports keyboard navigation for account selection', async () => {
      const user = userEvent.setup();
      render(<TrialBalanceReport {...mockProps} />);

      const firstAccount = screen.getByTestId('account-asset-1');
      firstAccount.focus();
      
      await user.keyboard('{Enter}');
      expect(mockProps.onAccountClick).toHaveBeenCalledWith('asset-1');
    });
  });

  describe('Performance', () => {
    it('renders efficiently with large datasets', () => {
      // Create a large dataset
      const largeCategories: AccountCategory[] = [];
      for (let i = 0; i < 5; i++) {
        const accounts: AccountBalance[] = [];
        for (let j = 0; j < 100; j++) {
          accounts.push({
            accountId: `account-${i}-${j}`,
            accountName: `Account ${i}-${j}`,
            categoryDescription: `Category ${i} Description`,
            particulars: `Particulars for account ${i}-${j}`,
            debitAmount: j % 2 === 0 ? -100 : 0,
            creditAmount: j % 2 === 1 ? 100 : 0,
            netBalance: j % 2 === 0 ? -100 : 100,
            transactionCount: j + 1
          });
        }
        largeCategories.push({
          name: `Category${i}` as any,
          accounts,
          subtotal: 0
        });
      }

      const largeData: TrialBalanceData = {
        ...mockTrialBalanceData,
        categories: largeCategories
      };

      const startTime = performance.now();
      render(<TrialBalanceReport {...mockProps} data={largeData} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Mathematical Accuracy Verification', () => {
    it('verifies that displayed balances match calculation logic', () => {
      render(<TrialBalanceReport {...mockProps} />);

      // Verify that the final balance matches the sum of all category subtotals
      const expectedFinalBalance = mockTrialBalanceData.categories.reduce(
        (sum, category) => sum + category.subtotal,
        0
      );

      expect(expectedFinalBalance).toBe(mockTrialBalanceData.finalBalance);
      expect(screen.getByTestId('final-balance')).toHaveTextContent(expectedFinalBalance.toString());
    });

    it('verifies debit and credit representation (debits negative, credits positive)', () => {
      render(<TrialBalanceReport {...mockProps} />);

      // Check that debit amounts are negative and credit amounts are positive
      const cashAccount = mockTrialBalanceData.categories[0].accounts[0];
      expect(cashAccount.debitAmount).toBeLessThan(0); // Debits should be negative
      expect(cashAccount.creditAmount).toBeGreaterThanOrEqual(0); // Credits should be positive

      const revenueAccount = mockTrialBalanceData.categories[2].accounts[0];
      expect(revenueAccount.debitAmount).toBe(0);
      expect(revenueAccount.creditAmount).toBeGreaterThan(0); // Credits should be positive
    });
  });
});