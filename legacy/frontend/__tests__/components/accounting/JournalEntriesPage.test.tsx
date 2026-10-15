import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import JournalEntriesPage from '@/app/admin/accounting/journal-entries/page';
import { journalEntryService } from '@/services/journalEntryService';

// Mock the journal entry service
jest.mock('@/services/journalEntryService');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the service worker
jest.mock('@/utils/serviceWorker', () => ({
  serviceWorkerManager: {
    isOffline: () => false,
    onOnlineStatusChange: () => () => {},
    getCacheInfo: () => Promise.resolve([]),
    isServiceWorkerSupported: () => true,
  },
}));

const mockJournalEntryService = journalEntryService as jest.Mocked<typeof journalEntryService>;

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('JournalEntriesPage', () => {
  const mockJournalEntries = [
    {
      id: '1',
      journalNumber: 'JE-2024-01-0001',
      transactionDate: '2024-01-01',
      type: 'Credit' as const,
      categoryName: 'Sales',
      particulars: 'Test transaction',
      amount: 1000,
      referenceNumber: 'REF001',
      contactName: 'Test Customer',
      accountName: 'Sales Account',
      createdAt: '2024-01-01T00:00:00Z',
      status: 'Posted',
      transactionStatus: 'Posted',
      createdBy: 'System',
      journalType: 'General',
      formattedAmount: '$1,000.00',
      formattedDate: 'Jan 01, 2024',
      formattedCreatedDate: 'Jan 01, 2024 00:00',
      typeColor: 'success',
      statusColor: 'info'
    },
    {
      id: '2',
      journalNumber: 'JE-2024-01-0002',
      transactionDate: '2024-01-02',
      type: 'Debit' as const,
      categoryName: 'Expenses',
      particulars: 'Test expense',
      amount: 500,
      referenceNumber: 'REF002',
      contactName: 'Test Supplier',
      accountName: 'Expense Account',
      createdAt: '2024-01-02T00:00:00Z',
      status: 'Posted',
      transactionStatus: 'Posted',
      createdBy: 'System',
      journalType: 'General',
      formattedAmount: '$500.00',
      formattedDate: 'Jan 02, 2024',
      formattedCreatedDate: 'Jan 02, 2024 00:00',
      typeColor: 'error',
      statusColor: 'info'
    }
  ];

  const mockResponse = {
    success: true,
    entries: mockJournalEntries,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalEntries: 2,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false,
      startEntry: 1,
      endEntry: 2
    },
    summary: {
      totalEntries: 2,
      totalDebits: 500,
      totalCredits: 1000,
      balance: -500,
      creditEntries: 1,
      debitEntries: 1,
      entriesByStatus: { Posted: 2 },
      entriesByType: { Credit: 1, Debit: 1 },
      formattedTotalDebits: '$500.00',
      formattedTotalCredits: '$1,000.00',
      formattedBalance: '$-500.00',
      isBalanced: false,
      balanceColor: 'error'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    mockJournalEntryService.getJournalEntries.mockResolvedValue(mockResponse);
    
    // Mock categories response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { name: 'Sales' },
        { name: 'Expenses' },
        { name: 'Assets' }
      ])
    });
  });

  it('should render the journal entries page', async () => {
    renderWithTheme(<JournalEntriesPage />);

    expect(screen.getByText('📋 Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('View and manage all your credit and debit transactions with advanced filtering')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });
  });

  it('should display journal entries in the table', async () => {
    renderWithTheme(<JournalEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('JE-2024-01-0001')).toBeInTheDocument();
      expect(screen.getByText('JE-2024-01-0002')).toBeInTheDocument();
      expect(screen.getByText('Test transaction')).toBeInTheDocument();
      expect(screen.getByText('Test expense')).toBeInTheDocument();
    });
  });

  it('should show summary information', async () => {
    renderWithTheme(<JournalEntriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Total Entries: 2')).toBeInTheDocument();
      expect(screen.getByText('Total Credits: $1,000.00')).toBeInTheDocument();
      expect(screen.getByText('Total Debits: $500.00')).toBeInTheDocument();
    });
  });

  it('should handle filter changes', async () => {
    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });

    // Click show filters button
    const showFiltersButton = screen.getByText('Show Filters');
    fireEvent.click(showFiltersButton);

    // Check if filters are visible
    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
  });

  it('should handle search functionality', async () => {
    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });

    // Find search input and type
    const searchInput = screen.getByPlaceholderText(/search journal entries/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Verify the service was called with the search term
    await waitFor(() => {
      expect(mockJournalEntryService.getJournalEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'test'
        }),
        1,
        20
      );
    });
  });

  it('should handle export functionality', async () => {
    const mockExportResponse = {
      success: true,
      fileName: 'journal-entries-2024-01-01.csv',
      downloadUrl: '/api/exports/journal-entries-2024-01-01.csv',
      exportedRecords: 2
    };

    mockJournalEntryService.exportJournalEntries.mockResolvedValue(mockExportResponse);

    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    // Check if export modal is opened
    await waitFor(() => {
      expect(screen.getByText('Export Journal Entries to CSV')).toBeInTheDocument();
    });
  });

  it('should handle refresh functionality', async () => {
    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify the service was called again
    expect(mockJournalEntryService.getJournalEntries).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination', async () => {
    const mockPaginatedResponse = {
      ...mockResponse,
      pagination: {
        ...mockResponse.pagination,
        currentPage: 2,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true
      }
    };

    mockJournalEntryService.getJournalEntries.mockResolvedValue(mockPaginatedResponse);

    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });
  });

  it('should handle error states', async () => {
    mockJournalEntryService.getJournalEntries.mockRejectedValue(new Error('API Error'));

    renderWithTheme(<JournalEntriesPage />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load journal entries')).toBeInTheDocument();
    });
  });

  it('should handle loading states', () => {
    // Mock a delayed response
    mockJournalEntryService.getJournalEntries.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    renderWithTheme(<JournalEntriesPage />);

    // Check if loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle quick filters', async () => {
    renderWithTheme(<JournalEntriesPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 2 entries')).toBeInTheDocument();
    });

    // Click on a quick filter
    const todayFilter = screen.getByText('Today');
    fireEvent.click(todayFilter);

    // Verify the service was called with date filter
    await waitFor(() => {
      expect(mockJournalEntryService.getJournalEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date)
        }),
        1,
        20
      );
    });
  });
});

