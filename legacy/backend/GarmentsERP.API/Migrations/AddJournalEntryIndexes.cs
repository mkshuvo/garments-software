using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddJournalEntryIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create indexes for JournalEntries table
            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_DateRange_Status",
                table: "JournalEntries",
                columns: new[] { "EntryDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ReferenceNumber",
                table: "JournalEntries",
                column: "ReferenceNumber");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ContactId",
                table: "JournalEntries",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_EntryType",
                table: "JournalEntries",
                column: "EntryType");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_TotalAmount",
                table: "JournalEntries",
                column: "TotalAmount");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_Date_Amount",
                table: "JournalEntries",
                columns: new[] { "EntryDate", "TotalAmount" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_CreatedBy",
                table: "JournalEntries",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ModifiedBy",
                table: "JournalEntries",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_CompanyId",
                table: "JournalEntries",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_Pagination",
                table: "JournalEntries",
                columns: new[] { "EntryDate", "Id" });

            // Create indexes for JournalEntryLines table
            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_AccountId",
                table: "JournalEntryLines",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_JournalEntryId",
                table: "JournalEntryLines",
                column: "JournalEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_Description",
                table: "JournalEntryLines",
                column: "Description");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_Entry_Account",
                table: "JournalEntryLines",
                columns: new[] { "JournalEntryId", "AccountId" });

            // Create indexes for JournalEntryAuditLogs table (if it exists)
            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryAuditLogs_EntryId_Date",
                table: "JournalEntryAuditLogs",
                columns: new[] { "JournalEntryId", "ChangeDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes for JournalEntries table
            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_DateRange_Status",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_ReferenceNumber",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_ContactId",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_EntryType",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_TotalAmount",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_Date_Amount",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_CreatedBy",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_ModifiedBy",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_CompanyId",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_Pagination",
                table: "JournalEntries");

            // Drop indexes for JournalEntryLines table
            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_AccountId",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_JournalEntryId",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_Description",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_Entry_Account",
                table: "JournalEntryLines");

            // Drop indexes for JournalEntryAuditLogs table
            migrationBuilder.DropIndex(
                name: "IX_JournalEntryAuditLogs_EntryId_Date",
                table: "JournalEntryAuditLogs");
        }
    }
}
