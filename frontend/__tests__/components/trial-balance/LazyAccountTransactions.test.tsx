import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LazyAccountTransactions } from '@/components/trial-balance/LazyAccountTransactions'
import { AccountTransaction } from '@/types/trialBalance'

// Mock the trial balance service
const mockGetAccountTransactions = jest.fn()

jest.mock('@/services/trialBalanceService', () => ({
    trialBalanceService: {
        getAccountTransactions: mockGetAccountTransactions
    }
}))

const mockTransactions: AccountTransaction[] = [
    {
        id: '1',
        date: new Date('2024-01-15'),
        categoryDescription: 'Current Assets - Cash & Bank',
        particulars: 'Cash deposit from customer',
        referenceNumber: 'REF001',
        debitAmount: 0,
        creditAmount: 1000,
        runningBalance: 1000,
        accountId: 'acc-1',
        accountName: 'Cash Account'
    },
    {
        id: '2',
        date: new Date('2024-01-16'),
        categoryDescription: 'Current Assets - Cash & Bank',
        particulars: 'Office supplies purchase',
        referenceNumber: 'REF002',
        debitAmount: -200,
        creditAmount: 0,
        runningBalance: 800,
        accountId: 'acc-1',
        accountName: 'Cash Account'
    },
    {
        id: '3',
        date: new Date('2024-01-17'),
        categoryDescription: 'Current Assets - Cash & Bank',
        particulars: 'Bank transfer',
        referenceNumber: 'REF003',
        debitAmount: 0,
        creditAmount: 500,
        runningBalance: 1300,
        accountId: 'acc-1',
        accountName: 'Cash Account'
    }
]

const mockDateRange = {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
}

describe('LazyAccountTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetAccountTransactions.mockResolvedValue(mockTransactions)
    })

    it('renders collapsed by default', () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
            />
        )

        expect(screen.getByText('Cash Account - Transaction Details')).toBeInTheDocument()
        expect(screen.queryByText('Date')).not.toBeInTheDocument() // Table headers should not be visible
    })

    it('renders expanded when initiallyExpanded is true', async () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={true}
            />
        )

        // Should show loading initially
        expect(screen.getByText('Cash Account - Transaction Details')).toBeInTheDocument()
        
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
            expect(screen.getByText('Category')).toBeInTheDocument()
            expect(screen.getByText('Description')).toBeInTheDocument()
        })

        expect(mockGetAccountTransactions).toHaveBeenCalledWith(
            'acc-1',
            mockDateRange.startDate,
            mockDateRange.endDate
        )
    })

    it('loads transactions when expanded', async () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
            />
        )

        // Click to expand
        const expandButton = screen.getByRole('button')
        fireEvent.click(expandButton)

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText('Date')).toBeInTheDocument()
        })

        // Wait for transactions to load
        await waitFor(() => {
            expect(screen.getByText('Cash deposit from customer')).toBeInTheDocument()
            expect(screen.getByText('Office supplies purchase')).toBeInTheDocument()
            expect(screen.getByText('Bank transfer')).toBeInTheDocument()
        })

        expect(mockGetAccountTransactions).toHaveBeenCalledWith(
            'acc-1',
            mockDateRange.startDate,
            mockDateRange.endDate
        )
    })

    it('displays transaction count when loaded', async () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={true}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('3 transactions')).toBeInTheDocument()
        })
    })

    it('handles error state correctly', async () => {
        const errorMessage = 'Failed to load transactions'
        mockGetAccountTransactions.mockRejectedValue(new Error(errorMessage))

        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={true}
            />
        )

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })

        // Should show retry button
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('handles empty state correctly', async () => {
        mockGetAccountTransactions.mockResolvedValue([])

        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={true}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('No transactions found for this account in the selected date range.')).toBeInTheDocument()
        })
    })

    it('does not load data until expanded', () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={false}
            />
        )

        // Should not have called the service yet
        expect(mockGetAccountTransactions).not.toHaveBeenCalled()
    })

    it('refreshes data when refresh button is clicked', async () => {
        render(
            <LazyAccountTransactions
                accountId="acc-1"
                accountName="Cash Account"
                dateRange={mockDateRange}
                initiallyExpanded={true}
            />
        )

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('3 transactions')).toBeInTheDocument()
        })

        // Clear the mock to track new calls
        mockGetAccountTransactions.mockClear()

        // Click refresh button
        const refreshButton = screen.getByRole('button', { name: /refresh/i })
        fireEvent.click(refreshButton)

        // Should call the service again
        await waitFor(() => {
            expect(mockGetAccountTransactions).toHaveBeenCalledWith(
                'acc-1',
                mockDateRange.startDate,
                mockDateRange.endDate
            )
        })
    })
})