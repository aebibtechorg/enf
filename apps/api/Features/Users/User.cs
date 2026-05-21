namespace Api.Features.Users;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ENF-specific fields
    public bool IsEnp { get; set; }
    public string? CommissionNumber { get; set; }
    public DateTime? CommissionExpiry { get; set; }
    public string? RollNumber { get; set; }
    public string? IbpNumber { get; set; }
    public string? RegularPlaceOfBusiness { get; set; }
    public string EkycStatus { get; set; } = "none";
    public string? DigitalCertificate { get; set; } // Base64 encoded X.509
}
