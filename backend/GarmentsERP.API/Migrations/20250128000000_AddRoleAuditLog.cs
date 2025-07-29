using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RoleAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    RoleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Details = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PerformedBy = table.Column<string>(type: "text", nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RoleAuditLogs_RoleId",
                table: "RoleAuditLogs",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAuditLogs_PerformedAt",
                table: "RoleAuditLogs",
                column: "PerformedAt");

            migrationBuilder.CreateIndex(
                name: "IX_RoleAuditLogs_Action",
                table: "RoleAuditLogs",
                column: "Action");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RoleAuditLogs");
        }
    }
}