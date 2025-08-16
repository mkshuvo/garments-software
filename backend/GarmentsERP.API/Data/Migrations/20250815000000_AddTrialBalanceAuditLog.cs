using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTrialBalanceAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TrialBalanceAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UserRole = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExportFormat = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RequestId = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: false),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TransactionCount = table.Column<int>(type: "integer", nullable: true),
                    FinalBalance = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    AdditionalData = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsSuccess = table.Column<bool>(type: "boolean", nullable: false),
                    ExecutionTimeMs = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ComparisonPeriod1Id = table.Column<Guid>(type: "uuid", nullable: true),
                    ComparisonPeriod2Id = table.Column<Guid>(type: "uuid", nullable: true),
                    AccountId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrialBalanceAuditLogs", x => x.Id);
                });

            // Create indexes for better query performance
            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_UserId",
                table: "TrialBalanceAuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_Action",
                table: "TrialBalanceAuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_CreatedAt",
                table: "TrialBalanceAuditLogs",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_RequestId",
                table: "TrialBalanceAuditLogs",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_IpAddress",
                table: "TrialBalanceAuditLogs",
                column: "IpAddress");

            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_IsSuccess",
                table: "TrialBalanceAuditLogs",
                column: "IsSuccess");

            // Composite index for common queries
            migrationBuilder.CreateIndex(
                name: "IX_TrialBalanceAuditLogs_UserId_Action_CreatedAt",
                table: "TrialBalanceAuditLogs",
                columns: new[] { "UserId", "Action", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TrialBalanceAuditLogs");
        }
    }
}