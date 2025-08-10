# Design Document

## Overview

The Trial Balance Reporting feature provides comprehensive financial reporting capabilities by calculating and displaying the net balance of all credit and debit transactions within specified date ranges. The system follows standard accounting principles where debits are represented as negative values and credits as positive values, with a final mathematical calculation showing the trial balance total.

## Architecture

### Frontend Architecture
```
Trial Balance Module
├── Pages
│   ├── TrialBalancePage.tsx (Main report interface)
│   └── TrialBalanceComparisonPage.tsx (Period comparison)
├── Components
│   ├── TrialBalanceReport.tsx (Report display)
│   ├── DateRangeSelector.tsx (Date selection)
│   ├── AccountCategorySection.tsx (Collapsible categories)
│   ├── TrialBalanceCalculation.tsx (Mathematical expression display)
│   ├── ExportOptions.tsx (PDF/CSV export)
│   └── AccountDrillDown.tsx (Transaction details modal)
├── Services
│   ├── trialBalanceService.ts (API communication)
│   └── trialBalanceExportService.ts (Export functionality)
└── Types
    └── trialBalanceTypes.ts (TypeScript interfaces)
```

### Backend Architecture
```
Trial Balance API
├── Controllers
│   └── TrialBalanceController.cs
├── Services
│   ├── TrialBalanceService.cs (Business logic)
│   ├── TrialBalanceCalculationService.cs (Mathematical calculations)
│   └── TrialBalanceExportService.cs (Export generation)
├── DTOs
│   ├── TrialBalanceRequestDto.cs
│   ├── TrialBalanceResponseDto.cs
│   ├── AccountBalanceDto.cs
│   └── TrialBalanceComparisonDto.cs
└── Models
    └── TrialBalanceCalculation.cs
```

## Components and Interfaces

### Frontend Components

#### TrialBalancePage.tsx
Main page component that orchestrates the trial balance reporting interface.

**Props:**
```typescript
interface TrialBalancePageProps {
  defaultDateRange?: DateRange;
  userRole: 'Admin' | 'Manager' | 'Employee';
}
```

**Key Features:**
- Date range selection with validation
- Role-based access control for features
- Loading states and error handling
- Integration with export functionality

#### TrialBalanceReport.tsx
Core component that displays the calculated trial balance data.

**Props:**
```typescript
interface TrialBalanceReportProps {
  data: TrialBalanceData;
  showCalculationDetails: boolean;
  onAccountClick: (accountId: string) => void;
  groupByCategory: boolean;
}
```

**Key Features:**
- Categorized account display (Assets, Liabilities, Equity, Income, Expenses)
- Display of category descriptions and transaction particulars for each entry
- Mathematical calculation display (e.g., "1000 - 1100 + 11000 - 1000 = 9900")
- Collapsible category sections
- Click-through to account details

#### DateRangeSelector.tsx
Reusable component for selecting date ranges with validation.

**Props:**
```typescript
interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
  maxRange?: number; // Maximum days allowed
  presets?: DateRangePreset[];
}
```

#### AccountDrillDown.tsx
Modal component for displaying detailed transaction information.

**Props:**
```typescript
interface AccountDrillDownProps {
  accountId: string;
  accountName: string;
  dateRange: DateRange;
  isOpen: boolean;
  onClose: () => void;
}
```

### Backend Services

#### TrialBalanceService.cs
Main service handling trial balance business logic.

**Key Methods:**
```csharp
public async Task<TrialBalanceResponseDto> GenerateTrialBalanceAsync(TrialBalanceRequestDto request)
public async Task<List<AccountBalanceDto>> GetAccountBalancesAsync(DateTime startDate, DateTime endDate)
public async Task<TrialBalanceComparisonDto> ComparePeriodsAsync(DateRange period1, DateRange period2)
```

#### TrialBalanceCalculationService.cs
Service responsible for mathematical calculations and balance computations.

**Key Methods:**
```csharp
public TrialBalanceCalculation CalculateTrialBalance(List<TransactionDto> transactions)
public string GenerateCalculationExpression(List<TransactionDto> transactions)
public decimal ComputeFinalBalance(List<TransactionDto> transactions)
```

## Data Models

### Frontend Types

```typescript
interface TrialBalanceData {
  dateRange: DateRange;
  categories: AccountCategory[];
  totalDebits: number;
  totalCredits: number;
  finalBalance: number;
  calculationExpression: string;
  generatedAt: Date;
}

interface AccountCategory {
  name: 'Assets' | 'Liabilities' | 'Equity' | 'Income' | 'Expenses';
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

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface TrialBalanceComparison {
  period1: TrialBalanceData;
  period2: TrialBalanceData;
  variances: AccountVariance[];
}

interface AccountVariance {
  accountId: string;
  accountName: string;
  period1Balance: number;
  period2Balance: number;
  absoluteChange: number;
  percentageChange: number;
}
```

### Backend DTOs

