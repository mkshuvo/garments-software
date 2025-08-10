import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AccountCategorySection from '../../../src/components/trial-balance/AccountCategorySection';
import { AccountCategory, AccountCategoryType } from '../../../src/types/trialBalance';

// Mock theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockAccountCategory: AccountCategory = {
  name: AccountCategoryType.ASSETS,
  subtotal: 15000,
  accounts: [
    {
      accountId: '1',
      accountName: 'Cash Account',
      categoryDescription: 'Current Assets',
      particulars: 'Daily cash transactions',
      debitAmount: -5000,
      creditAmount: 10000,
      netBalance: 5000,
      transactionCount: 25
    },
    {
      accountId: '2',
      accountName: 'Bank Account',
      categoryDescription: 'Current Assets',
      particulars: 'Bank deposits and withdrawals',
      debitAmount: -2000,
      creditAmount: 12000,
      netBalance: 10000,
      transactionCount: 15
    },
    {
      accountId: '3',
      accountName: 'Zero Balance Account',
      categoryDescription: 'Current Assets',
      particulars: 'No transactions',
      debitAmount: 0,
      creditAmount: 0,
      netBalance: 0,
      transactionCount: 0
    }
  ]
};

const mockLiabilitiesCategory: AccountCategory = {
  name: AccountCategoryType.LIABILITIES,
  subtotal: -8000,
  accounts: [
    {
      accountId: '4',
      accountName: 'Accounts Payable',
      categoryDescription: 'Current Liabilities',
      particulars: 'Supplier payments',
      debitAmount: 2000,
      creditAmount: -10000,
      netBalance: -8000,
      transactionCount: 12
    }
  ]
};

describe('AccountCategorySection', () => {
  const mockOnAccountClick = jest.fn();

  beforeEach(() => {
    mockOnAccountClick.mockClear();
  });

  it('renders category header with correct information', () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('2 accounts')).toBeInTheDocument();
    expect(screen.getAllByText('15,000')).toHaveLength(2); // Appears in header subtotal and footer
  });

  it('displays correct category icon and color for different categories', () => {
    const { rerender } = render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Assets')).toBeInTheDocument();

    rerender(
      <TestWrapper>
        <AccountCategorySection
          category={mockLiabilitiesCategory}
          onAccountClick={mockOnAccountClick}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Liabilities')).toBeInTheDocument();
  });

  it('expands and collapses when header is clicked', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={false}
        />
      </TestWrapper>
    );

    // Wait for initial render to complete
    await waitFor(() => {
      expect(screen.getByText('Assets')).toBeInTheDocument();
    });

    // Initially collapsed - accounts table should not be visible
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Assets'));

    // Wait for expansion animation
    await waitFor(() => {
      expect(screen.getByText('Cash Account')).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(screen.getByText('Assets'));

    // Wait for collapse animation
    await waitFor(() => {
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  it('displays accounts table with correct data when expanded', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Cash Account')).toBeInTheDocument();
      expect(screen.getByText('Bank Account')).toBeInTheDocument();
      expect(screen.getAllByText('Current Assets')).toHaveLength(2); // Appears twice in the table
      expect(screen.getByText('Daily cash transactions')).toBeInTheDocument();
    });

    // Check formatted amounts
    expect(screen.getByText('(5,000)')).toBeInTheDocument(); // Debit amount for Cash Account
    expect(screen.getAllByText('10,000')).toHaveLength(2); // Credit amount for Cash Account and Bank Account
    expect(screen.getByText('5,000')).toBeInTheDocument(); // Net balance for Cash Account
  });

  it('calls onAccountClick when account row is clicked', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Cash Account')).toBeInTheDocument();
    });

    // Click on the Cash Account row
    fireEvent.click(screen.getByText('Cash Account'));

    expect(mockOnAccountClick).toHaveBeenCalledWith('1', 'Cash Account');
  });

  it('filters out zero balance accounts by default', () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    // Should show 2 accounts (excluding zero balance)
    expect(screen.getByText('2 accounts')).toBeInTheDocument();
  });

  it('shows zero balance accounts when showZeroBalances is true', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          showZeroBalances={true}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    // Should show 3 accounts (including zero balance)
    expect(screen.getByText('3 accounts')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Zero Balance Account')).toBeInTheDocument();
    });
  });

  it('displays correct amount formatting for negative balances', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockLiabilitiesCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
    });

    // Check negative balance formatting - appears in multiple places (subtotal and net balance)
    expect(screen.getAllByText('(8,000)')).toHaveLength(3); // Subtotal, net balance, and category total
  });

  it('displays transaction count chips correctly', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // Transaction count for Cash Account
      expect(screen.getByText('15')).toBeInTheDocument(); // Transaction count for Bank Account
    });
  });

  it('displays category summary footer when expanded', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Assets: 2 accounts')).toBeInTheDocument();
      expect(screen.getByText('Category Total:')).toBeInTheDocument();
    });
  });

  it('handles empty category gracefully', () => {
    const emptyCategory: AccountCategory = {
      name: AccountCategoryType.EQUITY,
      subtotal: 0,
      accounts: []
    };

    const { container } = render(
      <TestWrapper>
        <AccountCategorySection
          category={emptyCategory}
          onAccountClick={mockOnAccountClick}
        />
      </TestWrapper>
    );

    // Component should not render anything for empty category
    expect(container.firstChild).toBeNull();
  });

  it('shows empty state message when no non-zero accounts exist', async () => {
    const zeroBalanceCategory: AccountCategory = {
      name: AccountCategoryType.INCOME,
      subtotal: 0,
      accounts: [
        {
          accountId: '5',
          accountName: 'Zero Account',
          categoryDescription: 'Income',
          particulars: 'No transactions',
          debitAmount: 0,
          creditAmount: 0,
          netBalance: 0,
          transactionCount: 0
        }
      ]
    };

    render(
      <TestWrapper>
        <AccountCategorySection
          category={zeroBalanceCategory}
          onAccountClick={mockOnAccountClick}
          showZeroBalances={true}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Zero Account')).toBeInTheDocument();
    });
  });

  it('applies hover effects on account rows', async () => {
    render(
      <TestWrapper>
        <AccountCategorySection
          category={mockAccountCategory}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const cashAccountRow = screen.getByText('Cash Account').closest('tr');
      expect(cashAccountRow).toHaveStyle('cursor: pointer');
    });
  });

  it('truncates long particulars text with ellipsis', async () => {
    const categoryWithLongParticulars: AccountCategory = {
      name: AccountCategoryType.EXPENSES,
      subtotal: 1000,
      accounts: [
        {
          accountId: '6',
          accountName: 'Office Supplies',
          categoryDescription: 'Operating Expenses',
          particulars: 'This is a very long particulars description that should be truncated with ellipsis when displayed in the table cell to maintain proper layout and readability',
          debitAmount: -1000,
          creditAmount: 0,
          netBalance: -1000,
          transactionCount: 5
        }
      ]
    };

    render(
      <TestWrapper>
        <AccountCategorySection
          category={categoryWithLongParticulars}
          onAccountClick={mockOnAccountClick}
          defaultExpanded={true}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const particularsCell = screen.getByText(/This is a very long particulars/);
      expect(particularsCell).toHaveStyle('text-overflow: ellipsis');
      expect(particularsCell).toHaveStyle('overflow: hidden');
    });
  });
});