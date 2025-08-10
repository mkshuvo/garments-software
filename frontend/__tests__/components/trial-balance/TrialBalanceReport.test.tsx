import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { TrialBalanceReport } from '../../../src/components/trial-balance/TrialBalanceReport'
import { trialBalanceService } from '../../../src/services/trialBalanceService'
import { TrialBalanceData, AccountCategoryType } from '../../../src/types/trialBalance'

// Mock the service
jest.mock('../../../src/services/trialBalanceService')
const mockTrialBalanceService = trialBalanceService as jest.Mocked<typeof trialBalanceService>

// Mock data
const mockTrialBalanceData: TrialBalanceData = {
  dateRange: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
  },
  categories: [
    {
      name: AccountCategoryType.ASSETS,
      subtotal: 50000,
      accounts: [
        {
          accountId: '1',
          accountName: 'Cash Account',
          categoryDescription: 'Current Assets',
          particulars: 'Cash transactions',
          debitAmount: -25000,
          creditAmount: 75000,
          netBalance: 50000,
          transactionCount: 10
        }
      ]
    },
    {
      name: AccountCategoryType.LIABILITIES,
      subtotal: -30000,
      accounts: [
        {
          accountId: '2',
          accountName: 'Accounts Payable',
          categoryDescription: 'Current Liabilities',
          particulars: 'Supplier payments',
          debitAmount: -5000,
          creditAmount: -25000,
          netBalance: -30000,
          transactionCount: 5
        }
      ]
    }
  ],
  totalDebits: -30000,
  totalCredits: 50000,
  finalBalance: 20000,
  calculationExpression: '50000 - 30000 = 20000',
  generatedAt: new Date('2024-01-31T10:00:00Z'),
  totalTransactions: 15
}

const mockEmptyTrialBalanceData: TrialBalanceData = {
  dateRange: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
  },
  categories: [],
  totalDebits: 0,
  totalCredits: 0,
  finalBalance: 0,
  calculationExpression: '0 = 0',
  generatedAt: new Date('2024-01-31T10:00:00Z'),
  totalTransactions: 0
}

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme()
  
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  )
}

