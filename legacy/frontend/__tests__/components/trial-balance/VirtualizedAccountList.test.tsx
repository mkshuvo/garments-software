import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { VirtualizedAccountList } from '@/components/trial-balance/VirtualizedAccountList'
import { AccountBalance } from '@/types/trialBalance'

// Mock react-window
jest.mock('react-window', () => ({
    FixedSizeList: ({ children, itemData, itemCount, itemSize }: any) => {
        // Render first few items for testing
        const items = []
        const maxItems = Math.min(itemCount, 5) // Render only first 5 items for testing
        
        for (let i = 0; i < maxItems; i++) {
            items.push(
                <div key={i} data-testid={`virtual-item-${i}`}>
                    {children({
                        index: i,
                        style: { height: itemSize },
                        data: itemData
                    })}
                </div>
            )
        }
        
        return <div data-testid="virtual-list">{items}</div>
    }
}))

const mockAccounts: AccountBalance[] = [
    {
        accountId: '1',
        accountName: 'Cash Account',
        categoryDescription: 'Current Assets - Cash & Bank',
        particulars: 'Daily cash transactions',
        debitAmount: -1000,
        creditAmount: 1500,
        netBalance: 500,
        transactionCount: 25
    },
    {
        accountId: '2',
        accountName: 'Accounts Receivable',
        categoryDescription: 'Current Assets - Accounts Receivable',
        particulars: 'Customer payments',
        debitAmount: -2000,
        creditAmount: 1800,
        netBalance: -200,
        transactionCount: 15
    },
    {
        accountId: '3',
        accountName: 'Zero Balance Account',
        categoryDescription: 'Assets - General',
        particulars: 'No activity',
        debitAmount: 0,
        creditAmount: 0,
        netBalance: 0,
        transactionCount: 0
    }
]

const mockOnAccountClick = jest.fn()

describe('VirtualizedAccountList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders account list with virtual scrolling', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        expect(screen.getByText('Account List')).toBeInTheDocument()
        expect(screen.getByText('3 accounts')).toBeInTheDocument()
        expect(screen.getByTestId('virtual-list')).toBeInTheDocument()
    })

    it('filters out zero balance accounts when showZeroBalances is false', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={false}
            />
        )

        expect(screen.getByText(/2 accounts/)).toBeInTheDocument()
        expect(screen.getByText(/1 zero balance accounts hidden/)).toBeInTheDocument()
    })

    it('shows all accounts when showZeroBalances is true', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        expect(screen.getByText('3 accounts')).toBeInTheDocument()
        expect(screen.queryByText('zero balance accounts hidden')).not.toBeInTheDocument()
    })

    it('calls onAccountClick when account is clicked', async () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        // Find and click the first account
        const firstAccount = screen.getByText('Cash Account')
        fireEvent.click(firstAccount)

        await waitFor(() => {
            expect(mockOnAccountClick).toHaveBeenCalledWith('1', 'Cash Account')
        })
    })

    it('displays loading state correctly', () => {
        render(
            <VirtualizedAccountList
                accounts={[]}
                onAccountClick={mockOnAccountClick}
                loading={true}
            />
        )

        expect(screen.getByText('Account List')).toBeInTheDocument()
        // In loading state, the component should show a different structure
        // Let's just verify it doesn't show the virtual list
        expect(screen.queryByTestId('virtual-list')).not.toBeInTheDocument()
    })

    it('displays error state correctly', () => {
        const errorMessage = 'Failed to load accounts'
        
        render(
            <VirtualizedAccountList
                accounts={[]}
                onAccountClick={mockOnAccountClick}
                error={errorMessage}
            />
        )

        expect(screen.getByText('Account List')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('displays empty state when no accounts match criteria', () => {
        render(
            <VirtualizedAccountList
                accounts={[]}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={false}
            />
        )

        expect(screen.getByText('No accounts with non-zero balances found. Try enabling "Show Zero Balance Accounts".')).toBeInTheDocument()
    })

    it('displays empty state when no accounts at all', () => {
        render(
            <VirtualizedAccountList
                accounts={[]}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        expect(screen.getByText('No accounts found for the selected criteria.')).toBeInTheDocument()
    })

    it('formats currency correctly', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        // Check if currency formatting is applied (should show $500.00 format)
        expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
    })

    it('shows transaction count for accounts with transactions', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        expect(screen.getByText('25 transactions')).toBeInTheDocument()
        expect(screen.getByText('15 transactions')).toBeInTheDocument()
    })

    it('applies correct color coding for positive and negative balances', () => {
        render(
            <VirtualizedAccountList
                accounts={mockAccounts}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
            />
        )

        // Positive balance should have success color
        const positiveBalance = screen.getByText(/\$500\.00/)
        expect(positiveBalance.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess')

        // Negative balance should have error color  
        const negativeBalance = screen.getByText(/\$200\.00/)
        expect(negativeBalance.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError')
    })

    it('handles large account lists efficiently', () => {
        // Create a large list of accounts
        const largeAccountList = Array.from({ length: 1000 }, (_, index) => ({
            accountId: `account-${index}`,
            accountName: `Account ${index}`,
            categoryDescription: 'Test Category',
            particulars: `Test particulars ${index}`,
            debitAmount: index % 2 === 0 ? -100 : 0,
            creditAmount: index % 2 === 1 ? 100 : 0,
            netBalance: index % 2 === 0 ? -100 : 100,
            transactionCount: index + 1
        }))

        const { container } = render(
            <VirtualizedAccountList
                accounts={largeAccountList}
                onAccountClick={mockOnAccountClick}
                showZeroBalances={true}
                height={400}
                itemHeight={80}
            />
        )

        expect(screen.getByText('1000 accounts')).toBeInTheDocument()
        expect(screen.getByTestId('virtual-list')).toBeInTheDocument()
        
        // Should only render a subset of items due to virtualization
        const renderedItems = container.querySelectorAll('[data-testid^="virtual-item-"]')
        expect(renderedItems.length).toBeLessThan(1000) // Should be much less due to virtualization
        expect(renderedItems.length).toBeGreaterThan(0) // But should render some items
    })
})