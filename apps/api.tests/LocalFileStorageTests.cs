using System.Text;
using Api.Infrastructure.Storage;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace Api.Tests;

public sealed class LocalFileStorageTests : IDisposable
{
    private readonly string _contentRootPath;
    private readonly LocalFileStorage _storage;

    public LocalFileStorageTests()
    {
        _contentRootPath = Path.Combine(Path.GetTempPath(), $"Example App-files-{Guid.NewGuid():N}");
        Directory.CreateDirectory(_contentRootPath);

        var environment = new TestWebHostEnvironment
        {
            ContentRootPath = _contentRootPath,
            ContentRootFileProvider = new PhysicalFileProvider(_contentRootPath),
            WebRootFileProvider = new NullFileProvider(),
        };

        _storage = new LocalFileStorage(environment);
    }

    [Fact]
    public async Task UploadAsync_ThenDownloadAsync_ReturnsUploadedBytes()
    {
        await using var uploadStream = new MemoryStream(Encoding.UTF8.GetBytes("hello files"));

        var fileId = await _storage.UploadAsync("greeting.txt", uploadStream);

        await using var downloadStream = await _storage.DownloadAsync(fileId);
        using var reader = new StreamReader(downloadStream, Encoding.UTF8);
        var content = await reader.ReadToEndAsync();

        Assert.Equal("hello files", content);
        Assert.EndsWith(".txt", fileId, StringComparison.Ordinal);
    }

    [Fact]
    public async Task DownloadAsync_WhenFileDoesNotExist_ThrowsFileNotFoundException()
    {
        await Assert.ThrowsAsync<FileNotFoundException>(() => _storage.DownloadAsync("missing.txt"));
    }

    public void Dispose()
    {
        if (Directory.Exists(_contentRootPath))
        {
            Directory.Delete(_contentRootPath, recursive: true);
        }
    }

    private sealed class TestWebHostEnvironment : IWebHostEnvironment
    {
        public string ApplicationName { get; set; } = "Api.Tests";
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = string.Empty;
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}