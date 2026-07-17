namespace RestauranteSaaS.Api.Application.Abstractions;

public interface ICurrentContext
{
    Guid TenantId { get; }
    Guid? OperationalUnitId { get; }
    IReadOnlySet<string> TenantPermissions { get; }
    IReadOnlySet<string> OperationalPermissions { get; }
    bool HasTenantPermission(string permissionCode);
    bool HasOperationalPermission(string permissionCode);
}

public interface ICurrentContextSetter
{
    void Set(
        Guid tenantId,
        Guid? operationalUnitId,
        IReadOnlySet<string> tenantPermissions,
        IReadOnlySet<string> operationalPermissions);
}
