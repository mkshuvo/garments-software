using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ReconciledByUserId",
                table: "BankReconciliations");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_AspNetUsers_CreatedByUserId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntry_ApplicationUser_ApprovedBy",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntry_ApplicationUser_CreatedBy",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_AspNetUsers_CreatedByUserId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_CreatedByUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_AspNetUsers_CreatedByUserId",
                table: "ReportTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_AspNetUsers_CreatedByUserId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_PurchaseInvoices_PurchaseInvoiceId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_SalesInvoices_SalesInvoiceId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_CreatedByUserId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_PurchaseInvoiceId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_SalesInvoiceId",
                table: "StockMovements");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(344));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(345));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(346));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(335));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("f9287304-e722-4cf5-9266-421bfab30b05"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(347));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("5b6b1d3c-c143-463a-916f-735989ad3f88"),
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "e80a1856-146d-4c8e-8bfc-7f21597bc35a", new DateTime(2025, 7, 6, 19, 24, 56, 752, DateTimeKind.Utc).AddTicks(1359), "AQAAAAIAAYagAAAAEFSpywpy8iqxzFC4EJTVkpLLn2y98UC773698BSODohzTlToxKBUC+/fI52pI7GLgQ==", "46567bd0-e88a-43ee-94e2-17cb8ba40939" });

            migrationBuilder.AddForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ReconciledByUserId",
                table: "BankReconciliations",
                column: "ReconciledByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_AspNetUsers_CreatedByUserId",
                table: "BankTransfers",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApprovedByUserId",
                table: "JournalEntries",
                column: "ApprovedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_CreatedByUserId",
                table: "JournalEntries",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_AspNetUsers_CreatedByUserId",
                table: "Payments",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_CreatedByUserId",
                table: "PurchaseInvoices",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_AspNetUsers_CreatedByUserId",
                table: "ReportTemplates",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ReconciledByUserId",
                table: "BankReconciliations");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_AspNetUsers_CreatedByUserId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApprovedByUserId",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_CreatedByUserId",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_AspNetUsers_CreatedByUserId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_CreatedByUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_AspNetUsers_CreatedByUserId",
                table: "ReportTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(293));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(295));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(296));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(283));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("f9287304-e722-4cf5-9266-421bfab30b05"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(297));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("5b6b1d3c-c143-463a-916f-735989ad3f88"),
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "9b36f08a-1251-4631-80ee-19d5a377f53f", new DateTime(2025, 7, 5, 15, 16, 23, 496, DateTimeKind.Utc).AddTicks(675), "AQAAAAIAAYagAAAAEJmYwz+LFoScrx8I/UfduWRz5gxl1Vuol+wW1wWXlstvptzifbiBL2WIcWVx1ZdP9Q==", "6fc542f9-5454-421b-a7d2-0cd2728f0346" });

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_CreatedByUserId",
                table: "StockMovements",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_PurchaseInvoiceId",
                table: "StockMovements",
                column: "PurchaseInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_SalesInvoiceId",
                table: "StockMovements",
                column: "SalesInvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ReconciledByUserId",
                table: "BankReconciliations",
                column: "ReconciledByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_AspNetUsers_CreatedByUserId",
                table: "BankTransfers",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntry_ApplicationUser_ApprovedBy",
                table: "JournalEntries",
                column: "ApprovedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntry_ApplicationUser_CreatedBy",
                table: "JournalEntries",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_AspNetUsers_CreatedByUserId",
                table: "Payments",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_CreatedByUserId",
                table: "PurchaseInvoices",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_AspNetUsers_CreatedByUserId",
                table: "ReportTemplates",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_AspNetUsers_CreatedByUserId",
                table: "StockMovements",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_PurchaseInvoices_PurchaseInvoiceId",
                table: "StockMovements",
                column: "PurchaseInvoiceId",
                principalTable: "PurchaseInvoices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_SalesInvoices_SalesInvoiceId",
                table: "StockMovements",
                column: "SalesInvoiceId",
                principalTable: "SalesInvoices",
                principalColumn: "Id");
        }
    }
}
