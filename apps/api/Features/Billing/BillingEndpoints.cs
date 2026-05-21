using Microsoft.EntityFrameworkCore;
using Api.Infrastructure.Database;

namespace Api.Features.Billing;

public static class BillingEndpoints
{
    public static void MapBillingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/billing")
            .WithTags("Billing")
            .RequireAuthorization();

        group.MapGet("/subscriptions/{userId}", async (Guid userId, AppDbContext db) =>
            await db.Subscriptions.Where(s => s.UserId == userId).ToListAsync());
    }
}
