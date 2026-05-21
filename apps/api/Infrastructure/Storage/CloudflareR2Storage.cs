using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;

namespace Api.Infrastructure.Storage;

public class CloudflareR2Storage : IFileStorage
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;

    public CloudflareR2Storage(IConfiguration config)
    {
        var accessKey = config["Storage:R2:AccessKey"];
        var secretKey = config["Storage:R2:SecretKey"];
        var endpoint = config["Storage:R2:Endpoint"];
        _bucketName = config["Storage:R2:BucketName"] ?? "Example App";

        var s3Config = new AmazonS3Config
        {
            ServiceURL = endpoint,
            ForcePathStyle = true
        };

        _s3Client = new AmazonS3Client(accessKey, secretKey, s3Config);
    }

    public async Task<string> UploadAsync(string fileName, Stream content, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName);
        var fileId = Guid.NewGuid().ToString() + extension;
        
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = content,
            Key = fileId,
            BucketName = _bucketName,
        };

        var fileTransferUtility = new TransferUtility(_s3Client);
        await fileTransferUtility.UploadAsync(uploadRequest, cancellationToken);

        return fileId;
    }

    public async Task<Stream> DownloadAsync(string fileId, CancellationToken cancellationToken = default)
    {
        var safeFileId = Path.GetFileName(fileId);
        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = safeFileId
        };

        var response = await _s3Client.GetObjectAsync(request, cancellationToken);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(string fileId, CancellationToken cancellationToken = default)
    {
        var safeFileId = Path.GetFileName(fileId);
        var deleteObjectRequest = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = safeFileId
        };

        await _s3Client.DeleteObjectAsync(deleteObjectRequest, cancellationToken);
    }
}
