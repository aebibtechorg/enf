namespace Contracts;

public sealed class SearchRequest
{
    public string? Query { get; init; }

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 20;

    public string? SortBy { get; init; }

    public string? SortDirection { get; init; } = "asc";
}
