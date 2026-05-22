namespace Api.Features.Notarization;

public class NotarizationWitness
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string IdentityEvidence { get; set; } = string.Empty; // Rule VIII, Sec 2, a, vi
    public string? Signature { get; set; } // Electronic signature
    
    public Guid? SessionId { get; set; }
    public Guid? BookEntryId { get; set; }
}