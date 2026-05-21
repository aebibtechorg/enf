using Microsoft.AspNetCore.Mvc;

namespace Api.Shared.Errors;

public static class ProblemDetailsExtensions
{
    public static IResult Problem(
        this IEndpointRouteBuilder _,
        string title,
        int status,
        string? detail = null,
        string? instance = null,
        IDictionary<string, object?>? extensions = null)
    {
        return Results.Problem(new ProblemDetails
        {
            Title = title,
            Status = status,
            Detail = detail,
            Instance = instance,
            Extensions = extensions ?? new Dictionary<string, object?>()
        });
    }

    public static IResult BadRequest(this IEndpointRouteBuilder _, string title, string? detail = null)
    {
        return Results.Problem(title: title, detail: detail, statusCode: StatusCodes.Status400BadRequest);
    }

    public static IResult NotFound(this IEndpointRouteBuilder _, string title, string? detail = null)
    {
        return Results.Problem(title: title, detail: detail, statusCode: StatusCodes.Status404NotFound);
    }
}
