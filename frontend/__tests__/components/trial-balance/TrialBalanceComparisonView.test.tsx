import React from 'react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { TrialBalanceComparisonView } from '@/components/trial-balance/TrialBalanceComparisonView'
import { TrialBalanceComparison, AccountCategoryType } from '@/types/trialBalance'

const theme = createTheme()

const mockComparison: TrialBalanceComparison = {
  period1: {
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
            creditAmount: 500,
            netBalance: -500,
            transactionCount: 10
          }
        ],
        subtotal: -500
      },
      {
        name: AccountCategoryType.LIABILITIES,
        accounts: [
          {
            accountId: '2',
            accountName: 'Accounts Payable',
            categoryDescription: 'Current Liabilities',
            particulars: 'Outstanding payments',
            debitAmount: -200,
            creditAmount: 800,
            netBalance: 600,
            transactionCount: 5
          }
        ],
        subtotal: 600
      }
    ],
    totalDebits: -1200,
    totalCredits: 1300,
    finalBalance: 100,
    calculationExpression: '-1000 + 500 - 200 + 800 = 100',
    generatedAt: new Date('2024-02-01'),
    totalTransactions: 15
  },
  period2: {
    dateRange: {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29')
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
            debitAmount: -1500,
            creditAmount: 700,
            netBalance: -800,
            transactionCount: 12
          }
        ],
        subtotal: -800
      },
      {
        name: AccountCategoryType.LIABILITIES,
        accounts: [
          {
            accountId: '2',
            accountName: 'Accounts Payable',
            categoryDescription: 'Current Liabilities',
            particulars: 'Outstanding payments',
            debitAmount: -100,
            creditAmount: 900,
            netBalance: 800,
            transactionCount: 8
          }
        ],
        subtotal: 800
      }
    ],
    totalDebits: -1600,
    totalCredits: 1600,
    finalBalance: 0,
    calculationExpression: '-1500 + 700 - 100 + 900 = 0',
    generatedAt: new Date('2024-03-01'),
    totalTransactions: 20
  },
  variances: [
    {
      accountId: '1',
      accountName: 'Cash',
      period1Balance: -500,
      period2Balance: -800,
      absoluteChange: -300,
      percentageChange: 60 // 60% increase in negative balance
    },
    {
      accountId: '2',
      accountName: 'Accounts Payable',
      period1Balance: 600,
      period2Balance: 800,
      absoluteChange: 200,
      percentageChange: 33.33 // 33.33% increase
    }
  ]
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('TrialBalanceComparisonView', () => {
  it('renders period headers correctly', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('Period 1 (Baseline)')).toBeInTheDocument()
    expect(screen.getByText('Period 2 (Comparison)')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument() // Period 1 balance
    expect(screen.getByText('$0.00')).toBeInTheDocument() // Period 2 balance
  })

  it('displays overall variance correctly', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('Overall Variance')).toBeInTheDocument()
    expect(screen.getByText('-$100.00')).toBeInTheDocument() // Net change
  })

  it('shows category comparison table', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('Category Comparison')).toBeInTheDocument()
    expect(screen.getAllByText('Assets')).toHaveLength(2) // One in table, one in accordion
    expect(screen.getAllByText('Liabilities')).toHaveLength(2) // One in table, one in accordion
  })

  it('displays account-level variances', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('Account-Level Variances')).toBeInTheDocument()
    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Accounts Payable')).toBeInTheDocument()
  })

  it('highlights significant variances', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} significanceThreshold={10} />)
    
    // Both variances should be marked as significant (60% and 33.33% > 10%)
    const significantChips = screen.getAllByText('Significant')
    expect(significantChips.length).toBeGreaterThan(0)
  })

  it('handles empty variances gracefully', () => {
    const emptyComparison: TrialBalanceComparison = {
      ...mockComparison,
      variances: []
    }
    
    renderWithTheme(<TrialBalanceComparisonView comparison={emptyComparison} />)
    
    expect(screen.getByText('No account-level variances found between the selected periods.')).toBeInTheDocument()
  })

  it('formats currency values correctly', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    // Check for properly formatted currency values
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getByText('-$100.00')).toBeInTheDocument()
  })

  it('shows transaction counts', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('15 transactions')).toBeInTheDocument()
    expect(screen.getByText('20 transactions')).toBeInTheDocument()
  })

  it('displays date ranges correctly', () => {
    renderWithTheme(<TrialBalanceComparisonView comparison={mockComparison} />)
    
    expect(screen.getByText('Jan 01 - Jan 31, 2024')).toBeInTheDocument()
    expect(screen.getByText('Feb 01 - Feb 29, 2024')).toBeInTheDocument()
  })
})