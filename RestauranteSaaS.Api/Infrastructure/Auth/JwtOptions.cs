namespace RestauranteSaaS.Api.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "RestauranteSaaS";
    public string Audience { get; set; } = "RestauranteSaaS";
    public string SigningKey { get; set; } = "development-only-change-this-signing-key-32-chars";
    public int ExpirationMinutes { get; set; } = 15;
    public string CookieName { get; set; } = "access_token";
}
