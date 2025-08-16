using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Data.Migrations
{
    /// <summary>
    /// Migration to add database indexes for trial balance performance optimization
    /// </summary>
    public partial class AddTrialBalanceIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Index for journal entries by transaction date and status (most common query)
            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TransactionDate_Status",
                table: "JournalEntries",
                columns: new[] { "TransactionDate", "Status" });

            // Index for journal entry lines by account ID (for account-specific queries)
            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_AccountId_JournalEntryId",
                table: "JournalEntryLines",
                columns: new[] { "AccountId", "JournalEntryId" });

            // Composite index for trial balance queries (account + date range + status)
            migrationBuilder.Sql(@"
                CREATE INDEX IX_JournalEntries_TrialBalance_Composite 
                ON ""JournalEntries"" (""TransactionDate"", ""Status"", ""JournalType"", ""CreatedAt"");
            ");

            // Index for chart of accounts by type and active status
            migrationBuilder.CreateIndex(
                name: "IX_ChartOfAccounts_AccountType_IsActive",
                table: "ChartOfAccounts",
                columns: new[] { "AccountType", "IsActive" });

            // Index for journal entry lines with debit/credit amounts for aggregation queries
            migrationBuilder.Sql(@"
                CREATE INDEX IX_JournalEntryLines_Amounts 
                ON ""JournalEntryLines"" (""AccountId"", ""Debit"", ""Credit"") 
                WHERE ""Debit"" > 0 OR ""Credit"" > 0;
            ");

            // Covering index for trial balance account calculations
            migrationBuilder.Sql(@"
                CREATE INDEX IX_JournalEntryLines_TrialBalance_Covering 
                ON ""JournalEntryLines"" (""AccountId"") 
                INCLUDE (""Debit"", ""Credit"", ""JournalEntryId"");
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the indexes in reverse order
            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_TrialBalance_Covering",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_Amounts",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_ChartOfAccounts_AccountType_IsActive",
                table: "ChartOfAccounts");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_TrialBalance_Composite",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_AccountId_JournalEntryId",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_TransactionDate_Status",
                table: "JournalEntries");
        }
    }
}