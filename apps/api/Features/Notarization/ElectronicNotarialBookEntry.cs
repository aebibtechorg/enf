using Api.Features.Users;

namespace Api.Features.Notarization;

public class ElectronicNotarialBookEntry
{
    public Guid Id { get; set; }
    
    // Rule VIII, Sec 2 requirements
    public string NotarialAct { get; set; } = string.Empty; // e.g. Acknowledgment, Jurat
    public DateTime PerformedAt { get; set; }
    public string DocumentTitle { get; set; } = string.Empty;
    
    public Guid PrincipalId { get; set; }
    public User Principal { get; set; } = null!;
    
    public string PrincipalAddress { get; set; } = string.Empty;
    public string PrincipalIdentityEvidence { get; set; } = string.Empty; // Competent Evidence of Identity used
    
    public decimal FeeCharged { get; set; }
    
    public SessionType Mode { get; set; } // IEN or REN
    public LocationType PrincipalLocationType { get; set; }
    public string PrincipalActualLocation { get; set; } = string.Empty; // Verified physical location
    
    public string? Remarks { get; set; }
    
    public Guid EnpId { get; set; }
    public User Enp { get; set; } = null!;
    
    // Reference to the resulting notarized document
    public string NotarizedFileId { get; set; } = string.Empty;
    
    // Chronological indexing
    public int EntryNumber { get; set; }

    public List<NotarizationWitness> Witnesses { get; set; } = [];
}