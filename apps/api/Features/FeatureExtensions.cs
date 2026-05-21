using Api.Features.Users;
using Api.Features.Billing;
using Api.Features.Auth;
using Api.Features.Files;

namespace Api.Features;

public static class FeatureExtensions
{
    public static void MapFeatures(this IEndpointRouteBuilder app)
    {
        app.MapUserEndpoints();
        app.MapBillingEndpoints();
        app.MapAuthEndpoints();
        app.MapFileEndpoints();
    }
}
