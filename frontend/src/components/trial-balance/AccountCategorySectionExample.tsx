import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import AccountCategorySection from './AccountCategorySection';
import { AccountCategory, AccountCategoryType } from '../../types/trialBalance';

// Mock data for demonstration
const mockCategories: AccountCategory[] = [
  {
    name: AccountCategoryType.ASSETS,
    subtotal: 25000,
    accounts: [
      {
        accountId: 'asset-1',
        accountName: 'Cash in Hand',
        categoryDescription: 'Current Assets',
        particulars: 'Daily cash transactions and petty cash',
        debitAmount: -3000,
        creditAmount: 8000,
        netBalance: 5000,
        transactionCount: 45
      },
      {
        accountId: 'asset-2',
        accountName: 'Bank Account - Main',
        categoryDescription: 'Current Assets',
        particulars: 'Primary business bank account',
        debitAmount: -5000,
        creditAmount: 25000,
        netBalance: 20000,
        transactionCount: 78
      },
      {
        accountId: 'asset-3',
        accountName: 'Accounts Receivable',
        categoryDescription: 'Current Assets',
        particulars: 'Customer outstanding payments',
        debitAmount: 0,
        creditAmount: 0,
        netBalance: 0,
        transactionCount: 0
      }
    ]
  },
  {
    name: AccountCategoryType.LIABILITIES,
    subtotal: -15000,
    accounts: [
      {
        accountId: 'liability-1',
        accountName: 'Accounts Payable',
        categoryDescription: 'Current Liabilities',
        particulars: 'Supplier and vendor payments',
        debitAmount: 2000,
        creditAmount: -12000,
        netBalance: -10000,
        transactionCount: 32
      },
      {
        accountId: 'liability-2',
        accountName: 'Short-term Loan',
        categoryDescription: 'Current Liabilities',
        particulars: 'Bank loan for working capital',
        debitAmount: 0,
        creditAmount: -5000,
        netBalance: -5000,
        transactionCount: 12
      }
    ]
  },
  {
    name: AccountCategoryType.EQUITY,
    subtotal: 50000,
    accounts: [
      {
        accountId: 'equity-1',
        accountName: 'Owner\'s Capital',
        categoryDescription: 'Owner\'s Equity',
        particulars: 'Initial capital investment',
        debitAmount: 0,
        creditAmount: 50000,
        netBalance: 50000,
        transactionCount: 1
      }
    ]
  },
  {
    name: AccountCategoryType.INCOME,
    subtotal: 35000,
    accounts: [
      {
        accountId: 'income-1',
        accountName: 'Sales Revenue',
        categoryDescription: 'Operating Income',
        particulars: 'Product sales and services',
        debitAmount: -2000,
        creditAmount: 37000,
        netBalance: 35000,
        transactionCount: 156
      }
    ]
  },
  {
    name: AccountCategoryType.EXPENSES,
    subtotal: -20000,
    accounts: [
      {
        accountId: 'expense-1',
        accountName: 'Office Rent',
        categoryDescription: 'Operating Expenses',
        particulars: 'Monthly office space rental',
        debitAmount: -12000,
        creditAmount: 0,
        netBalance: -12000,
        transactionCount: 12
      },
      {
        accountId: 'expense-2',
        accountName: 'Utilities',
        categoryDescription: 'Operating Expenses',
        particulars: 'Electricity, water, and internet',
        debitAmount: -8000,
        creditAmount: 0,
        netBalance: -8000,
        transactionCount: 36
      }
    ]
  }
];

export const AccountCategorySectionExample: React.FC = () => {
  const [showZeroBalances, setShowZeroBalances] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string } | null>(null);

  const handleAccountClick = (accountId: string, accountName: string) => {
    setSelectedAccount({ id: accountId, name: accountName });
    console.log('Account clicked:', { accountId, accountName });
  };

  const handleToggleZeroBalances = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowZeroBalances(event.target.checked);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Account Category Section Examples
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Component Controls
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={showZeroBalances}
              onChange={handleToggleZeroBalances}
              color="primary"
            />
          }
          label="Show Zero Balance Accounts"
        />

        {selectedAccount && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Last clicked account: <strong>{selectedAccount.name}</strong> (ID: {selectedAccount.id})
          </Alert>
        )}
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Trial Balance Categories
      </Typography>

      <Stack spacing={2}>
        {mockCategories.map((category) => (
          <AccountCategorySection
            key={category.name}
            category={category}
            onAccountClick={handleAccountClick}
            showZeroBalances={showZeroBalances}
            defaultExpanded={category.name === AccountCategoryType.ASSETS}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={1} sx={{ p: 3, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Component Features Demonstrated
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mt: 2 }}>
          <strong>✓ Collapsible category sections</strong> - Click on category headers to expand/collapse
          <br />
          <strong>✓ Category-specific icons and colors</strong> - Each category type has distinct visual styling
          <br />
          <strong>✓ Account details display</strong> - Shows account names, descriptions, particulars, and amounts
          <br />
          <strong>✓ Debit/Credit formatting</strong> - Debits shown as negative (red), credits as positive (green)
          <br />
          <strong>✓ Subtotal calculations</strong> - Each category shows calculated subtotal
          <br />
          <strong>✓ Smooth animations</strong> - Expand/collapse with CSS transitions
          <br />
          <strong>✓ Click handlers</strong> - Click on account rows to trigger drill-down navigation
          <br />
          <strong>✓ Zero balance filtering</strong> - Option to show/hide accounts with zero balances
          <br />
          <strong>✓ Transaction count display</strong> - Shows number of transactions per account
          <br />
          <strong>✓ Responsive design</strong> - Adapts to different screen sizes
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccountCategorySectionExample;