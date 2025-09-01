# Journal Entry Management System - Design Document

## 🏗️ Architecture Overview

### System Architecture
The Journal Entry Management System follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Next.js)                │
├─────────────────────────────────────────────────────────────┤
│  • Journal Entries Page Component                          │
│  • Filter Components                                       │
│  • Data Table Component                                    │
│  • Export Modal Component                                  │
│  • Service Layer (API calls)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  • Authentication & Authorization                          │
│  • Rate Limiting                                           │
│  • Request/Response Logging                                │
│  • CORS Configuration                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Layer (.NET Core)                 │
├─────────────────────────────────────────────────────────────┤
│  • JournalEntryController                                  │
│  • JournalEntryService                                     │
│  • JournalEntryRepository                                  │
│  • DTOs and Validation                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  • Entity Framework Core                                   │
│  • PostgreSQL Database                                     │
│  • Query Optimization                                      │
│  • Connection Pooling                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Models and Schema

### Database Schema
```sql
-- Existing JournalEntry table (enhanced)
CREATE TABLE JournalEntries (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    JournalNumber VARCHAR(50) NOT NULL,
    TransactionDate TIMESTAMP NOT NULL,
    JournalType INTEGER NOT NULL, -- Enum: General, Sales, Purchase, etc.
    ReferenceNumber VARCHAR(50) NOT NULL,
    Description TEXT,
    TotalDebit DECIMAL(18,2) NOT NULL DEFAULT 0,
    TotalCredit DECIMAL(18,2) NOT NULL DEFAULT 0,
    Status INTEGER NOT NULL DEFAULT 0, -- Enum: Draft, Posted, Approved, Reversed
    TransactionStatus INTEGER NOT NULL DEFAULT 0, -- Enum: Draft, Pending, Completed, etc.
    CreatedByUserId UUID NOT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    UpdatedAt TIMESTAMP,
    ApprovedByUserId UUID,
    ApprovedAt TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_journal_entries_date ON JournalEntries(TransactionDate);
CREATE INDEX idx_journal_entries_status ON JournalEntries(Status);
CREATE INDEX idx_journal_entries_type ON JournalEntries(JournalType);
CREATE INDEX idx_journal_entries_created_by ON JournalEntries(CreatedByUserId);
```

### Entity Models
```csharp
// Enhanced JournalEntry model
public class JournalEntry
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(50)]
    public string JournalNumber { get; set; } = string.Empty;

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    public JournalType JournalType { get; set; }

    [Required]
    [MaxLength(50)]
    public string ReferenceNumber { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDebit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalCredit { get; set; }

    public JournalStatus Status { get; set; } = JournalStatus.Draft;

    public TransactionStatus TransactionStatus { get; set; } = TransactionStatus.Draft;

    [ForeignKey("CreatedBy")]
    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("ApprovedBy")]
    public Guid? ApprovedByUserId { get; set; }

    public DateTime? ApprovedAt { get; set; }

    // Navigation properties
    public virtual ICollection<JournalEntryLine> JournalEntryLines { get; set; } = new List<JournalEntryLine>();
    public virtual ApplicationUser CreatedBy { get; set; } = null!;
    public virtual ApplicationUser? ApprovedBy { get; set; }
}
```

## 🔌 API Contracts

### Journal Entry Management API

#### 1. Get Journal Entries (Paginated)
```http
GET /api/journalentries?page=1&limit=20&dateFrom=2024-01-01&dateTo=2024-12-31&type=All&amountMin=0&amountMax=10000&category=&referenceNumber=&contactName=&description=&status=All&sortBy=TransactionDate&sortOrder=desc
```

**Request Parameters:**
```typescript
interface GetJournalEntriesRequest {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  dateFrom?: string;       // ISO date string
  dateTo?: string;         // ISO date string
  type?: 'All' | 'Credit' | 'Debit';
  amountMin?: number;
  amountMax?: number;
  category?: string;
  referenceNumber?: string;
  contactName?: string;
  description?: string;
  status?: 'All' | 'Draft' | 'Posted' | 'Approved' | 'Reversed';
  sortBy?: 'TransactionDate' | 'Amount' | 'Type' | 'Category' | 'ReferenceNumber';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface GetJournalEntriesResponse {
  success: boolean;
  data: {
    entries: JournalEntryDisplay[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEntries: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary: {
      totalDebits: number;
      totalCredits: number;
      balance: number;
      entryCount: number;
    };
  };
  message?: string;
}
```

#### 2. Export Journal Entries
```http
POST /api/journalentries/export
```

**Request Body:**
```typescript
interface ExportJournalEntriesRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters: GetJournalEntriesRequest;
  includeDetails: boolean;
  dateFormat: string;
  currencyFormat: string;
}
```

### Data Transfer Objects (DTOs)

#### Journal Entry Display DTO
```csharp
public class JournalEntryDisplayDto
{
    public string Id { get; set; } = string.Empty;
    public string JournalNumber { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public string Type { get; set; } = string.Empty; // "Credit" or "Debit"
    public string CategoryName { get; set; } = string.Empty;
    public string Particulars { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string FormattedAmount => Amount.ToString("C2");
    public string FormattedDate => TransactionDate.ToString("MMM dd, yyyy");
}
```

## 🎨 User Interface Design

