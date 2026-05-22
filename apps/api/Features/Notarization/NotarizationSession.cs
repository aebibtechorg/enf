using Api.Features.Users;

namespace Api.Features.Notarization;

public enum SessionType
{
    Ien, // In-person Electronic Notarization
    Ren  // Remote Electronic Notarization
}

public enum LocationType
{
    Philippines,
    EmbassyConsulate, // Limited extraterritorial case
    Other // Generally prohibited for REN
}

public class NotarizationSession
{
    public Guid Id { get; set; }
    public SessionType Type { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    
    public Guid PrincipalId { get; set; }
    public User Principal { get; set; } = null!;
    
    public Guid EnpId { get; set; }
    public User Enp { get; set; } = null!;
    
    // REN specific
    public string? MeetingUrl { get; set; }
    public string? RecordingFileId { get; set; }
    
    // Geolocation verification
    public string? PrincipalLocation { get; set; }
    public LocationType PrincipalLocationType { get; set; } = LocationType.Philippines;
    
    public string? EnpLocation { get; set; }
    public LocationType EnpLocationType { get; set; } = LocationType.Philippines;
    
    public bool GeolocationVerified { get; set; }
    
    public string? SumsubInspectionId { get; set; }
    
    public List<NotarizationDocument> Documents { get; set; } = [];
    public List<NotarizationWitness> Witnesses { get; set; } = [];
}