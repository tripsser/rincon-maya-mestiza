using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Infrastructure.Auth;

namespace RestauranteSaaS.Api.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", LoginAsync).AllowAnonymous();

        return app;
    }

    private static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        UserManager<ApplicationUser> userManager,
        ISessionService sessionService,
        IJwtTokenService jwtTokenService,
        IOptions<JwtOptions> jwtOptions,
        HttpContext httpContext,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.Activo || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Results.Unauthorized();
        }

        var createdSession = await sessionService.CreateSessionAsync(user.Id, cancellationToken);
        var token = jwtTokenService.CreateToken(createdSession.SessionId, createdSession.Session);

        httpContext.Response.Cookies.Append(
            jwtOptions.Value.CookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = createdSession.Session.ExpiresAt
            });

        return Results.Ok(new LoginResponse(
            user.Id,
            createdSession.SessionId,
            createdSession.Session.ExpiresAt));
    }
}

public sealed record LoginRequest(string Email, string Password);

public sealed record LoginResponse(Guid UserId, Guid SessionId, DateTimeOffset ExpiresAt);
