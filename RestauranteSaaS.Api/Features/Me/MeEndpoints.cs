using Microsoft.AspNetCore.Authorization;
using RestauranteSaaS.Api.Application.Abstractions;

namespace RestauranteSaaS.Api.Features.Me;

public static class MeEndpoints
{
    public static IEndpointRouteBuilder MapMeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/me", GetMeAsync)
            .RequireAuthorization()
            .WithTags("Me");

        return app;
    }

    private static IResult GetMeAsync(ICurrentUser currentUser, ICurrentContext currentContext)
    {
        return Results.Ok(new MeResponse(
            new UserIdentityResponse(
                currentUser.UserId,
                currentUser.SessionId,
                currentUser.Email),
            currentContext.TenantId,
            currentContext.OperationalUnitId,
            currentContext.TenantPermissions.Order(StringComparer.OrdinalIgnoreCase).ToArray(),
            currentContext.OperationalPermissions.Order(StringComparer.OrdinalIgnoreCase).ToArray()));
    }
}

public sealed record MeResponse(
    UserIdentityResponse Identity,
    Guid TenantId,
    Guid? OperationalUnitId,
    IReadOnlyList<string> TenantPermissions,
    IReadOnlyList<string> OperationalPermissions);

public sealed record UserIdentityResponse(Guid UserId, Guid SessionId, string Email);
