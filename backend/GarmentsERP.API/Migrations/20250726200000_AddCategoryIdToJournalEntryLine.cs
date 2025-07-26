using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GarmentsERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryIdToJournalEntryLine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "JournalEntryLines",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryLines_CategoryId",
                table: "JournalEntryLines",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_JournalEntryLines_Categories_CategoryId",
                table: "JournalEntryLines",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JournalEntryLines_Categories_CategoryId",
                table: "JournalEntryLines");

            migrationBuilder.DropIndex(
                name: "IX_JournalEntryLines_CategoryId",
                table: "JournalEntryLines");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "JournalEntryLines");
        }
    }
}