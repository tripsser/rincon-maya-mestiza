using RestauranteSaaS.Api.Application.Sessions;

namespace RestauranteSaaS.Api.Application.Abstractions;

public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    Guid SessionId { get; }
    string Email { get; }
    UserSession Session { get; }
}

public interface ICurrentUserSetter
{
    void Set(Guid sessionId, UserSession session);
}
