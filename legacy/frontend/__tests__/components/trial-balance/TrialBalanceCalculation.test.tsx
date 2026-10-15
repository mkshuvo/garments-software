import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TrialBalanceCalculation } from '../../../src/components/trial-balance/TrialBalanceCalculation';
import { TrialBalanceData, AccountCategoryType } from '../../../src/types/trialBalance';

const theme = createTheme();

const mockTrialBalanceData: TrialBalanceData = {
  dateRange: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
  },
  categories: [
    {
      name: AccountCategoryType.ASSETS,
      accounts: [
        {
          accountId: '1',
          accountName: 'Cash',
          categoryDescription: 'Current Assets',
          particulars: 'Cash on hand',
          debitAmount: -1000,
          creditAmount: 0,
          netBalance: -1000,
          transactionCount: 5
        }
      ],
      subtotal: -1000
    },
    {
      name: AccountCategoryType.LIABILITIES,
      accounts: [
        {
          accountId: '2',
          accountName: 'Accounts Payable',
          categoryDescription: 'Current Liabilities',
          particulars: 'Supplier payments',
          debitAmount: 0,
          creditAmount: 1100,
          netBalance: 1100,
          transactionCount: 3
        }
      ],
      subtotal: 1100
    },
    {
      name: AccountCategoryType.INCOME,
      accounts: [
        {
          accountId: '3',
          accountName: 'Sales Revenue',
          categoryDescription: 'Operating Income',
          particulars: 'Product sales',
          debitAmount: 0,
          creditAmount: 11000,
          netBalance: 11000,
          transactionCount: 15
        }
      ],
      subtotal: 11000
    },
    {
      name: AccountCategoryType.EXPENSES,
      accounts: [
        {
          accountId: '4',
          accountName: 'Office Supplies',
          categoryDescription: 'Operating Expenses',
          particulars: 'Office materials',
          debitAmount: -1000,
          creditAmount: 0,
          netBalance: -1000,
          transactionCount: 2
        }
      ],
      subtotal: -1000
    }
  ],
  totalDebits: -2000,
  totalCredits: 12100,
  finalBalance: 9900,
  calculationExpression: '1000 - 1100 + 11000 - 1000 = 9900',
  generatedAt: new Date('2024-01-31T10:00:00Z'),
  totalTransactions: 25
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('TrialBalanceCalculation - Core Functionality', () => {
  describe('Standard Variant', () => {
    it('renders the component with title', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      expect(screen.getByText('Trial Balance Calculation')).toBeInTheDocument();
    });

    it('displays the calculation expression with proper formatting', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      // Check that numbers are formatted with commas
      expect(screen.getAllByText('1,000')).toHaveLength(2); // Appears twice in calculation
      expect(screen.getByText('1,100')).toBeInTheDocument();
      expect(screen.getByText('11,000')).toBeInTheDocument();
      expect(screen.getByText('9,900')).toBeInTheDocument();
    });

    it('displays mathematical operators with proper styling', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      // Check for operators in the calculation
      const minusOperators = screen.getAllByText('-');
      const plusOperators = screen.getAllByText('+');
      const equalsOperator = screen.getByText('=');
      
      expect(minusOperators.length).toBeGreaterThan(0);
      expect(plusOperators.length).toBeGreaterThan(0);
      expect(equalsOperator).toBeInTheDocument();
    });

    it('displays the final balance with correct formatting', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      expect(screen.getByText('Final Balance: 9,900')).toBeInTheDocument();
    });

    it('shows copy and expand buttons', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      expect(screen.getByLabelText('Copy calculation to clipboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Show detailed breakdown')).toBeInTheDocument();
    });

    it('shows detailed breakdown content when expanded', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      // The detailed breakdown content should be in the DOM but collapsed
      expect(screen.getByText('Detailed Breakdown by Category')).toBeInTheDocument();
      expect(screen.getByText('Assets Total')).toBeInTheDocument();
      expect(screen.getByText('Liabilities Total')).toBeInTheDocument();
      expect(screen.getByText('Income Total')).toBeInTheDocument();
      expect(screen.getByText('Expenses Total')).toBeInTheDocument();
      expect(screen.getByText('Total Transactions Processed: 25')).toBeInTheDocument();
    });
  });

  describe('Compact Variant', () => {
    it('renders in compact mode without full header', () => {
      renderWithTheme(
        <TrialBalanceCalculation 
          data={mockTrialBalanceData} 
          variant="compact" 
        />
      );
      
      // Should not show the full header in compact mode
      expect(screen.queryByText('Trial Balance Calculation')).not.toBeInTheDocument();
      
      // Should still show the calculation
      expect(screen.getAllByText('1,000')).toHaveLength(2);
      expect(screen.getByText('9,900')).toBeInTheDocument();
    });

    it('has copy button in compact mode', () => {
      renderWithTheme(
        <TrialBalanceCalculation 
          data={mockTrialBalanceData} 
          variant="compact" 
        />
      );
      
      expect(screen.getByLabelText('Copy calculation')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero balance correctly', () => {
      const zeroBalanceData = {
        ...mockTrialBalanceData,
        finalBalance: 0,
        calculationExpression: '1000 - 1000 = 0'
      };
      
      renderWithTheme(<TrialBalanceCalculation data={zeroBalanceData} />);
      
      expect(screen.getByText('Final Balance: 0')).toBeInTheDocument();
    });

    it('handles negative final balance correctly', () => {
      const negativeBalanceData = {
        ...mockTrialBalanceData,
        finalBalance: -500,
        calculationExpression: '1000 - 1500 = -500'
      };
      
      renderWithTheme(<TrialBalanceCalculation data={negativeBalanceData} />);
      
      expect(screen.getByText('Final Balance: -500')).toBeInTheDocument();
    });

    it('handles empty categories gracefully', () => {
      const emptyData = {
        ...mockTrialBalanceData,
        categories: [],
        totalTransactions: 0
      };
      
      renderWithTheme(<TrialBalanceCalculation data={emptyData} />);
      
      expect(screen.getByText('Trial Balance Calculation')).toBeInTheDocument();
      // Should not show expand button when no categories
      expect(screen.queryByLabelText('Show detailed breakdown')).not.toBeInTheDocument();
    });

    it('disables detailed breakdown when showDetailedBreakdown is false', () => {
      renderWithTheme(
        <TrialBalanceCalculation 
          data={mockTrialBalanceData} 
          showDetailedBreakdown={false}
        />
      );
      
      expect(screen.queryByLabelText('Show detailed breakdown')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      expect(screen.getByLabelText('Copy calculation to clipboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Show detailed breakdown')).toBeInTheDocument();
    });

    it('uses semantic HTML elements', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      // Check for proper heading
      expect(screen.getByRole('heading', { name: 'Trial Balance Calculation' })).toBeInTheDocument();
      
      // Check for buttons
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });
  });

  describe('Visual Formatting', () => {
    it('formats large numbers with commas', () => {
      const largeNumberData = {
        ...mockTrialBalanceData,
        finalBalance: 1234567,
        calculationExpression: '1234567 = 1234567'
      };
      
      renderWithTheme(<TrialBalanceCalculation data={largeNumberData} />);
      
      expect(screen.getByText('Final Balance: 1,234,567')).toBeInTheDocument();
    });

    it('displays calculation icon', () => {
      renderWithTheme(<TrialBalanceCalculation data={mockTrialBalanceData} />);
      
      expect(screen.getByTestId('CalculateIcon')).toBeInTheDocument();
    });
  });
});