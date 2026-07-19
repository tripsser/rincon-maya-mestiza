namespace RestauranteSaaS.Api.Application.Abstractions;

public interface ICurrentContext
{
    Guid TenantId { get; }
    Guid? RestaurantId { get; }
    Guid? OperationalUnitId { get; }
    IReadOnlySet<string> TenantPermissions { get; }
    IReadOnlySet<string> RestaurantPermissions { get; }
    IReadOnlySet<string> OperationalPermissions { get; }
    bool HasTenantPermission(string permissionCode);
    bool HasRestaurantPermission(string permissionCode);
    bool HasOperationalPermission(string permissionCode);
}

public interface ICurrentContextSetter
{
    void Set(
        Guid tenantId,
        Guid? restaurantId,
        Guid? operationalUnitId,
        IReadOnlySet<string> tenantPermissions,
        IReadOnlySet<string> restaurantPermissions,
        IReadOnlySet<string> operationalPermissions);
}
