using Api.Features.Users;

namespace Api.Features.Notarization;

public enum DocumentStatus
{
    Uploaded,
    SignedByPrincipal,
    SignedByEnp,
    Completed,
    Rejected
}

public class NotarizationDocument
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileId { get; set; } = string.Empty; // Reference to stored file
    public DocumentStatus Status { get; set; } = DocumentStatus.Uploaded;
    
    public Guid PrincipalId { get; set; }
    public User Principal { get; set; } = null!;
    
    public Guid? EnpId { get; set; }
    public User? Enp { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    
    // Hash of the document content to ensure integrity
    public string ContentHash { get; set; } = string.Empty;
    
    // PDF/A version file ID (once converted)
    public string? PdfAFileId { get; set; }
}