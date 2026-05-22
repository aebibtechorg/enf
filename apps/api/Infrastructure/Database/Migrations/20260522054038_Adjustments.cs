using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class Adjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InPhilippines",
                table: "NotarialBookEntries");

            migrationBuilder.AddColumn<int>(
                name: "EnpLocationType",
                table: "NotarizationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PrincipalLocationType",
                table: "NotarizationSessions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PrincipalActualLocation",
                table: "NotarialBookEntries",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PrincipalLocationType",
                table: "NotarialBookEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "NotarizationWitnesses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IdentityEvidence = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Signature = table.Column<string>(type: "text", nullable: true),
                    SessionId = table.Column<Guid>(type: "uuid", nullable: true),
                    BookEntryId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotarizationWitnesses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotarizationWitnesses_NotarialBookEntries_BookEntryId",
                        column: x => x.BookEntryId,
                        principalTable: "NotarialBookEntries",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotarizationWitnesses_NotarizationSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "NotarizationSessions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationWitnesses_BookEntryId",
                table: "NotarizationWitnesses",
                column: "BookEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationWitnesses_SessionId",
                table: "NotarizationWitnesses",
                column: "SessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotarizationWitnesses");

            migrationBuilder.DropColumn(
                name: "EnpLocationType",
                table: "NotarizationSessions");

            migrationBuilder.DropColumn(
                name: "PrincipalLocationType",
                table: "NotarizationSessions");

            migrationBuilder.DropColumn(
                name: "PrincipalActualLocation",
                table: "NotarialBookEntries");

            migrationBuilder.DropColumn(
                name: "PrincipalLocationType",
                table: "NotarialBookEntries");

            migrationBuilder.AddColumn<bool>(
                name: "InPhilippines",
                table: "NotarialBookEntries",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
