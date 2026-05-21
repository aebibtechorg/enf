namespace Api.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly string _storagePath;

    public LocalFileStorage(IWebHostEnvironment env)
    {
        _storagePath = Path.Combine(env.ContentRootPath, "Storage");
        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> UploadAsync(string fileName, Stream content, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);
        var fileId = Guid.NewGuid().ToString() + extension;
        var filePath = Path.Combine(_storagePath, fileId);
        
        using var fileStream = File.Create(filePath);
        await content.CopyToAsync(fileStream, cancellationToken);
        return fileId;
    }

    public Task<Stream> DownloadAsync(string fileId, CancellationToken cancellationToken = default)
    {
        // Path.GetFileName strips any directory info, preventing traversal
        var safeFileId = Path.GetFileName(fileId);
        var filePath = Path.Combine(_storagePath, safeFileId);
        
        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException($"File '{fileId}' was not found.", fileId);
        }

        return Task.FromResult<Stream>(File.OpenRead(filePath));
    }

    public Task DeleteAsync(string fileId, CancellationToken cancellationToken = default)
    {
        var safeFileId = Path.GetFileName(fileId);
        var filePath = Path.Combine(_storagePath, safeFileId);
        
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }
}
