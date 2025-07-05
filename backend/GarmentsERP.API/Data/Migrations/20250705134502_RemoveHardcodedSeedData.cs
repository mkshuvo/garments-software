using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveHardcodedSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove the hardcoded user from the previous migration to prevent conflicts with seeders
            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Re-add the hardcoded user if migration is rolled back
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "CreatedAt", "Email", "EmailConfirmed", "FullName", "IsActive", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UpdatedAt", "UserName", "UserType" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), 0, "f46459d9-358d-4d38-86d0-21291fb638fe", new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(9121), null, false, null, false, false, null, null, null, "AQAAAAIAAYagAAAAEKqYNgt3whOGwoXBMIDRKxkexzr0W7nw5q/fyOiWjCShU7YvhR46IqTV0D0j3yuK6A==", null, false, "dd787116-6ecb-46e4-9ee1-5bc96fbbdc25", false, null, null, 0 });
        }
    }
}
