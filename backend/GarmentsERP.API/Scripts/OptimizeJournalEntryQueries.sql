-- Journal Entry Query Optimization Script
-- This script provides optimized queries and performance tips

-- 1. Optimized query for getting journal entries with pagination
-- Uses covering indexes and efficient joins
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    je."Id",
    je."EntryDate",
    je."ReferenceNumber",
    je."Description",
    je."TotalAmount",
    je."Status",
    je."EntryType",
    u."UserName" as "CreatedBy",
    mu."UserName" as "ModifiedBy"
FROM "JournalEntries" je
LEFT JOIN "AspNetUsers" u ON je."CreatedBy" = u."Id"
LEFT JOIN "AspNetUsers" mu ON je."ModifiedBy" = mu."Id"
WHERE je."EntryDate" >= @StartDate 
    AND je."EntryDate" <= @EndDate
    AND (@Status IS NULL OR je."Status" = @Status)
    AND (@EntryType IS NULL OR je."EntryType" = @EntryType)
ORDER BY je."EntryDate" DESC, je."Id"
LIMIT @PageSize OFFSET @Offset;

-- 2. Optimized query for getting journal entry details with lines
-- Uses eager loading to avoid N+1 query problem
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    je."Id",
    je."EntryDate",
    je."ReferenceNumber",
    je."Description",
    je."TotalAmount",
    je."Status",
    je."EntryType",
    jel."Id" as "LineId",
    jel."Description" as "LineDescription",
    jel."Debit",
    jel."Credit",
    jel."Reference" as "LineReference",
    jel."LineOrder",
    coa."AccountName",
    coa."AccountCode",
    coa."AccountType"
FROM "JournalEntries" je
INNER JOIN "JournalEntryLines" jel ON je."Id" = jel."JournalEntryId"
INNER JOIN "ChartOfAccounts" coa ON jel."AccountId" = coa."Id"
WHERE je."Id" = @JournalEntryId
ORDER BY jel."LineOrder";

-- 3. Optimized query for statistics with proper aggregation
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    DATE_TRUNC('month', je."EntryDate") as "Month",
    COUNT(*) as "TotalEntries",
    SUM(CASE WHEN je."Status" = 'Active' THEN 1 ELSE 0 END) as "ActiveEntries",
    SUM(je."TotalAmount") as "TotalAmount",
    AVG(je."TotalAmount") as "AverageAmount"
FROM "JournalEntries" je
WHERE je."EntryDate" >= @StartDate 
    AND je."EntryDate" <= @EndDate
GROUP BY DATE_TRUNC('month', je."EntryDate")
ORDER BY "Month";

-- 4. Optimized query for top account categories
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    coa."AccountName",
    coa."AccountCode",
    COUNT(*) as "TransactionCount",
    SUM(CASE WHEN jel."Debit" > 0 THEN jel."Debit" ELSE 0 END) as "TotalDebits",
    SUM(CASE WHEN jel."Credit" > 0 THEN jel."Credit" ELSE 0 END) as "TotalCredits"
FROM "JournalEntryLines" jel
INNER JOIN "ChartOfAccounts" coa ON jel."AccountId" = coa."Id"
INNER JOIN "JournalEntries" je ON jel."JournalEntryId" = je."Id"
WHERE je."EntryDate" >= @StartDate 
    AND je."EntryDate" <= @EndDate
    AND je."Status" = 'Active'
GROUP BY coa."Id", coa."AccountName", coa."AccountCode"
ORDER BY "TransactionCount" DESC
LIMIT 10;

-- 5. Optimized query for search functionality
-- Uses full-text search capabilities if available
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
    je."Id",
    je."EntryDate",
    je."ReferenceNumber",
    je."Description",
    je."TotalAmount",
    je."Status"
FROM "JournalEntries" je
WHERE (
    je."ReferenceNumber" ILIKE '%' || @SearchTerm || '%'
    OR je."Description" ILIKE '%' || @SearchTerm || '%'
    OR EXISTS (
        SELECT 1 FROM "JournalEntryLines" jel
        WHERE jel."JournalEntryId" = je."Id"
        AND (
            jel."Description" ILIKE '%' || @SearchTerm || '%'
            OR jel."Reference" ILIKE '%' || @SearchTerm || '%'
        )
    )
)
AND je."EntryDate" >= @StartDate 
AND je."EntryDate" <= @EndDate
ORDER BY je."EntryDate" DESC
LIMIT @PageSize OFFSET @Offset;

-- 6. Performance monitoring queries
-- Check index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "IndexScans",
    idx_tup_read as "IndexTuplesRead",
    idx_tup_fetch as "IndexTuplesFetched"
FROM pg_stat_user_indexes 
WHERE tablename IN ('JournalEntries', 'JournalEntryLines')
ORDER BY idx_scan DESC;

-- Check table statistics
SELECT 
    schemaname,
    tablename,
    seq_scan as "SequentialScans",
    seq_tup_read as "SequentialTuplesRead",
    idx_scan as "IndexScans",
    idx_tup_fetch as "IndexTuplesFetched"
FROM pg_stat_user_tables 
WHERE tablename IN ('JournalEntries', 'JournalEntryLines');

-- Check query performance
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE query LIKE '%JournalEntries%' 
    OR query LIKE '%JournalEntryLines%'
ORDER BY total_time DESC
LIMIT 10;

-- 7. Maintenance queries
-- Update table statistics
ANALYZE "JournalEntries";
ANALYZE "JournalEntryLines";

-- Vacuum tables to reclaim storage and update statistics
VACUUM ANALYZE "JournalEntries";
VACUUM ANALYZE "JournalEntryLines";

-- 8. Performance tips and recommendations
/*
PERFORMANCE OPTIMIZATION TIPS:

1. INDEX USAGE:
   - Ensure all WHERE clauses use indexed columns
   - Use composite indexes for multi-column filters
   - Consider partial indexes for frequently filtered values

2. QUERY OPTIMIZATION:
   - Use LIMIT and OFFSET for pagination
   - Avoid SELECT * - only select needed columns
   - Use EXISTS instead of IN for subqueries
   - Consider materialized views for complex aggregations

3. DATABASE MAINTENANCE:
   - Run ANALYZE regularly to update statistics
   - Monitor index usage and remove unused indexes
   - Use VACUUM to reclaim storage and update statistics
   - Consider partitioning for large tables by date

4. APPLICATION LEVEL:
   - Implement query result caching
   - Use connection pooling
   - Consider read replicas for reporting queries
   - Implement proper error handling and timeouts
*/
