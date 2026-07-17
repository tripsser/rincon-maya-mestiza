using RestauranteSaaS.Api.Application.Sessions;

namespace RestauranteSaaS.Api.Application.Abstractions;

public interface ISessionService
{
    Task<CreatedSession> CreateSessionAsync(Guid userId, CancellationToken cancellationToken);
    Task<UserSession?> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<UserSession?> RefreshSessionAsync(Guid sessionId, CancellationToken cancellationToken);
    Task RevokeSessionAsync(Guid sessionId, CancellationToken cancellationToken);
}