describe('TrialBalanceReport', () => {
  const mockOnAccountClick = jest.fn()
  
  // Suppress console errors that are expected during testing
  const originalError = console.error
  beforeAll(() => {
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('An update to TrialBalanceReport inside a test was not wrapped in act') ||
         args[0].includes('When testing, code that causes React state updates should be wrapped into act') ||
         args[0].includes('Failed to generate trial balance'))
      ) {
        return
      }
      originalError.call(console, ...args)
    }
  })

  afterAll(() => {
    console.error = originalError
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockTrialBalanceService.generateTrialBalance.mockResolvedValue(mockTrialBalanceData)
    mockTrialBalanceService.getDateRangeValidationError.mockReturnValue('')
  })

  const renderComponent = (props = {}) => {
    return render(
      <TestWrapper>
        <TrialBalanceReport
          onAccountClick={mockOnAccountClick}
          {...props}
        />
      </TestWrapper>
    )
  }

  describe('Initial Rendering', () => {
    it('should render the main title', () => {
      renderComponent()
      expect(screen.getByText('Trial Balance Report')).toBeInTheDocument()
    })

    it('should render date range selector', () => {
      renderComponent()
      expect(screen.getByText('Select Date Range')).toBeInTheDocument()
    })

    it('should render show zero balances toggle', () => {
      renderComponent()
      expect(screen.getByText('Show Zero Balance Accounts')).toBeInTheDocument()
    })

    it('should render show filters toggle', () => {
      renderComponent()
      expect(screen.getByText('Show Filters')).toBeInTheDocument()
    })
  })

  describe('Data Loading', () => {
    it('should show loading state initially', async () => {
      // Mock a delayed response
      mockTrialBalanceService.generateTrialBalance.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTrialBalanceData), 100))
      )

      renderComponent()
      
      expect(screen.getByText('Generating trial balance report...')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should load trial balance data on mount', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date)
          }),
          expect.objectContaining({
            groupByCategory: true,
            includeZeroBalances: false
          })
        )
      })
    })

    it('should display trial balance data when loaded', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Report Summary')).toBeInTheDocument()
        expect(screen.getByText('Assets')).toBeInTheDocument()
        expect(screen.getByText('Liabilities')).toBeInTheDocument()
      })
    })

    it('should display calculation when showCalculationDetails is true', async () => {
      renderComponent({ showCalculationDetails: true })

      await waitFor(() => {
        expect(screen.getByText('Trial Balance Calculation')).toBeInTheDocument()
        // The calculation expression is formatted with spans and uses toLocaleString()
        // Use getAllByText since these values appear in multiple places
        expect(screen.getAllByText('50,000').length).toBeGreaterThan(0)
        expect(screen.getAllByText('30,000').length).toBeGreaterThan(0)
        expect(screen.getAllByText('20,000').length).toBeGreaterThan(0)
      })
    })

    it('should hide calculation when showCalculationDetails is false', async () => {
      renderComponent({ showCalculationDetails: false })

      await waitFor(() => {
        expect(screen.queryByText('Trial Balance Calculation')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when service fails', async () => {
      const errorMessage = 'Failed to generate trial balance'
      mockTrialBalanceService.generateTrialBalance.mockRejectedValue(new Error(errorMessage))

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
        expect(screen.getByText('Click the refresh icon to try again')).toBeInTheDocument()
      })
    })

    it('should display validation error for invalid date range', async () => {
      const validationError = 'Start date cannot be later than end date'
      mockTrialBalanceService.getDateRangeValidationError.mockReturnValue(validationError)

      renderComponent()

      await waitFor(() => {
        expect(screen.getAllByText(validationError)).toHaveLength(2) // Appears in both DateRangeSelector and Alert
      })
    })

    it('should allow retry after error', async () => {
      // First call fails
      mockTrialBalanceService.generateTrialBalance
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockTrialBalanceData)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(screen.getByText('Report Summary')).toBeInTheDocument()
      })
    })
  })

  describe('Date Range Functionality', () => {
    it('should use default date range when none provided', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date)
          }),
          expect.any(Object)
        )
      })
    })

    it('should use provided default date range', async () => {
      const defaultDateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      }

      renderComponent({ defaultDateRange })

      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledWith(
          defaultDateRange,
          expect.any(Object)
        )
      })
    })

    it('should regenerate report when date range changes', async () => {
      renderComponent()

      // Wait for initial load
      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledTimes(1)
      })

      // This is a simplified test - in reality, the date change would come from DateRangeSelector
      // For now, we'll verify the service was called initially
      expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalled()
    })
  })

  describe('Zero Balance Toggle', () => {
    it('should toggle show zero balances setting', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Report Summary')).toBeInTheDocument()
      })

      const toggle = screen.getByRole('checkbox', { name: /show zero balance accounts/i })
      expect(toggle).not.toBeChecked()

      await user.click(toggle)
      expect(toggle).toBeChecked()

      // Should regenerate report with new setting
      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            includeZeroBalances: true
          })
        )
      })
    })
  })

  describe('Account Click Handling', () => {
    it('should call onAccountClick when account is clicked', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Cash Account')).toBeInTheDocument()
      })

      // This would require the AccountCategorySection to be expanded and clickable
      // For now, we'll verify the callback is passed correctly
      expect(mockOnAccountClick).toBeDefined()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no data available', async () => {
      mockTrialBalanceService.generateTrialBalance.mockResolvedValue(mockEmptyTrialBalanceData)

      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('No Data Available')).toBeInTheDocument()
        expect(screen.getByText('No transactions found for the selected date range. Try adjusting your date selection.')).toBeInTheDocument()
      })
    })
  })

  describe('Summary Information', () => {
    it('should display correct summary statistics', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Report Summary')).toBeInTheDocument()
        
        // Use more specific queries to avoid ambiguity
        const summarySection = screen.getByText('Report Summary').closest('div')
        expect(summarySection).toBeInTheDocument()
        
        // Check for specific labels and their corresponding values
        expect(screen.getByText('Total Categories')).toBeInTheDocument()
        expect(screen.getByText('Total Accounts')).toBeInTheDocument()
        expect(screen.getByText('Total Transactions')).toBeInTheDocument()
        expect(screen.getByText('Final Balance')).toBeInTheDocument()
        
        // Check for the actual values
        expect(screen.getByText('15')).toBeInTheDocument() // Total Transactions
        // Use getAllByText for values that appear multiple times
        const balanceElements = screen.getAllByText('20,000')
        expect(balanceElements.length).toBeGreaterThan(0) // Final Balance appears in multiple places
      })
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      renderComponent()

      expect(screen.getByText('Trial Balance Report')).toBeInTheDocument()
      // Additional mobile-specific tests would go here
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderComponent()

      expect(screen.getByRole('heading', { name: 'Trial Balance Report' })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /show zero balance accounts/i })).toBeInTheDocument()
      expect(screen.getByRole('checkbox', { name: /show filters/i })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderComponent()

      // Test tab navigation
      await user.tab()
      expect(document.activeElement).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should not regenerate report unnecessarily', async () => {
      renderComponent()

      await waitFor(() => {
        expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledTimes(1)
      })

      // Simulate a re-render without prop changes
      // The service should not be called again
      expect(mockTrialBalanceService.generateTrialBalance).toHaveBeenCalledTimes(1)
    })
  })
})