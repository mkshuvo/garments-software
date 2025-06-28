using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GarmentsERP.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationshipWarnings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ApplicationUserId",
                table: "BankReconciliations");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_AspNetUsers_ApplicationUserId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApplicationUserId",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApplicationUserId1",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApprovedByUserId",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntries_AspNetUsers_CreatedByUserId",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_AspNetUsers_ApplicationUserId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_ApplicationUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId1",
                table: "RolePermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_ApplicationUserId",
                table: "SalesInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_AspNetUsers_ApplicationUserId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_Permissions_PermissionId1",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_PermissionId1",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_ApplicationUserId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoices_ApplicationUserId",
                table: "SalesInvoices");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_PermissionId1",
                table: "RolePermissions");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_ApplicationUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropIndex(
                name: "IX_Payments_ApplicationUserId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_ApplicationUserId",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntries_ApplicationUserId1",
                table: "JournalEntries");

            migrationBuilder.DropIndex(
                name: "IX_BankTransfers_ApplicationUserId",
                table: "BankTransfers");

            migrationBuilder.DropIndex(
                name: "IX_BankReconciliations_ApplicationUserId",
                table: "BankReconciliations");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("f9287304-e722-4cf5-9266-421bfab30b05"));

            migrationBuilder.DropColumn(
                name: "PermissionId1",
                table: "UserPermissions");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "SalesInvoices");

            migrationBuilder.DropColumn(
                name: "PermissionId1",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId1",
                table: "JournalEntries");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "BankTransfers");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "BankReconciliations");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "CreatedAt", "Description", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("24c45ef0-7aa1-4e16-8f44-9db36b54667c"), null, new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5095), "Manager with administrative privileges", "Manager", "MANAGER" },
                    { new Guid("3a135c6d-9742-4a54-83af-da86e61606a0"), null, new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5088), "System Administrator with full access", "Admin", "ADMIN" },
                    { new Guid("5ad9a63c-62c3-45d4-8ba9-54679eb8b075"), null, new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5096), "Regular employee with limited access", "Employee", "EMPLOYEE" },
                    { new Guid("b987a0e0-44df-4ed2-8eaf-f21d1dbb89e6"), null, new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5097), "External vendor/supplier", "Vendor", "VENDOR" },
                    { new Guid("eec6f30e-6676-4aac-9589-8a03fe7f2a18"), null, new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5098), "Customer with limited access", "Customer", "CUSTOMER" }
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "6864b36a-c433-426b-86f5-703fc6183ad9", new DateTime(2025, 6, 28, 20, 24, 41, 212, DateTimeKind.Utc).AddTicks(5389), "AQAAAAIAAYagAAAAEKEp3z8txRvdNOXAjpcGzHAbSH2WoTuBLzp5Jg+XorJBZT4aq8fG/wY00/oOXHuofA==", "091eb6cb-3038-4979-83b2-e3f9f41601d5" });

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntry_ApplicationUser_ApprovedBy",
                table: "JournalEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntry_ApplicationUser_CreatedBy",
                table: "JournalEntries");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("24c45ef0-7aa1-4e16-8f44-9db36b54667c"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("3a135c6d-9742-4a54-83af-da86e61606a0"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("5ad9a63c-62c3-45d4-8ba9-54679eb8b075"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("b987a0e0-44df-4ed2-8eaf-f21d1dbb89e6"));

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("eec6f30e-6676-4aac-9589-8a03fe7f2a18"));

            migrationBuilder.AddColumn<Guid>(
                name: "PermissionId1",
                table: "UserPermissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "StockMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "SalesInvoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PermissionId1",
                table: "RolePermissions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "PurchaseInvoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "Payments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "JournalEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId1",
                table: "JournalEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "BankTransfers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationUserId",
                table: "BankReconciliations",
                type: "uuid",
                nullable: true);

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "CreatedAt", "Description", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"), null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(8745), "Manager with administrative privileges", "Manager", "MANAGER" },
                    { new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"), null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(8746), "Regular employee with limited access", "Employee", "EMPLOYEE" },
                    { new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"), null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(8747), "External vendor/supplier", "Vendor", "VENDOR" },
                    { new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"), null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(8739), "System Administrator with full access", "Admin", "ADMIN" },
                    { new Guid("f9287304-e722-4cf5-9266-421bfab30b05"), null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(8748), "Customer with limited access", "Customer", "CUSTOMER" }
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f46459d9-358d-4d38-86d0-21291fb638fe", new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(9121), "AQAAAAIAAYagAAAAEKqYNgt3whOGwoXBMIDRKxkexzr0W7nw5q/fyOiWjCShU7YvhR46IqTV0D0j3yuK6A==", "dd787116-6ecb-46e4-9ee1-5bc96fbbdc25" });

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_PermissionId1",
                table: "UserPermissions",
                column: "PermissionId1");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_ApplicationUserId",
                table: "StockMovements",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoices_ApplicationUserId",
                table: "SalesInvoices",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId1",
                table: "RolePermissions",
                column: "PermissionId1");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_ApplicationUserId",
                table: "PurchaseInvoices",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ApplicationUserId",
                table: "Payments",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ApplicationUserId",
                table: "JournalEntries",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_ApplicationUserId1",
                table: "JournalEntries",
                column: "ApplicationUserId1");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransfers_ApplicationUserId",
                table: "BankTransfers",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_ApplicationUserId",
                table: "BankReconciliations",
                column: "ApplicationUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BankReconciliations_AspNetUsers_ApplicationUserId",
                table: "BankReconciliations",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_AspNetUsers_ApplicationUserId",
                table: "BankTransfers",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApplicationUserId",
                table: "JournalEntries",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApplicationUserId1",
                table: "JournalEntries",
                column: "ApplicationUserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_ApprovedByUserId",
                table: "JournalEntries",
                column: "ApprovedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntries_AspNetUsers_CreatedByUserId",
                table: "JournalEntries",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_AspNetUsers_ApplicationUserId",
                table: "Payments",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_ApplicationUserId",
                table: "PurchaseInvoices",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId1",
                table: "RolePermissions",
                column: "PermissionId1",
                principalTable: "Permissions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_ApplicationUserId",
                table: "SalesInvoices",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_AspNetUsers_ApplicationUserId",
                table: "StockMovements",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_Permissions_PermissionId1",
                table: "UserPermissions",
                column: "PermissionId1",
                principalTable: "Permissions",
                principalColumn: "Id");
        }
    }
}
