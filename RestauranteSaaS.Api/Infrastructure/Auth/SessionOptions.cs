namespace RestauranteSaaS.Api.Infrastructure.Auth;

public sealed class DistributedSessionOptions
{
    public const string SectionName = "Session";

    public int ExpirationMinutes { get; set; } = 15;
    public string KeyPrefix { get; set; } = "session";
}
