import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AccountDrillDown } from '../../../src/components/trial-balance/AccountDrillDown';

// Mock the trial balance service
jest.mock('../../../src/services/trialBalanceService', () => ({
  trialBalanceService: {
    getAccountTransactions: jest.fn()
  }
}));

import { trialBalanceService } from '../../../src/services/trialBalanceService';
const mockGetAccountTransactions = trialBalanceService.getAccountTransactions as jest.MockedFunction<typeof trialBalanceService.getAccountTransactions>;

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockDateRange = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
};

describe('AccountDrillDown - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock response
    mockGetAccountTransactions.mockResolvedValue({
      accountId: 'acc-123',
      accountName: 'Test Account',
      transactions: [],
      totalCount: 0,
      pageSize: 25,
      currentPage: 1
    });
  });

  afterEach(() => {
    // Clean up any remaining DOM elements
    document.body.innerHTML = '';
  });

  const defaultProps = {
    accountId: 'acc-123',
    accountName: 'Test Account',
    dateRange: mockDateRange,
    isOpen: false,
    onClose: jest.fn()
  };

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <AccountDrillDown {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.queryByText('Account Transaction Details')).not.toBeInTheDocument();
  });

  it('renders modal when open', async () => {
    let component: any;
    
    await act(async () => {
      component = render(
        <TestWrapper>
          <AccountDrillDown {...defaultProps} isOpen={true} />
        </TestWrapper>
      );
    });

    // Wait for the modal to appear and async operations to complete
    await waitFor(() => {
      expect(screen.getByText('Account Transaction Details')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(mockGetAccountTransactions).toHaveBeenCalledWith(
      'acc-123',
      mockDateRange,
      { page: 1, pageSize: 25 }
    );

    // Clean up
    component.unmount();
  });

  it('displays account name in breadcrumb', async () => {
    let component: any;
    
    await act(async () => {
      component = render(
        <TestWrapper>
          <AccountDrillDown {...defaultProps} accountName="Unique Account Name" isOpen={true} />
        </TestWrapper>
      );
    });

    // Wait for the component to load and display the account name in breadcrumb
    await waitFor(() => {
      // Look specifically in the breadcrumb area
      const breadcrumbElements = screen.getAllByText('Unique Account Name');
      expect(breadcrumbElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    // Clean up
    component.unmount();
  });
});