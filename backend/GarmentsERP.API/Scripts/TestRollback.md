# Migration Rollback Testing Guide

This document provides instructions for testing the rollback scenario for the Categories table migration.

## Prerequisites

1. PostgreSQL database running
2. EF Core tools installed (`dotnet tool install --global dotnet-ef`)
3. Connection string configured in appsettings.Development.json

## Rollback Test Steps

### 1. Check Current Migration Status

```bash
# Navigate to the API project directory
cd backend/GarmentsERP.API

# Check current migration status
dotnet ef migrations list
```

### 2. Apply All Migrations (if not already applied)

```bash
# Apply all migrations to ensure we're at the latest state
dotnet ef database update
```

### 3. Verify Categories Table Exists

```bash
# Connect to PostgreSQL and verify table exists
psql -h localhost -U postgres -d GarmentsERP_Dev -c "\dt Categories"
```

### 4. Test Rollback to Before Categories

```bash
# Rollback to the migration before AddCategoriesTable
dotnet ef database update 20250721181616_EnhancedDynamicAccounting
```

### 5. Verify Categories Table is Removed

```bash
# Verify table no longer exists
psql -h localhost -U postgres -d GarmentsERP_Dev -c "\dt Categories"
```

### 6. Test Rollback of Performance Indexes Only

```bash
# First, apply the Categories table migration
dotnet ef database update 20250725182027_AddCategoriesTable

# Then rollback just the performance indexes
dotnet ef database update 20250725182027_AddCategoriesTable
```

### 7. Verify Indexes are Removed but Table Remains

```bash
# Check that table exists but performance indexes are gone
psql -h localhost -U postgres -d GarmentsERP_Dev -c "
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Categories';"
```

### 8. Re-apply All Migrations

```bash
# Apply all migrations back to current state
dotnet ef database update
```

### 9. Final Verification

```bash
# Verify everything is back to normal
psql -h localhost -U postgres -d GarmentsERP_Dev -c "
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'Categories') as column_count,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'Categories') as index_count
FROM information_schema.tables 
WHERE table_name = 'Categories';"
```

## Expected Results

### After Step 4 (Rollback Categories):
- Categories table should not exist
- All category-related indexes should be removed
- JournalEntryLines.ContactId column should be removed

### After Step 6 (Rollback Performance Indexes):
- Categories table should exist
- Only the unique index on Name+Type should remain
- Performance indexes (Type, IsActive, Name) should be removed

### After Step 8 (Re-apply All):
- Categories table should exist with all columns
- All indexes should be present:
  - Primary key on Id
  - Unique index on Name+Type
  - Performance indexes on Type, IsActive, Name

## Troubleshooting

### If rollback fails:
1. Check for foreign key constraints that might prevent rollback
2. Ensure no data exists in Categories table that would prevent rollback
3. Check migration history: `SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId";`

### If re-applying migrations fails:
1. Check database connection
2. Verify migration files exist in Migrations folder
3. Check for any manual database changes that conflict with migrations

## Rollback Safety Notes

⚠️ **Warning**: Rolling back migrations in production should be done with extreme caution:

1. **Backup First**: Always backup the database before rollback
2. **Data Loss**: Rolling back will delete the Categories table and all data
3. **Dependencies**: Check for any foreign key references before rollback
4. **Application Impact**: Ensure the application can handle the missing table gracefully

## Migration Files Involved

1. `20250725182027_AddCategoriesTable.cs` - Creates Categories table and unique constraint
2. `20250725182104_AddCategoryPerformanceIndexes.cs` - Adds performance indexes

Both migrations have proper `Up()` and `Down()` methods for forward and rollback operations.