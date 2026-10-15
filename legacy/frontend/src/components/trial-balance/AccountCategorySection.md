# AccountCategorySection Component

A React component that displays a collapsible section for a specific account category in the trial balance report. Each category (Assets, Liabilities, Equity, Income, Expenses) is displayed with its accounts in a structured table format.

## Features

- **Collapsible Design**: Click on category headers to expand/collapse account details
- **Category-Specific Styling**: Each category has distinct colors and icons
- **Account Details Table**: Shows account names, descriptions, particulars, and amounts
- **Amount Formatting**: Debits shown as negative (red), credits as positive (green)
- **Subtotal Calculations**: Displays calculated subtotal for each category
- **Smooth Animations**: CSS transitions for expand/collapse actions
- **Click Handlers**: Account rows are clickable for drill-down navigation
- **Zero Balance Filtering**: Option to show/hide accounts with zero balances
- **Transaction Count**: Shows number of transactions per account
- **Responsive Design**: Adapts to different screen sizes

## Props

```typescript
interface AccountCategorySectionProps {
  category: AccountCategory;
  onAccountClick: (accountId: string, accountName: string) => void;
  showZeroBalances?: boolean;
  defaultExpanded?: boolean;
}
```

### Props Description

- `category`: The account category data containing accounts and subtotal
- `onAccountClick`: Callback function when an account row is clicked
- `showZeroBalances`: Whether to show accounts with zero net balance (default: false)
- `defaultExpanded`: Whether the category should be expanded by default (default: false)

## Usage

```tsx
import { AccountCategorySection } from '@/components/trial-balance';

const handleAccountClick = (accountId: string, accountName: string) => {
  // Handle account drill-down navigation
  console.log('Account clicked:', { accountId, accountName });
};

<AccountCategorySection
  category={assetsCategory}
  onAccountClick={handleAccountClick}
  showZeroBalances={false}
  defaultExpanded={true}
/>
```

## Data Structure

The component expects an `AccountCategory` object with the following structure:

```typescript
interface AccountCategory {
  name: AccountCategoryType; // 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses'
  accounts: AccountBalance[];
  subtotal: number;
}

interface AccountBalance {
  accountId: string;
  accountName: string;
  categoryDescription: string;
  particulars: string; // Transaction description/particulars
  debitAmount: number; // Always negative for debits
  creditAmount: number; // Always positive for credits
  netBalance: number;
  transactionCount: number;
}
```

## Visual Design

### Category Colors
- **Assets**: Green (success color)
- **Liabilities**: Red (error color)
- **Equity**: Blue (primary color)
- **Income**: Cyan (info color)
- **Expenses**: Orange (warning color)

### Category Icons
- **Assets**: TrendingUpIcon
- **Liabilities**: TrendingDownIcon
- **Equity**: AccountBalanceIcon
- **Income**: TrendingUpIcon
- **Expenses**: TrendingDownIcon

### Amount Formatting
- **Positive amounts**: Green color, no parentheses
- **Negative amounts**: Red color, wrapped in parentheses
- **Zero amounts**: Gray color, displayed as dash (-)

## Interactions

1. **Category Header Click**: Expands/collapses the category section
2. **Account Row Click**: Triggers `onAccountClick` callback for drill-down
3. **Hover Effects**: Account rows have hover animations
4. **Responsive Behavior**: Table adapts to screen size

## Accessibility

- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly structure
- High contrast color scheme
- Semantic HTML structure

## Testing

The component includes comprehensive tests covering:
- Rendering with correct data
- Expand/collapse functionality
- Account click handlers
- Zero balance filtering
- Amount formatting
- Category-specific styling
- Error handling for edge cases

Run tests with:
```bash
npm test -- AccountCategorySection.test.tsx
```

## Requirements Fulfilled

This component fulfills the following requirements from the trial balance reporting specification:

- **2.1**: Groups accounts by categories with collapsible sections
- **2.2**: Displays account names, category descriptions, particulars, and amounts
- **2.3**: Shows debit (negative) and credit (positive) amounts with proper formatting
- **6.1**: Provides click handlers for account drill-down navigation

## Performance Considerations

- Uses React.memo for optimization (if needed)
- Efficient filtering of zero balance accounts
- Smooth CSS animations without JavaScript
- Minimal re-renders through proper state management