using RestauranteSaaS.Api.Application.Abstractions;

namespace RestauranteSaaS.Api.Application.Auth;

public sealed class CurrentContext : ICurrentContext, ICurrentContextSetter
{
    private IReadOnlySet<string> tenantPermissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    private IReadOnlySet<string> operationalPermissions = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

    public Guid TenantId { get; private set; }
    public Guid? OperationalUnitId { get; private set; }
    public IReadOnlySet<string> TenantPermissions => tenantPermissions;
    public IReadOnlySet<string> OperationalPermissions => operationalPermissions;

    public bool HasTenantPermission(string permissionCode) => tenantPermissions.Contains(permissionCode);
    public bool HasOperationalPermission(string permissionCode) => operationalPermissions.Contains(permissionCode);

    public void Set(
        Guid tenantId,
        Guid? operationalUnitId,
        IReadOnlySet<string> tenantPermissions,
        IReadOnlySet<string> operationalPermissions)
    {
        TenantId = tenantId;
        OperationalUnitId = operationalUnitId;
        this.tenantPermissions = tenantPermissions;
        this.operationalPermissions = operationalPermissions;
    }
}
