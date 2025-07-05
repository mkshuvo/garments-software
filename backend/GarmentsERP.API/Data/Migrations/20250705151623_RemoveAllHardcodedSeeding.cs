using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAllHardcodedSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove all hardcoded users and user-role relationships from previous migrations
            // Delete the problematic user-role relationship that references non-existent role
            migrationBuilder.Sql("DELETE FROM \"AspNetUserRoles\" WHERE \"UserId\" = '11111111-1111-1111-1111-111111111111' AND \"RoleId\" = '22222222-2222-2222-2222-222222222222';");
            
            // Delete the hardcoded user from the first migration
            migrationBuilder.Sql("DELETE FROM \"AspNetUsers\" WHERE \"Id\" = '11111111-1111-1111-1111-111111111111';");
            
            // Note: The proper seeding will be handled by the dedicated seeders in ApplicationDbContext
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Re-add the hardcoded data if migration is rolled back
            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "ContactNumber", "CreatedAt", "Email", "EmailConfirmed", "FullName", "IsActive", "LastLoginAt", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UpdatedAt", "UserName", "UserType" },
                values: new object[] { new Guid("11111111-1111-1111-1111-111111111111"), 0, "f46459d9-358d-4d38-86d0-21291fb638fe", null, new DateTime(2025, 6, 28, 20, 15, 36, 424, DateTimeKind.Utc).AddTicks(9121), "admin@erp.com", true, "System Administrator", true, null, false, null, "ADMIN@ERP.COM", "ADMIN", "AQAAAAIAAYagAAAAEKqYNgt3whOGwoXBMIDRKxkexzr0W7nw5q/fyOiWjCShU7YvhR46IqTV0D0j3yuK6A==", null, false, "dd787116-6ecb-46e4-9ee1-5bc96fbbdc25", false, null, "admin", 4 });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId", "ApplicationRoleId", "ApplicationUserId" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222222"), new Guid("11111111-1111-1111-1111-111111111111"), null, null });
        }
    }
}
