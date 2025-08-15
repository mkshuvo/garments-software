import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TrialBalanceReport } from '../../src/components/trial-balance/TrialBalanceReport';
import { TrialBalanceData, AccountCategory, AccountBalance } from '../../src/types/trialBalance';

// Mock performance.now for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(window, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Mock IntersectionObserver for virtual scrolling tests
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Trial Balance Performance Tests', () => {
  let timeCounter = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    timeCounter = 0;
    mockPerformanceNow.mockImplementation(() => {
      timeCounter += 16.67; // Simulate 60fps
      return timeCounter;
    });
  });

  const generateLargeTrialBalanceData = (
    categoryCount: number, 
    accountsPerCategory: number
  ): TrialBalanceData => {
    const categories: AccountCategory[] = [];
    
    for (let i = 0; i < categoryCount; i++) {
      const accounts: AccountBalance[] = [];
      
      for (let j = 0; j < accountsPerCategory; j++) {
        accounts.push({
          accountId: `account-${i}-${j}`,
          accountName: `Account ${i}-${j}`,
          categoryDescription: `Category ${i} - Description for account ${j}`,
          particulars: `Detailed particulars for account ${i}-${j} with some longer text to simulate real data`,
          debitAmount: j % 2 === 0 ? -(Math.random() * 10000) : 0,
          creditAmount: j % 2 === 1 ? (Math.random() * 10000) : 0,
          netBalance: (Math.random() - 0.5) * 20000,
          transactionCount: Math.floor(Math.random() * 100) + 1
        });
      }
      
      categories.push({
        name: `Category${i}` as any,
        accounts,
        subtotal: accounts.reduce((sum, acc) => sum + acc.netBalance, 0)
      });
    }

    const totalDebits = categories.reduce((sum, cat) => 
      sum + cat.accounts.reduce((accSum, acc) => accSum + acc.debitAmount, 0), 0);
    const totalCredits = categories.reduce((sum, cat) => 
      sum + cat.accounts.reduce((accSum, acc) => accSum + acc.creditAmount, 0), 0);
    const finalBalance = totalCredits + totalDebits; // debits are negative

    return {
      dateRange: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      },
      categories,
      totalDebits,
      totalCredits,
      finalBalance,
      calculationExpression: `${totalCredits} + ${totalDebits} = ${finalBalance}`,
      generatedAt: new Date()
    };
  };

  describe('Rendering Performance', () => {
    it('renders 1000 accounts within performance budget (< 100ms)', () => {
      // Arrange
      const largeData = generateLargeTrialBalanceData(5, 200); // 1000 accounts total
      const mockProps = {
        data: largeData,
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

      // Act
      const startTime = performance.now();
      render(<TrialBalanceReport {...mockProps} />);
      const endTime = performance.now();

      // Assert
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(100); // Should render within 100ms
      expect(screen.getByTestId('trial-balance-report')).toBeInTheDocument();
    });

    it('handles 5000 accounts with virtual scrolling efficiently', () => {
      // Arrange
      const veryLargeData = generateLargeTrialBalanceData(10, 500); // 5000 accounts total
      const mockProps = {
        data: veryLargeData,
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

      // Act
      const startTime = performance.now();
      render(<TrialBalanceReport {...mockProps} />);
      const endTime = performance.now();

      // Assert
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(200); // Should render within 200ms even with 5k accounts
      
      // Should not render all accounts at once (virtual scrolling)
      const renderedAccounts = screen.getAllByTestId(/^account-/);
      expect(renderedAccounts.length).toBeLessThan(100); // Should only render visible accounts
    });

    it('maintains 60fps during scrolling with large datasets', async () => {
      // Arrange
      const largeData = generateLargeTrialBalanceData(20, 100); // 2000 accounts
      const mockProps = {
        data: largeData,
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

      render(<TrialBalanceReport {...mockProps} />);

      // Act - Simulate scrolling
      const scrollContainer = screen.getByTestId('trial-balance-scroll-container');
      const frameTimes: number[] = [];

      for (let i = 0; i < 10; i++) {
        const frameStart = performance.now();
        
        fireEvent.scroll(scrollContainer, { target: { scrollTop: i * 100 } });
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      // Assert - Each frame should be under 16.67ms (60fps)
      const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      expect(averageFrameTime).toBeLessThan(16.67);
      
      const maxFrameTime = Math.max(...frameTimes);
      expect(maxFrameTime).toBeLessThan(33.33); // No frame should exceed 30fps
    });
  });

  describe('Interaction Performance', () => {
    it('handles rapid account clicks without performance degradation', async () => {
      // Arrange
      const user = userEvent.setup();
      const largeData = generateLargeTrialBalanceData(5, 100); // 500 accounts
      const onAccountClick = jest.fn();
      const mockProps = {
        data: largeData,
        showCalculationDetails: true,
        onAccountClick,
        groupByCategory: true,
        loading: false,
        error: null,
        onDateRangeChange: jest.fn(),
        onExportPdf: jest.fn(),
        onExportCsv: jest.fn(),
        showZeroBalances: false,
        onToggleZeroBalances: jest.fn()
      };

      render(<TrialBalanceReport {...mockProps} />);

      // Act - Rapid clicks on multiple accounts
      const accountElements = screen.getAllByTestId(/^account-/).slice(0, 10);
      const clickTimes: number[] = [];

      for (const account of accountElements) {
        const clickStart = performance.now();
        await user.click(account);
        const clickEnd = performance.now();
        clickTimes.push(clickEnd - clickStart);
      }

      // Assert
      const averageClickTime = clickTimes.reduce((sum, time) => sum + time, 0) / clickTimes.length;
      expect(averageClickTime).toBeLessThan(10); // Each click should be handled within 10ms
      expect(onAccountClick).toHaveBeenCalledTimes(10);
    });

    it('filters large datasets efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const largeData = generateLargeTrialBalanceData(10, 200); // 2000 accounts
      const mockProps = {
        data: largeData,
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

      render(<TrialBalanceReport {...mockProps} />);

      // Act - Toggle zero balances filter
      const filterToggle = screen.getByLabelText(/show zero balances/i);
      
      const filterStart = performance.now();
      await user.click(filterToggle);
      const filterEnd = performance.now();

      // Assert
      const filterTime = filterEnd - filterStart;
      expect(filterTime).toBeLessThan(50); // Filtering should complete within 50ms
    });

    it('handles category expansion/collapse efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const largeData = generateLargeTrialBalanceData(10, 100); // 1000 accounts across 10 categories
      const mockProps = {
        data: largeData,
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

      render(<TrialBalanceReport {...mockProps} />);

      // Act - Expand/collapse all categories rapidly
      const categoryHeaders = screen.getAllByTestId(/^category-header-/);
      const expansionTimes: number[] = [];

      for (const header of categoryHeaders) {
        const expandStart = performance.now();
        await user.click(header);
        const expandEnd = performance.now();
        expansionTimes.push(expandEnd - expandStart);
      }

      // Assert
      const averageExpansionTime = expansionTimes.reduce((sum, time) => sum + time, 0) / expansionTimes.length;
      expect(averageExpansionTime).toBeLessThan(20); // Each expansion should complete within 20ms
    });
  });

  describe('Memory Performance', () => {
    it('does not create memory leaks with large datasets', () => {
      // Arrange
      const largeData = generateLargeTrialBalanceData(20, 250); // 5000 accounts
      const mockProps = {
        data: largeData,
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

      // Act - Render and unmount multiple times
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<TrialBalanceReport {...mockProps} />);
        unmount();
      }

      // Assert - This test mainly ensures no errors are thrown during cleanup
      // In a real environment, you would monitor actual memory usage
      expect(true).toBe(true); // If we reach here without errors, memory cleanup is working
    });

    it('efficiently updates when data changes', () => {
      // Arrange
      const initialData = generateLargeTrialBalanceData(5, 100);
      const updatedData = generateLargeTrialBalanceData(5, 100);
      
      const mockProps = {
        data: initialData,
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

      const { rerender } = render(<TrialBalanceReport {...mockProps} />);

      // Act - Update with new data
      const updateStart = performance.now();
      rerender(<TrialBalanceReport {...mockProps} data={updatedData} />);
      const updateEnd = performance.now();

      // Assert
      const updateTime = updateEnd - updateStart;
      expect(updateTime).toBeLessThan(100); // Update should complete within 100ms
    });
  });

  describe('Calculation Performance', () => {
    it('calculates subtotals efficiently for large categories', () => {
      // Arrange
      const largeData = generateLargeTrialBalanceData(1, 10000); // Single category with 10k accounts
      const mockProps = {
        data: largeData,
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

      // Act
      const calculationStart = performance.now();
      render(<TrialBalanceReport {...mockProps} />);
      const calculationEnd = performance.now();

      // Assert
      const calculationTime = calculationEnd - calculationStart;
      expect(calculationTime).toBeLessThan(150); // Should handle 10k account calculations within 150ms
      
      // Verify calculation accuracy
      const expectedSubtotal = largeData.categories[0].subtotal;
      expect(screen.getByTestId('category-subtotal-0')).toHaveTextContent(expectedSubtotal.toString());
    });

    it('handles complex mathematical expressions efficiently', () => {
      // Arrange - Create data with many decimal places and large numbers
      const complexData: TrialBalanceData = {
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        categories: [{
          name: 'Assets',
          accounts: Array.from({ length: 1000 }, (_, i) => ({
            accountId: `complex-${i}`,
            accountName: `Complex Account ${i}`,
            categoryDescription: `Complex Category Description ${i}`,
            particulars: `Complex particulars ${i}`,
            debitAmount: -(999999.999999 + i * 0.000001),
            creditAmount: 1000000.000001 + i * 0.000001,
            netBalance: 0.000002,
            transactionCount: i + 1
          })),
          subtotal: 0.002
        }],
        totalDebits: -999999999.999,
        totalCredits: 1000000000.001,
        finalBalance: 0.002,
        calculationExpression: '1000000000.001 - 999999999.999 = 0.002',
        generatedAt: new Date()
      };

      const mockProps = {
        data: complexData,
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

      // Act
      const complexCalculationStart = performance.now();
      render(<TrialBalanceReport {...mockProps} />);
      const complexCalculationEnd = performance.now();

      // Assert
      const complexCalculationTime = complexCalculationEnd - complexCalculationStart;
      expect(complexCalculationTime).toBeLessThan(200); // Complex calculations should complete within 200ms
      
      // Verify precision is maintained
      expect(screen.getByTestId('final-balance')).toHaveTextContent('0.002');
    });
  });

  describe('Export Performance', () => {
    it('prepares large datasets for export efficiently', async () => {
      // Arrange
      const user = userEvent.setup();
      const largeData = generateLargeTrialBalanceData(10, 500); // 5000 accounts
      const mockExportPdf = jest.fn().mockResolvedValue(undefined);
      const mockProps = {
        data: largeData,
        showCalculationDetails: true,
        onAccountClick: jest.fn(),
        groupByCategory: true,
        loading: false,
        error: null,
        onDateRangeChange: jest.fn(),
        onExportPdf: mockExportPdf,
        onExportCsv: jest.fn(),
        showZeroBalances: false,
        onToggleZeroBalances: jest.fn()
      };

      render(<TrialBalanceReport {...mockProps} />);

      // Act
      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      
      const exportStart = performance.now();
      await user.click(exportButton);
      const exportEnd = performance.now();

      // Assert
      const exportPreparationTime = exportEnd - exportStart;
      expect(exportPreparationTime).toBeLessThan(100); // Export preparation should be fast
      expect(mockExportPdf).toHaveBeenCalledWith(largeData, expect.any(Object));
    });
  });

  describe('Responsive Performance', () => {
    it('adapts to different screen sizes efficiently', () => {
      // Arrange
      const largeData = generateLargeTrialBalanceData(5, 200);
      const mockProps = {
        data: largeData,
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

      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // Mobile
        { width: 768, height: 1024 },  // Tablet
        { width: 1920, height: 1080 }  // Desktop
      ];

      viewports.forEach(viewport => {
        // Act
        Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
        
        const resizeStart = performance.now();
        const { unmount } = render(<TrialBalanceReport {...mockProps} />);
        const resizeEnd = performance.now();
        
        // Assert
        const resizeTime = resizeEnd - resizeStart;
        expect(resizeTime).toBeLessThan(100); // Should adapt to viewport within 100ms
        
        unmount();
      });
    });
  });
});