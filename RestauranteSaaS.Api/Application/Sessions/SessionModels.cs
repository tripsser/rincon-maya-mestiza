namespace RestauranteSaaS.Api.Application.Sessions;

public sealed record UserSession(
    Guid UserId,
    string Email,
    IReadOnlyList<TenantScope> TenantScopes,
    IReadOnlyList<RestaurantScope> RestaurantScopes,
    IReadOnlyList<OperationalScope> OperationalScopes,
    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt);

public sealed record TenantScope(
    Guid TenantId,
    Guid AssignmentId,
    Guid RoleId,
    string RoleCode,
    string RoleName,
    IReadOnlyList<string> AllowedPermissions,
    IReadOnlyList<string> DeniedPermissions);

public sealed record RestaurantScope(
    Guid TenantId,
    Guid RestaurantId,
    Guid AssignmentId,
    Guid RoleId,
    string RoleCode,
    string RoleName,
    IReadOnlyList<string> AllowedPermissions,
    IReadOnlyList<string> DeniedPermissions);

public sealed record OperationalScope(
    Guid TenantId,
    Guid RestaurantId,
    Guid OperationalUnitId,
    Guid EmployeeId,
    Guid AssignmentId,
    Guid RoleId,
    string RoleName,
    IReadOnlyList<string> AllowedPermissions,
    IReadOnlyList<string> DeniedPermissions);

public sealed record CreatedSession(Guid SessionId, UserSession Session);
