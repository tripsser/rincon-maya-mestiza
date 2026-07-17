using RestauranteSaaS.Api.Application.Sessions;

namespace RestauranteSaaS.Api.Application.Abstractions;

public interface IJwtTokenService
{
    string CreateToken(Guid sessionId, UserSession session);
}
