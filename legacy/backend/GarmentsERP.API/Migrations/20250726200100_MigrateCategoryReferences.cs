using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class MigrateCategoryReferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing JournalEntryLines to reference Categories where possible
            // This migration attempts to match existing account names with category names
            migrationBuilder.Sql(@"
                UPDATE ""JournalEntryLines"" 
                SET ""CategoryId"" = c.""Id""
                FROM ""Categories"" c
                INNER JOIN ""ChartOfAccounts"" coa ON coa.""AccountName"" = c.""Name""
                WHERE ""JournalEntryLines"".""AccountId"" = coa.""Id""
                AND c.""IsActive"" = true;
            ");

            // Log the migration results
            migrationBuilder.Sql(@"
                -- This query can be used to check migration results
                -- SELECT COUNT(*) as UpdatedLines FROM ""JournalEntryLines"" WHERE ""CategoryId"" IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Clear CategoryId references
            migrationBuilder.Sql(@"
                UPDATE ""JournalEntryLines"" 
                SET ""CategoryId"" = NULL;
            ");
        }
    }
}