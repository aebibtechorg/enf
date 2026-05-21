using Api.Features.Files;
using Api.Infrastructure.Storage;
using Api.Shared.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using NSubstitute;
using MimeDetective;
using MimeDetective.Engine;
using MimeDetective.Storage;
using System.Collections.Immutable;
using System.Linq;

namespace Api.Tests;

public class FileEndpointsTests
{
    private readonly IFileStorage _storage = Substitute.For<IFileStorage>();
    private readonly IHtmlSanitizerService _sanitizer = Substitute.For<IHtmlSanitizerService>();
    private readonly IContentInspector _inspector;
    private readonly HttpContext _httpContext = new DefaultHttpContext();

    public FileEndpointsTests()
    {
        _sanitizer.Sanitize(Arg.Any<string>()).Returns(x => x.Arg<string>());

        _inspector = new ContentInspectorBuilder
        {
            Definitions = MimeDetective.Definitions.DefaultDefinitions.All()
        }.Build();
    }

    [Fact]
    public async Task UploadFileAsync_WhenSignatureMatchesExtension_ReturnsCreated()
    {
        // Arrange
        var file = CreateMockFile("test.png", "image/png", [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        _storage.UploadAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns("test-id.png");

        // Act
        var uploadResult = await FileEndpoints.UploadFileAsync(file, _storage, _sanitizer, _inspector, _httpContext, default);

        // Assert
        Assert.IsType<Created<Contracts.FileUploadResponse>>(uploadResult.Result);
    }

    [Fact]
    public async Task UploadFileAsync_WhenSignatureDoesNotMatchExtension_ReturnsValidationProblem()
    {
        // Arrange
        var file = CreateMockFile("test.png", "image/png", [0xFF, 0xD8, 0xFF, 0xE0]); // JPEG Header

        // Act
        var uploadResult = await FileEndpoints.UploadFileAsync(file, _storage, _sanitizer, _inspector, _httpContext, default);

        // Assert
        var problem = Assert.IsType<ValidationProblem>(uploadResult.Result);
        Assert.True(problem.ProblemDetails.Errors.ContainsKey("file"));
        Assert.Contains("File content does not match extension", problem.ProblemDetails.Errors["file"][0]);
    }

    [Fact]
    public async Task UploadFileAsync_WhenSignatureIsUnknownForBinaryExtension_ReturnsValidationProblem()
    {
        // Arrange
        var file = CreateMockFile("test.png", "image/png", [0x00, 0x00, 0x00]);

        // Act
        var uploadResult = await FileEndpoints.UploadFileAsync(file, _storage, _sanitizer, _inspector, _httpContext, default);

        // Assert
        var problem = Assert.IsType<ValidationProblem>(uploadResult.Result);
        Assert.True(problem.ProblemDetails.Errors.ContainsKey("file"));
        Assert.Contains("File content does not match extension", problem.ProblemDetails.Errors["file"][0]);
    }

    [Fact]
    public async Task UploadFileAsync_WhenExtensionIsText_SkipsSignatureCheck()
    {
        // Arrange
        var file = CreateMockFile("test.txt", "text/plain", "hello world"u8.ToArray());
        _storage.UploadAsync(Arg.Any<string>(), Arg.Any<Stream>(), Arg.Any<CancellationToken>())
            .Returns("test-id.txt");

        // Act
        var uploadResult = await FileEndpoints.UploadFileAsync(file, _storage, _sanitizer, _inspector, _httpContext, default);

        // Assert
        Assert.IsType<Created<Contracts.FileUploadResponse>>(uploadResult.Result);
    }

    private static IFormFile CreateMockFile(string fileName, string contentType, byte[] content)
    {
        var stream = new MemoryStream(content);
        var file = Substitute.For<IFormFile>();
        file.FileName.Returns(fileName);
        file.ContentType.Returns(contentType);
        file.Length.Returns(content.Length);
        file.OpenReadStream().Returns(stream);
        return file;
    }
}
