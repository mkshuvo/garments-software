import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TrialBalancePage } from '../../src/app/admin/accounting/trial-balance/page';
import { trialBalanceService } from '../../src/services/trialBalanceService';
import { trialBalanceExportService } from '../../src/services/trialBalanceExportService';

// Mock the services
jest.mock('../../src/services/trialBalanceService');
jest.mock('../../src/services/trialBalanceExportService');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/admin/accounting/trial-balance',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authentication context
jest.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'admin@test.com',
      role: 'Admin',
      permissions: ['trial-balance:read', 'trial-balance:export']
    },
    isAuthenticated: true,
    loading: false
  })
}));

const mockTrialBalanceService = trialBalanceService as jest.Mocked<typeof trialBalanceService>;
const mockExportService = trialBalanceExportService as jest.Mocked<typeof trialBalanceExportService>;

describe('Trial Balance End-to-End Workflow', () => {
  const mockTrialBalanceData = {
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
            particulars: 'Daily cash transactions',
            debitAmount: -1000,
            creditAmount: 500,
            netBalance: -500,
            transactionCount: 5
          }
        ],
        subtotal: -500
      },
      {
        name: 'Income',
        accounts: [
          {
            accountId: 'income-1',
            accountName: 'Sales Revenue',
            categoryDescription: 'Operating Income - Sales',
            particulars: 'Product and service sales',
            debitAmount: 0,
            creditAmount: 5000,
            netBalance: 5000,
            transactionCount: 10
          }
        ],
        subtotal: 5000
      }
    ],
    totalDebits: -1000,
    totalCredits: 5500,
    finalBalance: 4500,
    calculationExpression: '500 - 1000 + 5000 = 4500',
    generatedAt: new Date('2024-01-31T10:00:00Z')
  };

  const mockAccountTransactions = [
    {
      accountId: 'asset-1',
      accountName: 'Cash Account',
      accountType: 'Asset',
      transactionDate: new Date('2024-01-15'),
      journalType: 'CashReceipt',
      debitAmount: 0,
      creditAmount: 500,
      description: 'Cash receipt from customer',
      referenceNumber: 'CR-001'
    },
    {
      accountId: 'asset-1',
      accountName: 'Cash Account',
      accountType: 'Asset',
      transactionDate: new Date('2024-01-20'),
      journalType: 'CashPayment',
      debitAmount: 1000,
      creditAmount: 0,
      description: 'Cash payment to supplier',
      referenceNumber: 'CP-001'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockTrialBalanceService.generateTrialBalance.mockResolvedValue(mockTrialBalanceData);
    mockTrialBalanceService.getAccountTransactions.mockResolvedValue(mockAccountTransactions);
    mockExportService.exportToPdf.mockResolvedValue(new Blob(['PDF content'], { type: 'application/pdf' }));
    mockExportService.exportToCsv.mockResolvedValue(new Blob(['CSV content'], { type: 'text/csv' }));
  });

  describe('Complete Trial Balance Generation Workflow', () => {
    it('completes full workflow: date selection → generation → display → drill-down → export', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Step 1: Initial page load
      expect(screen.getByText(/trial balance report/i)).toBeInTheDocument();
      expect(screen.getByTestId('date-range-selector')).toBeInTheDocument();

      // Step 2: Select date range
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-01');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-31');

      // Step 3: Generate trial balance
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      // Verify loading state
      expect(screen.getByText(/generating trial balance/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledWith({
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          groupByCategory: true,
          includeZeroBalances: false
        });
      });

      // Step 4: Verify trial balance display
      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
        expect(screen.getByText('Income')).toBeInTheDocument();
        expect(screen.getByText('Cash Account')).toBeInTheDocument();
        expect(screen.getByText('Sales Revenue')).toBeInTheDocument();
      });

      // Verify calculation display
      expect(screen.getByText(/500 - 1000 \+ 5000 = 4500/)).toBeInTheDocument();
      expect(screen.getByText('Final Balance: 4500')).toBeInTheDocument();

      // Step 5: Account drill-down
      const cashAccountRow = screen.getByText('Cash Account').closest('[data-testid*="account-"]');
      await user.click(cashAccountRow!);

      // Verify drill-down modal opens
      await waitFor(() => {
        expect(screen.getByText(/account transactions/i)).toBeInTheDocument();
        expect(screen.getByText('Cash receipt from customer')).toBeInTheDocument();
        expect(screen.getByText('Cash payment to supplier')).toBeInTheDocument();
      });

      // Verify transaction details
      expect(screen.getByText('CR-001')).toBeInTheDocument();
      expect(screen.getByText('CP-001')).toBeInTheDocument();

      // Close drill-down modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Step 6: Export to PDF
      const exportPdfButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportPdfButton);

      await waitFor(() => {
        expect(mockExportService.exportToPdf).toHaveBeenCalledWith(
          mockTrialBalanceData,
          expect.objectContaining({
            filename: expect.stringContaining('trial-balance'),
            includeCalculationDetails: true
          })
        );
      });

      // Step 7: Export to CSV
      const exportCsvButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportCsvButton);

      await waitFor(() => {
        expect(mockExportService.exportToCsv).toHaveBeenCalledWith(
          mockTrialBalanceData,
          expect.objectContaining({
            filename: expect.stringContaining('trial-balance'),
            includeCalculationDetails: true
          })
        );
      });

      // Verify success notifications
      expect(screen.getByText(/pdf exported successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/csv exported successfully/i)).toBeInTheDocument();
    });

    it('handles error scenarios gracefully throughout the workflow', async () => {
      const user = userEvent.setup();
      
      // Mock service to return error
      mockTrialBalanceService.generateTrialBalance.mockRejectedValue(
        new Error('Failed to generate trial balance')
      );

      render(<TrialBalancePage />);

      // Attempt to generate trial balance
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText(/failed to generate trial balance/i)).toBeInTheDocument();
      });

      // Verify retry functionality
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Mock successful retry
      mockTrialBalanceService.generateTrialBalance.mockResolvedValue(mockTrialBalanceData);
      await user.click(retryButton);

      // Verify successful retry
      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });
    });

    it('validates date range inputs and provides feedback', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Test invalid date range (end date before start date)
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-01-31');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-01');

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      // Verify validation error
      expect(screen.getByText(/start date must not be later than end date/i)).toBeInTheDocument();
      expect(generateButton).toBeDisabled();

      // Fix date range
      await user.clear(endDateInput);
      await user.type(endDateInput, '2024-01-31');

      // Verify validation passes
      await waitFor(() => {
        expect(screen.queryByText(/start date must not be later than end date/i)).not.toBeInTheDocument();
        expect(generateButton).not.toBeDisabled();
      });
    });

    it('handles large datasets efficiently', async () => {
      const user = userEvent.setup();
      
      // Create large dataset
      const largeDataset = {
        ...mockTrialBalanceData,
        categories: Array.from({ length: 5 }, (_, categoryIndex) => ({
          name: `Category${categoryIndex}` as any,
          accounts: Array.from({ length: 100 }, (_, accountIndex) => ({
            accountId: `account-${categoryIndex}-${accountIndex}`,
            accountName: `Account ${categoryIndex}-${accountIndex}`,
            categoryDescription: `Category ${categoryIndex} Description`,
            particulars: `Particulars for account ${categoryIndex}-${accountIndex}`,
            debitAmount: accountIndex % 2 === 0 ? -100 : 0,
            creditAmount: accountIndex % 2 === 1 ? 100 : 0,
            netBalance: accountIndex % 2 === 0 ? -100 : 100,
            transactionCount: accountIndex + 1
          })),
          subtotal: 0
        }))
      };

      mockTrialBalanceService.generateTrialBalance.mockResolvedValue(largeDataset);

      render(<TrialBalancePage />);

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      
      // Measure performance
      const startTime = performance.now();
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Category0')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 2 seconds)
      expect(renderTime).toBeLessThan(2000);

      // Verify virtual scrolling or pagination is working
      // (This would depend on the actual implementation)
      const accountElements = screen.getAllByTestId(/^account-/);
      expect(accountElements.length).toBeLessThanOrEqual(50); // Should not render all 500 accounts at once
    });

    it('maintains state consistency during user interactions', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Generate initial report
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });

      // Toggle zero balances option
      const zeroBalancesToggle = screen.getByLabelText(/show zero balances/i);
      await user.click(zeroBalancesToggle);

      // Verify state change
      expect(zeroBalancesToggle).toBeChecked();

      // Change date range
      const startDateInput = screen.getByLabelText(/start date/i);
      await user.clear(startDateInput);
      await user.type(startDateInput, '2024-02-01');

      // Generate new report
      await user.click(generateButton);

      // Verify that zero balances toggle state is maintained
      expect(zeroBalancesToggle).toBeChecked();

      // Verify new API call with correct parameters
      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenLastCalledWith({
          startDate: new Date('2024-02-01'),
          endDate: expect.any(Date),
          groupByCategory: true,
          includeZeroBalances: true // Should maintain the toggle state
        });
      });
    });

    it('supports keyboard navigation throughout the workflow', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Navigate using Tab key
      await user.tab(); // Focus on start date
      expect(screen.getByLabelText(/start date/i)).toHaveFocus();

      await user.tab(); // Focus on end date
      expect(screen.getByLabelText(/end date/i)).toHaveFocus();

      await user.tab(); // Focus on generate button
      expect(screen.getByRole('button', { name: /generate report/i })).toHaveFocus();

      // Generate report using Enter key
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });

      // Navigate to first account using Tab
      await user.tab();
      const firstAccount = screen.getByText('Cash Account').closest('[data-testid*="account-"]');
      expect(firstAccount).toHaveFocus();

      // Open drill-down using Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/account transactions/i)).toBeInTheDocument();
      });

      // Close modal using Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText(/account transactions/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Performance Tests', () => {
    it('completes full workflow within performance benchmarks', async () => {
      const user = userEvent.setup();
      
      // Mock realistic response times
      mockTrialBalanceService.generateTrialBalance.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTrialBalanceData), 100))
      );

      render(<TrialBalancePage />);

      const startTime = performance.now();

      // Complete workflow
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within 5 seconds (including 100ms mock delay)
      expect(totalTime).toBeLessThan(5000);
    });

    it('handles concurrent user actions without race conditions', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Simulate rapid user interactions
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      
      // Click generate multiple times rapidly
      await user.click(generateButton);
      await user.click(generateButton);
      await user.click(generateButton);

      // Should only make one API call (debounced or prevented)
      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('maintains accessibility standards throughout the workflow', async () => {
      const user = userEvent.setup();
      render(<TrialBalancePage />);

      // Check initial accessibility
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();

      // Generate report
      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });

      // Check that all interactive elements have proper roles and labels
      const accountElements = screen.getAllByRole('button');
      accountElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });

      // Check that tables have proper headers
      const tables = screen.getAllByRole('table');
      tables.forEach(table => {
        expect(table).toHaveAttribute('aria-label');
      });

      // Check that modals have proper focus management
      const cashAccountRow = screen.getByText('Cash Account').closest('[data-testid*="account-"]');
      await user.click(cashAccountRow!);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        expect(modal).toHaveAttribute('aria-labelledby');
        expect(modal).toHaveAttribute('aria-describedby');
      });
    });
  });
});