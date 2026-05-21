namespace Api.Infrastructure.Storage;

public interface IFileStorage
{
    Task<string> UploadAsync(string fileName, Stream content, CancellationToken cancellationToken = default);
    Task<Stream> DownloadAsync(string fileId, CancellationToken cancellationToken = default);
    Task DeleteAsync(string fileId, CancellationToken cancellationToken = default);
}
