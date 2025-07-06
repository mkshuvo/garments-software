using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAllNavigationProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_BankAccounts_FromAccountId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_BankAccounts_ToAccountId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_ChartOfAccounts_ChartOfAccounts_ParentAccountId",
                table: "ChartOfAccounts");

            migrationBuilder.DropForeignKey(
                name: "FK_ExchangeRates_Currencies_FromCurrencyId",
                table: "ExchangeRates");

            migrationBuilder.DropForeignKey(
                name: "FK_ExchangeRates_Currencies_ToCurrencyId",
                table: "ExchangeRates");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProductCategories_CategoryId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoiceItems_Products_ProductId",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoiceItems_PurchaseInvoices_PurchaseInvoiceId",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_AspNetUsers_CreatedByUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_AspNetRoles_RoleId",
                table: "RolePermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId",
                table: "RolePermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoiceItems_Products_ProductId",
                table: "SalesInvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoiceItems_SalesInvoices_SalesInvoiceId",
                table: "SalesInvoiceItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Products_ProductId",
                table: "StockItems");

            migrationBuilder.DropForeignKey(
                name: "FK_StockItems_Warehouses_WarehouseId",
                table: "StockItems");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_StockItems_StockItemId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_TaxSchemes_TaxRates_TaxRateId",
                table: "TaxSchemes");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions");

            migrationBuilder.DropForeignKey(
                name: "FK_UserPermissions_Permissions_PermissionId",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_VendorProfiles_UserId",
                table: "VendorProfiles");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_PermissionId",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions");

            migrationBuilder.DropIndex(
                name: "IX_TaxSchemes_TaxRateId",
                table: "TaxSchemes");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_StockItemId",
                table: "StockMovements");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_ProductId",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_StockItems_WarehouseId",
                table: "StockItems");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoices_CreatedByUserId",
                table: "SalesInvoices");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoiceItems_ProductId",
                table: "SalesInvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_SalesInvoiceItems_SalesInvoiceId",
                table: "SalesInvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_CreatedByUserId",
                table: "PurchaseInvoices");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoiceItems_ProductId",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoiceItems_PurchaseInvoiceId",
                table: "PurchaseInvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfiles_UserId",
                table: "CustomerProfiles");

            migrationBuilder.DropIndex(
                name: "IX_ChartOfAccounts_ParentAccountId",
                table: "ChartOfAccounts");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2260));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2261));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2262));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2252));

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: new Guid("f9287304-e722-4cf5-9266-421bfab30b05"),
                column: "CreatedAt",
                value: new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2263));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("5b6b1d3c-c143-463a-916f-735989ad3f88"),
                columns: new[] { "ConcurrencyStamp", "CreatedAt", "PasswordHash", "SecurityStamp" },
                values: new object[] { "899883d9-a792-4966-a196-fd280c2518d0", new DateTime(2025, 7, 6, 20, 2, 3, 454, DateTimeKind.Utc).AddTicks(2788), "AQAAAAIAAYagAAAAEP5ohmcDphe3P86Ej2Oo4moGlT6WQHmUT4ay7IkdAL8l9nSylHPjP7KQobrlZ4ixnw==", "85073f5d-ee83-4813-acf4-e7dee92093d3" });

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_UserId",
                table: "VendorProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfiles_UserId",
                table: "CustomerProfiles",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_BankAccounts_FromAccountId",
                table: "BankTransfers",
                column: "FromAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_BankAccounts_ToAccountId",
                table: "BankTransfers",
                column: "ToAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExchangeRates_Currencies_FromCurrencyId",
                table: "ExchangeRates",
                column: "FromCurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExchangeRates_Currencies_ToCurrencyId",
                table: "ExchangeRates",
                column: "ToCurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_BankAccounts_FromAccountId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_BankTransfers_BankAccounts_ToAccountId",
                table: "BankTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_ExchangeRates_Currencies_FromCurrencyId",
                table: "ExchangeRates");

            migrationBuilder.DropForeignKey(
                name: "FK_ExchangeRates_Currencies_ToCurrencyId",
                table: "ExchangeRates");

            migrationBuilder.DropIndex(
                name: "IX_VendorProfiles_UserId",
                table: "VendorProfiles");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles");

            migrationBuilder.DropIndex(
                name: "IX_CustomerProfiles_UserId",
                table: "CustomerProfiles");

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

            migrationBuilder.CreateIndex(
                name: "IX_VendorProfiles_UserId",
                table: "VendorProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_PermissionId",
                table: "UserPermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_UserId",
                table: "UserPermissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxSchemes_TaxRateId",
                table: "TaxSchemes",
                column: "TaxRateId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_StockItemId",
                table: "StockMovements",
                column: "StockItemId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_ProductId",
                table: "StockItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_StockItems_WarehouseId",
                table: "StockItems",
                column: "WarehouseId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoices_CreatedByUserId",
                table: "SalesInvoices",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoiceItems_ProductId",
                table: "SalesInvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesInvoiceItems_SalesInvoiceId",
                table: "SalesInvoiceItems",
                column: "SalesInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_CreatedByUserId",
                table: "PurchaseInvoices",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoiceItems_ProductId",
                table: "PurchaseInvoiceItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoiceItems_PurchaseInvoiceId",
                table: "PurchaseInvoiceItems",
                column: "PurchaseInvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeProfiles_UserId",
                table: "EmployeeProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomerProfiles_UserId",
                table: "CustomerProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChartOfAccounts_ParentAccountId",
                table: "ChartOfAccounts",
                column: "ParentAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_BankAccounts_FromAccountId",
                table: "BankTransfers",
                column: "FromAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransfers_BankAccounts_ToAccountId",
                table: "BankTransfers",
                column: "ToAccountId",
                principalTable: "BankAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChartOfAccounts_ChartOfAccounts_ParentAccountId",
                table: "ChartOfAccounts",
                column: "ParentAccountId",
                principalTable: "ChartOfAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExchangeRates_Currencies_FromCurrencyId",
                table: "ExchangeRates",
                column: "FromCurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExchangeRates_Currencies_ToCurrencyId",
                table: "ExchangeRates",
                column: "ToCurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProductCategories_CategoryId",
                table: "Products",
                column: "CategoryId",
                principalTable: "ProductCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoiceItems_Products_ProductId",
                table: "PurchaseInvoiceItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoiceItems_PurchaseInvoices_PurchaseInvoiceId",
                table: "PurchaseInvoiceItems",
                column: "PurchaseInvoiceId",
                principalTable: "PurchaseInvoices",
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
                name: "FK_RolePermissions_AspNetRoles_RoleId",
                table: "RolePermissions",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissions_Permissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId",
                principalTable: "Permissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoiceItems_Products_ProductId",
                table: "SalesInvoiceItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoiceItems_SalesInvoices_SalesInvoiceId",
                table: "SalesInvoiceItems",
                column: "SalesInvoiceId",
                principalTable: "SalesInvoices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesInvoices_AspNetUsers_CreatedByUserId",
                table: "SalesInvoices",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Products_ProductId",
                table: "StockItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockItems_Warehouses_WarehouseId",
                table: "StockItems",
                column: "WarehouseId",
                principalTable: "Warehouses",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_StockItems_StockItemId",
                table: "StockMovements",
                column: "StockItemId",
                principalTable: "StockItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TaxSchemes_TaxRates_TaxRateId",
                table: "TaxSchemes",
                column: "TaxRateId",
                principalTable: "TaxRates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_AspNetUsers_UserId",
                table: "UserPermissions",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserPermissions_Permissions_PermissionId",
                table: "UserPermissions",
                column: "PermissionId",
                principalTable: "Permissions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
