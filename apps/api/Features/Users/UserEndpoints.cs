using Microsoft.EntityFrameworkCore;
using Api.Infrastructure.Database;
using Contracts;
using FluentValidation;

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
                .Select(u => new UserDto(u.Id, u.Email, u.FullName, u.CreatedAt))
                .ToListAsync());

        group.MapGet("/{id}", async (Guid id, AppDbContext db) =>
            await db.Users.FindAsync(id)
                is User u
                    ? Results.Ok(new UserDto(u.Id, u.Email, u.FullName, u.CreatedAt))
                    : Results.NotFound());

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
            return Results.Created($"/api/users/{user.Id}", new UserDto(user.Id, user.Email, user.FullName, user.CreatedAt));
        });
    }
}
