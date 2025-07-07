using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCleanSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "CreatedAt", "Description", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("0ceb3f14-ea92-4020-a414-230fc5def487"), null, new DateTime(2025, 7, 7, 18, 29, 2, 532, DateTimeKind.Utc).AddTicks(8080), "Manager with administrative privileges", "Manager", "MANAGER" },
                    { new Guid("3ee591c5-b37e-49b9-9478-59ad85c92275"), null, new DateTime(2025, 7, 7, 18, 29, 2, 532, DateTimeKind.Utc).AddTicks(8081), "Regular employee with limited access", "Employee", "EMPLOYEE" },
                    { new Guid("78e3da3d-efa1-4827-ad31-86d4d246f5af"), null, new DateTime(2025, 7, 7, 18, 29, 2, 532, DateTimeKind.Utc).AddTicks(8082), "External vendor/supplier", "Vendor", "VENDOR" },
                    { new Guid("bdd250ff-3291-4e1b-b91f-ff58384985c2"), null, new DateTime(2025, 7, 7, 18, 29, 2, 532, DateTimeKind.Utc).AddTicks(8074), "System Administrator with full access", "Admin", "ADMIN" },
                    { new Guid("f9287304-e722-4cf5-9266-421bfab30b05"), null, new DateTime(2025, 7, 7, 18, 29, 2, 532, DateTimeKind.Utc).AddTicks(8082), "Customer with limited access", "Customer", "CUSTOMER" }
                });
        }
    }
}
