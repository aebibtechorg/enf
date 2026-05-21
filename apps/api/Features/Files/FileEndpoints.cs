using Api.Infrastructure.Storage;
using Api.Shared.Security;
using Contracts;
using Microsoft.AspNetCore.Http.HttpResults;
using MimeDetective;

namespace Api.Features.Files;

public static class FileEndpoints
{
    private static readonly string[] AllowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".txt", ".json"];

    public static void MapFileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/files")
            .WithTags("Files")
            .RequireAuthorization();

        group.MapPost("/", UploadFileAsync)
            .DisableAntiforgery()
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<FileUploadResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest);

        group.MapGet("/{fileId}", DownloadFileAsync)
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status400BadRequest);

        group.MapDelete("/{fileId}", DeleteFileAsync)
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest);
    }

    internal static async Task<Results<Created<FileUploadResponse>, ValidationProblem>> UploadFileAsync(
        IFormFile? file,
        IFileStorage storage,
        IHtmlSanitizerService sanitizer,
        IContentInspector inspector,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0 || string.IsNullOrWhiteSpace(file.FileName))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["file"] = ["A non-empty file upload is required."]
            });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["file"] = [$"File extension '{extension}' is not allowed. Allowed extensions: {string.Join(", ", AllowedExtensions)}"]
            });
        }

        await using var stream = file.OpenReadStream();

        // Verify file signature to prevent MIME type poisoning for binary formats
        if (extension != ".txt" && extension != ".json")
        {
            var results = inspector.Inspect(stream);
            var bestMatch = results.OrderByDescending(x => x.Points).FirstOrDefault();
            
            // Reset position for storage upload
            if (stream.CanSeek) stream.Position = 0;

            if (bestMatch != null)
            {
                var detectedExtension = $".{bestMatch.Definition.File.Extensions.FirstOrDefault()?.TrimStart('.')}";
                
                // Special case: .jpg and .jpeg are often interchangeable
                var isJpegMatch = (extension == ".jpg" || extension == ".jpeg") &&
                                 (detectedExtension == ".jpg" || detectedExtension == ".jpeg");

                if (!string.Equals(detectedExtension, extension, StringComparison.OrdinalIgnoreCase) && !isJpegMatch)
                {
                    return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                    {
                        ["file"] = [$"File content does not match extension '{extension}'. Detected as '{detectedExtension}'."]
                    });
                }
            }
            else
            {
                // Strict for binary formats we expect to recognize
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["file"] = [$"File content does not match extension '{extension}'."]
                });
            }
        }

        // Sanitize filename: strip path components and use HtmlSanitizer for XSS protection
        var originalFileName = Path.GetFileName(file.FileName);
        var sanitizedFileName = sanitizer.Sanitize(originalFileName);
        
        // storage.UploadAsync should handle generating a safe unique name
        var fileId = await storage.UploadAsync(sanitizedFileName, stream, cancellationToken);
        var downloadUrl = $"{httpContext.Request.PathBase}/api/files/{fileId}";
        var response = new FileUploadResponse(fileId, sanitizedFileName, downloadUrl);

        return TypedResults.Created(downloadUrl, response);
    }

    private static async Task<IResult> DownloadFileAsync(
        string fileId,
        IFileStorage storage,
        CancellationToken cancellationToken)
    {
        if (!IsValidFileId(fileId))
        {
            return Results.BadRequest("Invalid file identifier.");
        }

        try
        {
            var stream = await storage.DownloadAsync(fileId, cancellationToken);
            var contentType = GetContentType(fileId);
            
            // Mitigate XSS: For anything that isn't a safe image, force download or use a restrictive content type
            var isSafeDisplayType = contentType.StartsWith("image/") || contentType == "application/pdf";
            
            return Results.File(
                stream, 
                contentType, 
                fileDownloadName: isSafeDisplayType ? null : fileId,
                enableRangeProcessing: true);
        }
        catch (FileNotFoundException)
        {
            return Results.NotFound();
        }
        catch (DirectoryNotFoundException)
        {
            return Results.NotFound();
        }
        catch (Amazon.S3.AmazonS3Exception exception) when (exception.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return Results.NotFound();
        }
    }

    private static async Task<IResult> DeleteFileAsync(
        string fileId,
        IFileStorage storage,
        CancellationToken cancellationToken)
    {
        if (!IsValidFileId(fileId))
        {
            return Results.BadRequest("Invalid file identifier.");
        }

        await storage.DeleteAsync(fileId, cancellationToken);
        return TypedResults.NoContent();
    }

    private static bool IsValidFileId(string fileId)
    {
        if (string.IsNullOrWhiteSpace(fileId)) return false;

        // Prevent path traversal: no path separators allowed
        if (fileId.Contains('/') || fileId.Contains('\\')) return false;

        // Basic check: should have an extension from our allowlist
        var extension = Path.GetExtension(fileId).ToLowerInvariant();
        return AllowedExtensions.Contains(extension);
    }

    private static string GetContentType(string fileId)
    {
        var extension = Path.GetExtension(fileId).ToLowerInvariant();

        return extension switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            ".json" => "application/json",
            _ => "application/octet-stream",
        };
    }
}