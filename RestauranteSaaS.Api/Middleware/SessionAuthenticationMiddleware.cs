using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using RestauranteSaaS.Api.Application.Abstractions;

namespace RestauranteSaaS.Api.Middleware;

public sealed class SessionAuthenticationMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(
        HttpContext httpContext,
        ISessionService sessionService,
        ICurrentUserSetter currentUser)
    {
        var cancellationToken = httpContext.RequestAborted;

        if (httpContext.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() is not null)
        {
            await next(httpContext);
            return;
        }

        if (httpContext.User.Identity?.IsAuthenticated != true)
        {
            await next(httpContext);
            return;
        }

        var rawSessionId = httpContext.User.FindFirst(JwtRegisteredClaimNames.Sid)?.Value
            ?? httpContext.User.FindFirst("sid")?.Value;

        if (!Guid.TryParse(rawSessionId, out var sessionId))
        {
            httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await httpContext.Response.WriteAsync("Invalid session token.", cancellationToken);
            return;
        }

        var session = await sessionService.GetSessionAsync(sessionId, cancellationToken);
        if (session is null)
        {
            httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await httpContext.Response.WriteAsync("Session expired or revoked.", cancellationToken);
            return;
        }

        currentUser.Set(sessionId, session);
        await next(httpContext);
    }
}