```csharp
public class TrialBalanceRequestDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool GroupByCategory { get; set; } = true;
    public bool IncludeZeroBalances { get; set; } = false;
    public List<string> CategoryFilter { get; set; } = new();
}

public class TrialBalanceResponseDto
{
    public DateRange DateRange { get; set; }
    public List<AccountCategoryDto> Categories { get; set; }
    public decimal TotalDebits { get; set; }
    public decimal TotalCredits { get; set; }
    public decimal FinalBalance { get; set; }
    public string CalculationExpression { get; set; }
    public DateTime GeneratedAt { get; set; }
    public int TotalTransactions { get; set; }
}

public class AccountBalanceDto
{
    public Guid AccountId { get; set; }
    public string AccountName { get; set; }
    public string CategoryName { get; set; }
    public string CategoryDescription { get; set; }
    public string Particulars { get; set; } // Transaction description/particulars
    public decimal DebitAmount { get; set; } // Negative values
    public decimal CreditAmount { get; set; } // Positive values
    public decimal NetBalance { get; set; }
    public int TransactionCount { get; set; }
}
```

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display retry options with exponential backoff
- **Validation Errors**: Real-time validation for date ranges and inputs
- **Data Loading Errors**: Graceful fallback with error messages
- **Export Errors**: User-friendly error messages with troubleshooting tips

### Backend Error Handling
- **Invalid Date Ranges**: Return 400 Bad Request with specific error messages
- **Database Errors**: Log errors and return 500 Internal Server Error
- **Permission Errors**: Return 403 Forbidden for unauthorized access
- **Large Dataset Handling**: Implement pagination and timeout handling

## Testing Strategy

### Frontend Testing
```typescript
// Unit Tests
describe('TrialBalanceCalculation', () => {
  it('should calculate correct trial balance with mixed transactions', () => {
    const transactions = [
      { type: 'credit', amount: 1000 },
      { type: 'debit', amount: 1100 },
      { type: 'credit', amount: 11000 },
      { type: 'debit', amount: 1000 }
    ];
    expect(calculateTrialBalance(transactions)).toBe(9900);
  });
});

// Integration Tests
describe('TrialBalanceReport Integration', () => {
  it('should load and display trial balance data correctly', async () => {
    // Test component integration with API
  });
});
```

### Backend Testing
```csharp
[Test]
public async Task GenerateTrialBalance_WithValidDateRange_ReturnsCorrectCalculation()
{
    // Arrange
    var request = new TrialBalanceRequestDto
    {
        StartDate = new DateTime(2024, 1, 1),
        EndDate = new DateTime(2024, 1, 31)
    };

    // Act
    var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);

    // Assert
    Assert.That(result.FinalBalance, Is.EqualTo(expectedBalance));
    Assert.That(result.CalculationExpression, Contains.Substring("="));
}

[Test]
public void CalculateTrialBalance_WithMixedTransactions_ReturnsCorrectSum()
{
    // Test the mathematical calculation logic
    var transactions = CreateTestTransactions();
    var result = _calculationService.CalculateTrialBalance(transactions);
    
    Assert.That(result.FinalBalance, Is.EqualTo(9900));
    Assert.That(result.Expression, Is.EqualTo("1000 - 1100 + 11000 - 1000 = 9900"));
}
```

### API Endpoint Testing
- **Load Testing**: Verify performance with large datasets (10,000+ transactions)
- **Security Testing**: Ensure proper role-based access control
- **Data Integrity Testing**: Verify calculation accuracy across different scenarios
- **Export Testing**: Validate PDF and CSV generation functionality

## Performance Considerations

### Database Optimization
- **Indexing**: Create indexes on transaction date, account_id, and amount columns
- **Query Optimization**: Use efficient SQL queries with proper joins and aggregations
- **Caching**: Implement Redis caching for frequently accessed trial balance data
- **Pagination**: Implement cursor-based pagination for large result sets

### Frontend Optimization
- **Virtual Scrolling**: For large account lists to maintain smooth UI performance
- **Lazy Loading**: Load account details on-demand when drilling down
- **Memoization**: Cache calculation results to avoid unnecessary re-computations
- **Progressive Loading**: Show summary first, then load detailed breakdowns

### Export Performance
- **Background Processing**: Generate large exports asynchronously
- **Streaming**: Stream large CSV files to avoid memory issues
- **Compression**: Compress exported files to reduce download time
- **Progress Indicators**: Show export progress for large datasets

## Security Considerations

### Role-Based Access Control
```csharp
[Authorize(Roles = "Admin,Manager")]
[HttpGet("trial-balance")]
public async Task<ActionResult<TrialBalanceResponseDto>> GetTrialBalance(TrialBalanceRequestDto request)

[Authorize(Roles = "Admin")]
[HttpGet("trial-balance/comparison")]
public async Task<ActionResult<TrialBalanceComparisonDto>> CompareTrialBalances(ComparisonRequestDto request)
```

### Data Protection
- **Input Validation**: Sanitize all date inputs and parameters
- **SQL Injection Prevention**: Use parameterized queries and Entity Framework
- **Data Encryption**: Encrypt sensitive financial data in transit and at rest
- **Audit Logging**: Log all trial balance generation and export activities

## Integration Points

### Existing System Integration
- **Cash Book Entry System**: Source of transaction data for trial balance calculations
- **User Management System**: Role-based access control and permissions
- **Export System**: Leverage existing PDF/CSV export infrastructure
- **Audit System**: Integration with existing audit logging mechanisms

### External Integrations
- **Accounting Software**: Potential future integration with external accounting systems
- **Reporting Tools**: Integration with business intelligence and reporting platforms
- **Email System**: Automated report delivery via email
- **File Storage**: Cloud storage integration for large export files