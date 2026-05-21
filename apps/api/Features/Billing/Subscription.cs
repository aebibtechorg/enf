namespace Api.Features.Billing;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime? EndsAt { get; set; }
}
