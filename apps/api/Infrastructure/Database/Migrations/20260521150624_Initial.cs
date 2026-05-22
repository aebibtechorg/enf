using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsEnp = table.Column<bool>(type: "boolean", nullable: false),
                    CommissionNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CommissionExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RollNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IbpNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RegularPlaceOfBusiness = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EkycStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "none"),
                    DigitalCertificate = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotarialBookEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    NotarialAct = table.Column<string>(type: "text", nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DocumentTitle = table.Column<string>(type: "text", nullable: false),
                    PrincipalId = table.Column<Guid>(type: "uuid", nullable: false),
                    PrincipalAddress = table.Column<string>(type: "text", nullable: false),
                    PrincipalIdentityEvidence = table.Column<string>(type: "text", nullable: false),
                    FeeCharged = table.Column<decimal>(type: "numeric", nullable: false),
                    InPhilippines = table.Column<bool>(type: "boolean", nullable: false),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    EnpId = table.Column<Guid>(type: "uuid", nullable: false),
                    NotarizedFileId = table.Column<string>(type: "text", nullable: false),
                    EntryNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotarialBookEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotarialBookEntries_Users_EnpId",
                        column: x => x.EnpId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotarialBookEntries_Users_PrincipalId",
                        column: x => x.PrincipalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotarizationSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PrincipalId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnpId = table.Column<Guid>(type: "uuid", nullable: false),
                    MeetingUrl = table.Column<string>(type: "text", nullable: true),
                    RecordingFileId = table.Column<string>(type: "text", nullable: true),
                    PrincipalLocation = table.Column<string>(type: "text", nullable: true),
                    EnpLocation = table.Column<string>(type: "text", nullable: true),
                    GeolocationVerified = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotarizationSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotarizationSessions_Users_EnpId",
                        column: x => x.EnpId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NotarizationSessions_Users_PrincipalId",
                        column: x => x.PrincipalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Subscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlanName = table.Column<string>(type: "text", nullable: false),
                    StartsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Subscriptions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NotarizationDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    FileId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    PrincipalId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnpId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ContentHash = table.Column<string>(type: "text", nullable: false),
                    PdfAFileId = table.Column<string>(type: "text", nullable: true),
                    NotarizationSessionId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotarizationDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotarizationDocuments_NotarizationSessions_NotarizationSess~",
                        column: x => x.NotarizationSessionId,
                        principalTable: "NotarizationSessions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotarizationDocuments_Users_EnpId",
                        column: x => x.EnpId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_NotarizationDocuments_Users_PrincipalId",
                        column: x => x.PrincipalId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotarialBookEntries_EnpId_EntryNumber",
                table: "NotarialBookEntries",
                columns: new[] { "EnpId", "EntryNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NotarialBookEntries_PrincipalId",
                table: "NotarialBookEntries",
                column: "PrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationDocuments_EnpId",
                table: "NotarizationDocuments",
                column: "EnpId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationDocuments_NotarizationSessionId",
                table: "NotarizationDocuments",
                column: "NotarizationSessionId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationDocuments_PrincipalId",
                table: "NotarizationDocuments",
                column: "PrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationSessions_EnpId",
                table: "NotarizationSessions",
                column: "EnpId");

            migrationBuilder.CreateIndex(
                name: "IX_NotarizationSessions_PrincipalId",
                table: "NotarizationSessions",
                column: "PrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_UserId",
                table: "Subscriptions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotarialBookEntries");

            migrationBuilder.DropTable(
                name: "NotarizationDocuments");

            migrationBuilder.DropTable(
                name: "Subscriptions");

            migrationBuilder.DropTable(
                name: "NotarizationSessions");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
