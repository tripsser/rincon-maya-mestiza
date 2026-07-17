using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Application.Sessions;

namespace RestauranteSaaS.Api.Application.Auth;

public sealed class CurrentUser : ICurrentUser, ICurrentUserSetter
{
    private UserSession? session;

    public bool IsAuthenticated => session is not null;
    public Guid UserId => session?.UserId ?? throw new InvalidOperationException("No authenticated user is available.");
    public Guid SessionId { get; private set; }
    public string Email => session?.Email ?? throw new InvalidOperationException("No authenticated user is available.");
    public UserSession Session => session ?? throw new InvalidOperationException("No authenticated user is available.");

    public void Set(Guid sessionId, UserSession session)
    {
        SessionId = sessionId;
        this.session = session;
    }
}
