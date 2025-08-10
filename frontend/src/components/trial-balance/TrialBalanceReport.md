# TrialBalanceReport Component

## Overview

The `TrialBalanceReport` component is the main orchestrating component for the trial balance reporting feature. It integrates all sub-components and provides a comprehensive interface for generating and viewing trial balance reports.

## Features

### Core Functionality
- **Date Range Selection**: Integrated DateRangeSelector for flexible date range selection
- **Account Categories**: Displays categorized account balances using AccountCategorySection
- **Mathematical Calculation**: Shows trial balance calculation using TrialBalanceCalculation
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages with retry functionality
- **Zero Balance Toggle**: Option to show/hide accounts with zero balances
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### User Interface
- **Header Section**: Report title with last updated timestamp
- **Controls**: Toggle switches for zero balances and filters
- **Summary Information**: Key statistics (categories, accounts, transactions, final balance)
- **Account Categories**: Expandable sections for each account category
- **Footer**: Report generation details and settings

### Data Management
- **Automatic Loading**: Loads data on component mount
- **Date Range Validation**: Validates date ranges before API calls
- **State Management**: Manages loading, error, and data states
- **Service Integration**: Uses trialBalanceService for API communication

## Props

```typescript
interface TrialBalanceReportProps {
  defaultDateRange?: DateRange
  onAccountClick?: (accountId: string, accountName: string) => void
  showCalculationDetails?: boolean
  groupByCategory?: boolean
  className?: string
}
```

### Prop Details

- **defaultDateRange**: Optional default date range (defaults to current month)
- **onAccountClick**: Callback for account click events (for drill-down functionality)
- **showCalculationDetails**: Whether to show the mathematical calculation section
- **groupByCategory**: Whether to group accounts by category
- **className**: Additional CSS class for styling

## Usage

### Basic Usage

```tsx
import { TrialBalanceReport } from '@/components/trial-balance/TrialBalanceReport'

function MyPage() {
  const handleAccountClick = (accountId: string, accountName: string) => {
    // Handle account drill-down
    console.log('Account clicked:', { accountId, accountName })
  }

  return (
    <TrialBalanceReport
      onAccountClick={handleAccountClick}
      showCalculationDetails={true}
    />
  )
}
```

### With Custom Date Range

```tsx
import { TrialBalanceReport } from '@/components/trial-balance/TrialBalanceReport'
import { startOfYear, endOfYear } from 'date-fns'

function YearlyReport() {
  const currentYear = new Date()
  const defaultDateRange = {
    startDate: startOfYear(currentYear),
    endDate: endOfYear(currentYear)
  }

  return (
    <TrialBalanceReport
      defaultDateRange={defaultDateRange}
      showCalculationDetails={true}
      groupByCategory={true}
    />
  )
}
```

## State Management

The component manages several internal states:

- **dateRange**: Current selected date range
- **trialBalanceData**: Loaded trial balance data
- **loadingState**: Loading, error, and last updated information
- **showZeroBalances**: Toggle for zero balance accounts
- **expandedCategories**: Set of expanded category names
- **showFilters**: Toggle for additional filters section

## Error Handling

The component provides comprehensive error handling:

- **Validation Errors**: Date range validation with user-friendly messages
- **API Errors**: Network and server error handling with retry functionality
- **Loading States**: Clear loading indicators and skeleton screens
- **Empty States**: Appropriate messaging when no data is available

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **Error Announcements**: Screen reader friendly error messages

## Performance Considerations

- **Memoized Callbacks**: Prevents unnecessary re-renders
- **Efficient State Updates**: Optimized state management
- **Conditional Rendering**: Only renders necessary components
- **Skeleton Loading**: Improves perceived performance

## Integration Points

### Required Dependencies
- DateRangeSelector component
- AccountCategorySection component  
- TrialBalanceCalculation component
- trialBalanceService for API calls
- Material-UI components and theme

### Service Requirements
The component expects the trialBalanceService to provide:
- `generateTrialBalance(dateRange, options)`: Generate trial balance data
- `getDateRangeValidationError(dateRange)`: Validate date ranges

## Testing

The component includes comprehensive tests covering:
- Initial rendering and data loading
- Error handling and retry functionality
- User interactions (toggles, date changes)
- Responsive design and accessibility
- Performance and state management

## Future Enhancements

Potential improvements for future versions:
- Advanced filtering options
- Export functionality integration
- Comparison mode support
- Customizable summary statistics
- Enhanced mobile experience
- Real-time data updates

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **1.4**: Report display with account categories and balances
- **2.5**: User-friendly interface with proper formatting
- **2.6**: Responsive design for desktop and mobile
- **5.2**: Loading states and error handling
- **5.3**: Performance optimization for large datasets