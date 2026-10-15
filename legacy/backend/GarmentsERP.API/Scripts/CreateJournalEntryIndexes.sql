-- Journal Entry Database Indexes for Performance Optimization
-- This script creates indexes to improve query performance for journal entries

-- 1. Composite index for filtering by date range and status
CREATE INDEX IF NOT EXISTS IX_JournalEntry_DateRange_Status 
ON "JournalEntries" ("EntryDate", "Status");

-- 2. Index for filtering by reference number (for search functionality)
CREATE INDEX IF NOT EXISTS IX_JournalEntry_ReferenceNumber 
ON "JournalEntries" ("ReferenceNumber");

-- 3. Index for filtering by contact
CREATE INDEX IF NOT EXISTS IX_JournalEntry_ContactId 
ON "JournalEntries" ("ContactId");

-- 4. Index for filtering by entry type
CREATE INDEX IF NOT EXISTS IX_JournalEntry_EntryType 
ON "JournalEntries" ("EntryType");

-- 5. Index for filtering by amount range
CREATE INDEX IF NOT EXISTS IX_JournalEntry_TotalAmount 
ON "JournalEntries" ("TotalAmount");

-- 6. Composite index for sorting by date and amount
CREATE INDEX IF NOT EXISTS IX_JournalEntry_Date_Amount 
ON "JournalEntries" ("EntryDate", "TotalAmount");

-- 7. Index for journal entry lines by account (for category filtering)
CREATE INDEX IF NOT EXISTS IX_JournalEntryLine_AccountId 
ON "JournalEntryLines" ("AccountId");

-- 8. Index for journal entry lines by journal entry (for efficient joins)
CREATE INDEX IF NOT EXISTS IX_JournalEntryLine_JournalEntryId 
ON "JournalEntryLines" ("JournalEntryId");

-- 9. Index for filtering by description (for search functionality)
CREATE INDEX IF NOT EXISTS IX_JournalEntryLine_Description 
ON "JournalEntryLines" ("Description");

-- 10. Composite index for efficient line filtering
CREATE INDEX IF NOT EXISTS IX_JournalEntryLine_Entry_Account 
ON "JournalEntryLines" ("JournalEntryId", "AccountId");

-- 11. Index for audit trail queries
CREATE INDEX IF NOT EXISTS IX_JournalEntryAuditLog_EntryId_Date 
ON "JournalEntryAuditLogs" ("JournalEntryId", "ChangeDate");

-- 12. Index for user queries (for filtering by created/modified by)
CREATE INDEX IF NOT EXISTS IX_JournalEntry_CreatedBy 
ON "JournalEntries" ("CreatedBy");

CREATE INDEX IF NOT EXISTS IX_JournalEntry_ModifiedBy 
ON "JournalEntries" ("ModifiedBy");

-- 13. Index for company filtering (multi-tenant support)
CREATE INDEX IF NOT EXISTS IX_JournalEntry_CompanyId 
ON "JournalEntries" ("CompanyId");

-- 14. Partial index for active entries only (if status is limited)
CREATE INDEX IF NOT EXISTS IX_JournalEntry_ActiveOnly 
ON "JournalEntries" ("EntryDate", "TotalAmount") 
WHERE "Status" = 'Active';

-- 15. Index for efficient pagination with date sorting
CREATE INDEX IF NOT EXISTS IX_JournalEntry_Pagination 
ON "JournalEntries" ("EntryDate" DESC, "Id");

-- Display index information
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('JournalEntries', 'JournalEntryLines', 'JournalEntryAuditLogs')
ORDER BY tablename, indexname;
