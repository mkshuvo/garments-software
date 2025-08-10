import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TrialBalanceCalculation } from './TrialBalanceCalculation';
import { TrialBalanceData, AccountCategoryType } from '../../types/trialBalance';

// Example data for demonstration
const exampleTrialBalanceData: TrialBalanceData = {
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
          particulars: 'Cash on hand and bank deposits',
          debitAmount: -5000,
          creditAmount: 0,
          netBalance: -5000,
          transactionCount: 12
        },
        {
          accountId: '2',
          accountName: 'Accounts Receivable',
          categoryDescription: 'Current Assets',
          particulars: 'Customer outstanding payments',
          debitAmount: -3000,
          creditAmount: 0,
          netBalance: -3000,
          transactionCount: 8
        }
      ],
      subtotal: -8000
    },
    {
      name: AccountCategoryType.LIABILITIES,
      accounts: [
        {
          accountId: '3',
          accountName: 'Accounts Payable',
          categoryDescription: 'Current Liabilities',
          particulars: 'Supplier payments due',
          debitAmount: 0,
          creditAmount: 2500,
          netBalance: 2500,
          transactionCount: 6
        }
      ],
      subtotal: 2500
    },
    {
      name: AccountCategoryType.EQUITY,
      accounts: [
        {
          accountId: '4',
          accountName: 'Owner Equity',
          categoryDescription: 'Owner&apos;s Equity',
          particulars: 'Initial capital investment',
          debitAmount: 0,
          creditAmount: 10000,
          netBalance: 10000,
          transactionCount: 1
        }
      ],
      subtotal: 10000
    },
    {
      name: AccountCategoryType.INCOME,
      accounts: [
        {
          accountId: '5',
          accountName: 'Sales Revenue',
          categoryDescription: 'Operating Income',
          particulars: 'Product and service sales',
          debitAmount: 0,
          creditAmount: 15000,
          netBalance: 15000,
          transactionCount: 25
        }
      ],
      subtotal: 15000
    },
    {
      name: AccountCategoryType.EXPENSES,
      accounts: [
        {
          accountId: '6',
          accountName: 'Office Expenses',
          categoryDescription: 'Operating Expenses',
          particulars: 'Office supplies and utilities',
          debitAmount: -2000,
          creditAmount: 0,
          netBalance: -2000,
          transactionCount: 15
        },
        {
          accountId: '7',
          accountName: 'Marketing Expenses',
          categoryDescription: 'Operating Expenses',
          particulars: 'Advertising and promotion costs',
          debitAmount: -1500,
          creditAmount: 0,
          netBalance: -1500,
          transactionCount: 8
        }
      ],
      subtotal: -3500
    }
  ],
  totalDebits: -13500,
  totalCredits: 27500,
  finalBalance: 16000,
  calculationExpression: '8000 - 2500 - 10000 - 15000 + 3500 = -16000',
  generatedAt: new Date('2024-01-31T15:30:00Z'),
  totalTransactions: 75
};

export const TrialBalanceCalculationExample: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Trial Balance Calculation Component Examples
      </Typography>
      
      <Typography variant="body1" paragraph>
        The TrialBalanceCalculation component displays the mathematical expression and final result
        of a trial balance calculation. It supports both standard and compact variants, with features
        like expandable detailed breakdown and copy-to-clipboard functionality.
      </Typography>

      {/* Standard Variant */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Standard Variant
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Full-featured display with expandable detailed breakdown showing category totals
          and transaction counts.
        </Typography>
        
        <TrialBalanceCalculation 
          data={exampleTrialBalanceData}
          showDetailedBreakdown={true}
        />
      </Paper>

      {/* Compact Variant */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Compact Variant
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Minimal display suitable for embedding in other components or tight spaces.
        </Typography>
        
        <TrialBalanceCalculation 
          data={exampleTrialBalanceData}
          variant="compact"
        />
      </Paper>

      {/* Without Detailed Breakdown */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Without Detailed Breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Standard variant with detailed breakdown disabled.
        </Typography>
        
        <TrialBalanceCalculation 
          data={exampleTrialBalanceData}
          showDetailedBreakdown={false}
        />
      </Paper>

      {/* Zero Balance Example */}
      <Paper elevation={1} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Zero Balance Example
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Example showing a balanced trial balance (sum equals zero).
        </Typography>
        
        <TrialBalanceCalculation 
          data={{
            ...exampleTrialBalanceData,
            finalBalance: 0,
            calculationExpression: '10000 - 5000 - 3000 - 2000 = 0',
            categories: exampleTrialBalanceData.categories.slice(0, 2) // Simplified for zero balance
          }}
        />
      </Paper>

      {/* Usage Information */}
      <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Usage Notes
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Key Features:</strong>
          <ul>
            <li>Visual formatting with color-coded operators (+ green, - red, = blue)</li>
            <li>Number formatting with thousands separators</li>
            <li>Expandable detailed breakdown by account category</li>
            <li>Copy-to-clipboard functionality for the calculation</li>
            <li>Responsive design that works on desktop and mobile</li>
            <li>Accessibility support with proper ARIA labels</li>
          </ul>
          
          <strong>Props:</strong>
          <ul>
            <li><code>data</code>: TrialBalanceData object containing calculation results</li>
            <li><code>showDetailedBreakdown</code>: Optional boolean to enable/disable detailed view</li>
            <li><code>variant</code>: Optional &apos;standard&apos; | &apos;compact&apos; for different display modes</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
};

export default TrialBalanceCalculationExample;