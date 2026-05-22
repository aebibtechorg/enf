using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using Api.Infrastructure.Database;
using Api.Infrastructure.Cryptography;
using Api.Infrastructure.Sumsub;
using Api.Features.Notarization;
using Contracts;
using FluentValidation;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;

namespace Api.Features.Users;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .RequireAuthorization();

        group.MapPost("/me/ekyc-token", async (ClaimsPrincipal principal, AppDbContext db, ISumsubService sumsub) =>
        {
            var email = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.NotFound();

            // In production, levelName would come from config
            var levelName = "basic-kyc-level"; 
            var token = await sumsub.GetAccessTokenAsync(user.Id.ToString(), levelName);
            
            return Results.Ok(new { token });
        });

        // Sumsub Webhook handler
        app.MapPost("/api/webhooks/sumsub", async (HttpRequest request, AppDbContext db, ISumsubService sumsub, IHubContext<NotarizationHub> hubContext) =>
        {
            if (!request.Headers.TryGetValue("x-payload-digest", out var signature))
            {
                return Results.BadRequest("Missing signature");
            }

            using var ms = new MemoryStream();
            await request.Body.CopyToAsync(ms);
            var bodyBytes = ms.ToArray();

            if (!sumsub.VerifyWebhookSignature(signature!, bodyBytes))
            {
                return Results.Unauthorized();
            }

            var payload = JsonDocument.Parse(bodyBytes);
            var externalUserId = payload.RootElement.TryGetProperty("externalUserId", out var euid) ? euid.GetString() : null;
            var applicantId = payload.RootElement.TryGetProperty("applicantId", out var aid) ? aid.GetString() : null;
            var inspectionId = payload.RootElement.TryGetProperty("inspectionId", out var iid) ? iid.GetString() : null;
            
            var reviewStatus = payload.RootElement.TryGetProperty("reviewStatus", out var rs) ? rs.GetString() : null;
            var reviewResult = payload.RootElement.TryGetProperty("reviewResult", out var rr) ? rr : (JsonElement?)null;
            var reviewAnswer = reviewResult?.TryGetProperty("reviewAnswer", out var ra) == true ? ra.GetString() : null;

            if (Guid.TryParse(externalUserId, out var userId))
            {
                var user = await db.Users.FindAsync(userId);
                if (user != null)
                {
                    user.SumsubApplicantId = applicantId;
                    user.SumsubInspectionId = inspectionId;
                    
                    if (reviewStatus == "completed" && reviewAnswer == "GREEN")
                    {
                        user.EkycStatus = "verified";
                        
                        // Notify client via SignalR. 
                        // Note: Using a broad broadcast or specific user message.
                        // In a real app, ensure IUserIdProvider maps to user.Id or user.Email.
                        await hubContext.Clients.All.SendAsync("EkycVerified", user.Id, inspectionId);
                    }
                    else if (reviewAnswer == "RED")
                    {
                        user.EkycStatus = "rejected";
                        await hubContext.Clients.All.SendAsync("EkycRejected", user.Id);
                    }

                    await db.SaveChangesAsync();
                }
            }

            return Results.Ok();
        })
        .WithTags("Webhooks")
        .AllowAnonymous();

        group.MapGet("/", async (AppDbContext db) =>
            await db.Users
                .Select(u => MapToDto(u))
                .ToListAsync());

        group.MapGet("/me", async (ClaimsPrincipal principal, AppDbContext db) =>
        {
            var email = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.NotFound();

            return Results.Ok(MapToDto(user));
        });

        group.MapGet("/{id}", async (Guid id, AppDbContext db) =>
            await db.Users.FindAsync(id)
                is User u
                    ? Results.Ok(MapToDto(u))
                    : Results.NotFound());

        group.MapPost("/apply-enp", async (ApplyEnpRequest request, ClaimsPrincipal principal, AppDbContext db, ICryptographyService crypto) =>
        {
            var email = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.NotFound();

            user.CommissionNumber = request.CommissionNumber;
            user.CommissionExpiry = request.CommissionExpiry;
            user.RollNumber = request.RollNumber;
            user.IbpNumber = request.IbpNumber;
            user.RegularPlaceOfBusiness = request.RegularPlaceOfBusiness;
            user.WatchedInstructionalVideo = request.WatchedInstructionalVideo;
            user.EkycStatus = "verified"; // Auto-verify for demo
            user.IsEnp = true; // Auto-approve for demo
            user.IsOnboarded = true;

            // Issue ENP Digital Certificate
            var cert = crypto.GenerateUserCertificate(user.FullName);
            user.DigitalCertificate = Convert.ToBase64String(cert.Export(X509ContentType.Pfx));

            await db.SaveChangesAsync();

            return Results.Ok(MapToDto(user));
        });

        group.MapPost("/verify-identity", async (ClaimsPrincipal principal, AppDbContext db, ICryptographyService crypto) =>
        {
            var email = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(email)) return Results.Unauthorized();

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.NotFound();

            user.EkycStatus = "verified";
            user.IsOnboarded = true;
            
            // Issue Principal Digital Certificate
            var cert = crypto.GenerateUserCertificate(user.FullName);
            user.DigitalCertificate = Convert.ToBase64String(cert.Export(X509ContentType.Pfx));

            await db.SaveChangesAsync();

            return Results.Ok(MapToDto(user));
        });

        group.MapPost("/", async (CreateUserRequest request, IValidator<CreateUserRequest> validator, AppDbContext db) =>
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FullName = request.FullName,
                CreatedAt = DateTime.UtcNow
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Created($"/api/users/{user.Id}", MapToDto(user));
        });
    }

    private static UserDto MapToDto(User u) =>
        new UserDto(
            u.Id, 
            u.Email, 
            u.FullName, 
            u.CreatedAt, 
            u.IsEnp, 
            u.CommissionNumber, 
            u.CommissionExpiry, 
            u.RollNumber, 
            u.IbpNumber, 
            u.RegularPlaceOfBusiness, 
            u.EkycStatus,
            u.IsOnboarded,
            u.WatchedInstructionalVideo);
}
