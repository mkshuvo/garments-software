-- Migration Verification Script for Categories Table
-- This script verifies that the Categories table migration was applied correctly

-- 1. Verify Categories table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'Categories' 
    AND table_schema = 'public';

-- 2. Verify all required columns exist with correct data types
SELECT 
    column_name,
    data_type,
    is_nullable,
    character_maximum_length,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Categories' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verify primary key constraint
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'Categories' 
    AND tc.constraint_type = 'PRIMARY KEY';

-- 4. Verify unique constraint on Name + Type
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'Categories' 
    AND tc.constraint_type = 'UNIQUE'
ORDER BY kcu.ordinal_position;

-- 5. Verify all required indexes exist
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'Categories'
ORDER BY indexname;

-- 6. Test data insertion to verify constraints work
-- Insert test categories
INSERT INTO "Categories" ("Id", "Name", "Description", "Type", "IsActive", "CreatedAt")
VALUES 
    (gen_random_uuid(), 'Test Credit Category', 'Test credit category for verification', 0, true, NOW()),
    (gen_random_uuid(), 'Test Debit Category', 'Test debit category for verification', 1, true, NOW()),
    (gen_random_uuid(), 'Test Credit Category', 'Same name but different type should work', 1, true, NOW());

-- Verify test data was inserted
SELECT 
    "Id",
    "Name",
    "Description",
    "Type",
    "IsActive",
    "CreatedAt"
FROM "Categories"
WHERE "Name" LIKE 'Test%'
ORDER BY "Name", "Type";

-- 7. Test unique constraint (this should fail)
-- Uncomment the following to test unique constraint enforcement:
/*
INSERT INTO "Categories" ("Id", "Name", "Description", "Type", "IsActive", "CreatedAt")
VALUES (gen_random_uuid(), 'Test Credit Category', 'This should fail due to unique constraint', 0, true, NOW());
*/

-- 8. Clean up test data
DELETE FROM "Categories" WHERE "Name" LIKE 'Test%';

-- 9. Verify rollback scenario by checking migration history
SELECT 
    "MigrationId",
    "ProductVersion"
FROM "__EFMigrationsHistory"
WHERE "MigrationId" LIKE '%Categories%'
ORDER BY "MigrationId";

-- Expected Results Summary:
-- 1. Categories table should exist in public schema
-- 2. Should have 9 columns: Id, Name, Description, Type, IsActive, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy
-- 3. Should have primary key on Id
-- 4. Should have unique constraint on Name + Type combination
-- 5. Should have indexes on: Name+Type (unique), Type, IsActive, Name
-- 6. Should allow same name with different types
-- 7. Should prevent duplicate name+type combinations
-- 8. Migration history should show AddCategoriesTable and AddCategoryPerformanceIndexes