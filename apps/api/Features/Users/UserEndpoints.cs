using Microsoft.EntityFrameworkCore;
using Api.Infrastructure.Database;
using Api.Infrastructure.Cryptography;
using Contracts;
using FluentValidation;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;

namespace Api.Features.Users;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .RequireAuthorization();

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
            user.EkycStatus = "verified"; // Auto-verify for demo
            user.IsEnp = true; // Auto-approve for demo

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
            u.EkycStatus);
}
