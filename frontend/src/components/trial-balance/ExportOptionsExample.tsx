import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Stack, Alert } from '@mui/material';
import ExportOptions from './ExportOptions';
import { ExportFormat, TrialBalanceData, AccountCategoryType } from '../../types/trialBalance';
import { trialBalanceExportService } from '../../services/trialBalanceExportService';

/**
 * ExportOptions Component Example
 * 
 * This example demonstrates how to integrate the ExportOptions component
 * with the trial balance export service and handle various export scenarios.
 */
export const ExportOptionsExample: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);


  // Mock trial balance data for demonstration
  const mockTrialBalanceData: TrialBalanceData = {
    dateRange: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    },
    categories: [
      {
        name: AccountCategoryType.ASSETS,
        subtotal: 15000,
        accounts: [
          {
            accountId: '1',
            accountName: 'Cash',
            categoryDescription: 'Current Assets',
            particulars: 'Cash on hand and in bank',
            debitAmount: 0,
            creditAmount: 10000,
            netBalance: 10000,
            transactionCount: 5
          },
          {
            accountId: '2',
            accountName: 'Accounts Receivable',
            categoryDescription: 'Current Assets',
            particulars: 'Customer receivables',
            debitAmount: 0,
            creditAmount: 5000,
            netBalance: 5000,
            transactionCount: 3
          }
        ]
      },
      {
        name: AccountCategoryType.LIABILITIES,
        subtotal: -8000,
        accounts: [
          {
            accountId: '3',
            accountName: 'Accounts Payable',
            categoryDescription: 'Current Liabilities',
            particulars: 'Supplier payables',
            debitAmount: -8000,
            creditAmount: 0,
            netBalance: -8000,
            transactionCount: 4
          }
        ]
      }
    ],
    totalDebits: -8000,
    totalCredits: 15000,
    finalBalance: 7000,
    calculationExpression: '10000 + 5000 - 8000 = 7000',
    generatedAt: new Date(),
    totalTransactions: 12
  };

  // Simulate export progress
  const simulateProgress = (): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          setExportProgress(progress);
          clearInterval(interval);
          setTimeout(resolve, 500); // Small delay to show 100% completion
        } else {
          setExportProgress(progress);
        }
      }, 200);
    });
  };

  const handleExport = async (
    format: ExportFormat,
    options?: {
      includeCalculationDetails?: boolean;
      includeZeroBalances?: boolean;
      customFilename?: string;
    }
  ) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      await simulateProgress();

      // Perform actual export
      await trialBalanceExportService.exportTrialBalance(
        mockTrialBalanceData,
        format,
        options
      );

      console.log(`Export completed successfully as ${format.toUpperCase()}`);

    } catch (error) {
      throw error; // Re-throw to let ExportOptions handle the error display
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Export Options Component Example
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This example demonstrates the ExportOptions component with different variants
            and export scenarios including progress tracking and error handling.
          </Typography>
        </Box>

        {/* Standard Variant */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Standard Variant
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Full-featured export options with progress tracking and error handling.
          </Typography>

          <ExportOptions
            onExport={handleExport}
            isExporting={isExporting}
            exportProgress={exportProgress}
            showProgress={true}
            variant="standard"
          />
        </Paper>

        {/* Compact Variant */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Compact Variant
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Space-efficient export options with icon buttons and progress chip.
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">Export:</Typography>
            <ExportOptions
              onExport={handleExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
              variant="compact"
            />
          </Box>
        </Paper>

        {/* Disabled State */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Disabled State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export options when disabled (e.g., no data available).
          </Typography>

          <ExportOptions
            onExport={handleExport}
            isExporting={false}
            disabled={true}
            variant="standard"
          />
        </Paper>

        {/* Error Simulation */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Error Handling Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This export will fail to demonstrate error handling and retry functionality.
          </Typography>

          <ExportOptions
            onExport={async (_format) => { // eslint-disable-line @typescript-eslint/no-unused-vars
              setIsExporting(true);
              await new Promise(resolve => setTimeout(resolve, 1000));
              setIsExporting(false);
              throw new Error('Simulated network error - please retry');
            }}
            isExporting={isExporting}
            exportProgress={exportProgress}
            variant="standard"
          />
        </Paper>

        {/* Usage Information */}
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Usage Tips:</strong>
            <br />
            • The standard variant is ideal for dedicated export sections
            <br />
            • The compact variant works well in toolbars or action bars
            <br />
            • Progress tracking provides user feedback during large exports
            <br />
            • Error handling includes automatic retry functionality (up to 3 attempts)
            <br />
            • Success notifications confirm when exports complete successfully
          </Typography>
        </Alert>

        {/* Mock Data Info */}
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> This example uses mock trial balance data for demonstration.
            In a real application, you would pass actual trial balance data from your API.
          </Typography>
        </Alert>
      </Stack>
    </Container>
  );
};

export default ExportOptionsExample;