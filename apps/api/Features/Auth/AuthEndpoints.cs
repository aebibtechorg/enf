namespace Api.Features.Auth;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", () =>
        {
            return Results.Problem(
                detail: "Login is handled by Better Auth. Use the web auth service instead of the legacy API login endpoint.",
                statusCode: StatusCodes.Status410Gone,
                title: "Legacy login endpoint disabled");
        });
    }
}
