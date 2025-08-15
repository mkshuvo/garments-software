import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExportOptions from '@/components/trial-balance/ExportOptions';
import { ExportFormat } from '@/types/trialBalance';

// Mock Material-UI theme
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ExportOptions Component', () => {
  const mockOnExport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Standard Variant', () => {
    it('renders export options with PDF and CSV buttons', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
      expect(screen.getByText('Choose a format to export your trial balance report')).toBeInTheDocument();
    });

    it('calls onExport with PDF format when PDF button is clicked', async () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(ExportFormat.PDF, {
          includeCalculationDetails: true,
          includeZeroBalances: false
        });
      });
    });

    it('calls onExport with CSV format when CSV button is clicked', async () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
          />
        </TestWrapper>
      );

      const csvButton = screen.getByText('Export CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(ExportFormat.CSV, {
          includeCalculationDetails: true,
          includeZeroBalances: false
        });
      });
    });

    it('disables buttons when isExporting is true', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      const csvButton = screen.getByText('Export CSV');

      expect(pdfButton).toBeDisabled();
      expect(csvButton).toBeDisabled();
    });

    it('disables buttons when disabled prop is true', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
            disabled={true}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      const csvButton = screen.getByText('Export CSV');

      expect(pdfButton).toBeDisabled();
      expect(csvButton).toBeDisabled();
    });
  });

  describe('Compact Variant', () => {
    it('renders compact export options with icon buttons', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
            variant="compact"
          />
        </TestWrapper>
      );

      // Should have PDF and CSV icon buttons with tooltips
      expect(screen.getByLabelText('Export as PDF')).toBeInTheDocument();
      expect(screen.getByLabelText('Export as CSV')).toBeInTheDocument();
    });

    it('shows progress chip when exporting in compact mode', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={45}
            variant="compact"
          />
        </TestWrapper>
      );

      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('shows progress bar when exporting', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={60}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('shows appropriate progress messages based on progress value', () => {
      const { rerender } = render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={20}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Preparing data...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={40}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Processing calculations...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={60}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Formatting report...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={80}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Generating file...')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={95}
            showProgress={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Finalizing export...')).toBeInTheDocument();
    });

    it('hides progress bar when showProgress is false', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={60}
            showProgress={false}
          />
        </TestWrapper>
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when export fails', async () => {
      const mockOnExportWithError = jest.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportWithError}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed: Network error')).toBeInTheDocument();
      });
    });

    it('shows retry button when export fails', async () => {
      const mockOnExportWithError = jest.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportWithError}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Retry export')).toBeInTheDocument();
      });
    });

    it('retries export when retry button is clicked', async () => {
      const mockOnExportWithError = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportWithError}
            isExporting={false}
          />
        </TestWrapper>
      );

      // First attempt fails
      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed: Network error')).toBeInTheDocument();
      });

      // Retry
      const retryButton = screen.getByLabelText('Retry export');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockOnExportWithError).toHaveBeenCalledTimes(2);
      });
    });

    it('shows retry count and limits retries to 3', async () => {
      const mockOnExportWithError = jest.fn().mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportWithError}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText('Export failed: Network error')).toBeInTheDocument();
      });

      // First retry
      let retryButton = screen.getByLabelText('Retry export');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Retry attempt 1 of 3/)).toBeInTheDocument();
      });

      // Second retry
      retryButton = screen.getByLabelText('Retry export');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Retry attempt 2 of 3/)).toBeInTheDocument();
      });

      // Third retry
      retryButton = screen.getByLabelText('Retry export');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText(/Retry attempt 3 of 3/)).toBeInTheDocument();
        // Retry button should be gone after 3 attempts
        expect(screen.queryByLabelText('Retry export')).not.toBeInTheDocument();
      });
    });
  });

  describe('Success Notifications', () => {
    it('shows success notification when export completes', async () => {
      const mockOnExportSuccess = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportSuccess}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByText('Export PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(screen.getByText('Trial balance exported successfully as PDF')).toBeInTheDocument();
      });
    });

    it('shows success notification with correct format for CSV export', async () => {
      const mockOnExportSuccess = jest.fn().mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExportSuccess}
            isExporting={false}
          />
        </TestWrapper>
      );

      const csvButton = screen.getByText('Export CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(screen.getByText('Trial balance exported successfully as CSV')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for icon buttons in compact mode', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
            variant="compact"
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Export as PDF')).toBeInTheDocument();
      expect(screen.getByLabelText('Export as CSV')).toBeInTheDocument();
    });

    it('has proper role for progress bar', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={true}
            exportProgress={50}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has proper button roles and states', () => {
      render(
        <TestWrapper>
          <ExportOptions
            onExport={mockOnExport}
            isExporting={false}
          />
        </TestWrapper>
      );

      const pdfButton = screen.getByRole('button', { name: /export pdf/i });
      const csvButton = screen.getByRole('button', { name: /export csv/i });

      expect(pdfButton).toBeInTheDocument();
      expect(csvButton).toBeInTheDocument();
      expect(pdfButton).not.toBeDisabled();
      expect(csvButton).not.toBeDisabled();
    });
  });
});