### Component Structure
```
JournalEntriesPage
├── ServiceStatusBanner
├── BreadcrumbNavigation
├── PageHeader
│   ├── Title and Description
│   └── Action Buttons (Export, Print, Refresh)
├── FilterSection
│   ├── DateRangeFilter
│   ├── TransactionTypeFilter
│   ├── AmountRangeFilter
│   ├── CategoryFilter
│   ├── ReferenceFilter
│   ├── ContactFilter
│   ├── DescriptionFilter
│   └── StatusFilter
├── SearchSection
│   ├── GlobalSearchInput
│   └── QuickFilters
├── JournalEntriesTable
│   ├── TableHeader (Sortable Columns)
│   ├── TableBody (Paginated Rows)
│   └── TableFooter (Pagination Controls)
├── SummarySection
│   ├── TotalEntries
│   ├── TotalDebits
│   ├── TotalCredits
│   └── Balance
└── ExportModal
    ├── FormatSelection
    ├── FilterOptions
    └── ExportButton
```

### Responsive Design Breakpoints
```css
/* Mobile First Approach */
@media (max-width: 600px) {
  /* Stack filters vertically */
  /* Single column table */
  /* Collapsible sections */
}

@media (min-width: 601px) and (max-width: 960px) {
  /* Two column filter layout */
  /* Compact table with horizontal scroll */
}

@media (min-width: 961px) {
  /* Full desktop layout */
  /* All filters visible */
  /* Full table with all columns */
}
```

## 🔒 Security Measures

### Authentication & Authorization
```csharp
[Authorize]
[RequirePermission("JournalEntry", "View")]
public class JournalEntryController : ControllerBase
{
    // Controller methods
}
```

### Input Validation
```csharp
public class GetJournalEntriesRequestValidator : AbstractValidator<GetJournalEntriesRequest>
{
    public GetJournalEntriesRequestValidator()
    {
        RuleFor(x => x.page)
            .GreaterThan(0)
            .WithMessage("Page number must be greater than 0");

        RuleFor(x => x.limit)
            .InclusiveBetween(1, 100)
            .WithMessage("Limit must be between 1 and 100");

        RuleFor(x => x.dateFrom)
            .Must(BeValidDate)
            .When(x => !string.IsNullOrEmpty(x.dateFrom))
            .WithMessage("Invalid date format");
    }
}
```

## 🚀 Performance Optimization

### Database Optimization
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_journal_entries_composite 
ON JournalEntries(TransactionDate, Status, JournalType);

-- Partitioning for large datasets
CREATE TABLE JournalEntries_2024 PARTITION OF JournalEntries
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Query Optimization
```csharp
// Efficient pagination with proper indexing
public async Task<JournalEntriesResponse> GetJournalEntriesAsync(GetJournalEntriesRequest request)
{
    var query = _context.JournalEntries
        .Include(je => je.JournalEntryLines.Take(1)) // Only first line for list view
        .ThenInclude(jel => jel.Account)
        .AsNoTracking() // Read-only optimization
        .AsQueryable();

    // Apply filters
    query = ApplyFilters(query, request);

    // Get total count efficiently
    var totalCount = await query.CountAsync();

    // Get paginated results
    var entries = await query
        .OrderByDescending(je => je.TransactionDate)
        .Skip((request.page - 1) * request.limit)
        .Take(request.limit)
        .Select(je => new JournalEntryDisplayDto
        {
            Id = je.Id.ToString(),
            JournalNumber = je.JournalNumber,
            TransactionDate = je.TransactionDate,
            // ... other properties
        })
        .ToListAsync();

    return new JournalEntriesResponse
    {
        Entries = entries,
        Pagination = new PaginationInfo
        {
            CurrentPage = request.page,
            TotalPages = (int)Math.Ceiling((double)totalCount / request.limit),
            TotalEntries = totalCount,
            PageSize = request.limit
        }
    };
}
```

## 📦 Deployment Plan

### Docker Configuration
```dockerfile
# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["GarmentsERP.API/GarmentsERP.API.csproj", "GarmentsERP.API/"]
RUN dotnet restore "GarmentsERP.API/GarmentsERP.API.csproj"
COPY . .
WORKDIR "/src/GarmentsERP.API"
RUN dotnet build "GarmentsERP.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GarmentsERP.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GarmentsERP.API.dll"]
```

## 📋 Implementation Checklist

### Backend Implementation
- [ ] Create JournalEntryController with all required endpoints
- [ ] Implement JournalEntryService with business logic
- [ ] Create DTOs for request/response models
- [ ] Add input validation using FluentValidation
- [ ] Implement caching strategy with Redis
- [ ] Add comprehensive logging and error handling
- [ ] Create database migrations for any schema changes
- [ ] Write unit and integration tests
- [ ] Add authentication and authorization middleware

### Frontend Implementation
- [ ] Create JournalEntriesPage component
- [ ] Implement filter components (DateRange, Type, Amount, etc.)
- [ ] Create JournalEntriesTable component with pagination
- [ ] Add search functionality with debouncing
- [ ] Implement export modal for CSV/Excel/PDF
- [ ] Add responsive design for mobile/tablet
- [ ] Create service layer for API calls
- [ ] Add error handling and loading states
- [ ] Write component tests
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### Security Implementation
- [ ] Implement role-based access control
- [ ] Add input validation and sanitization
- [ ] Set up audit logging for all operations
- [ ] Configure CORS policies
- [ ] Implement rate limiting
- [ ] Add SQL injection prevention measures

### Performance Implementation
- [ ] Implement query optimization
- [ ] Add caching layers (Redis, memory)
- [ ] Set up database connection pooling
- [ ] Configure CDN for static assets
- [ ] Implement lazy loading for large datasets
- [ ] Add performance monitoring and alerting
