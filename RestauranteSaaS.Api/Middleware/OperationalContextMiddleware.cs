using Microsoft.AspNetCore.Authorization;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Application.Sessions;

namespace RestauranteSaaS.Api.Middleware;

public sealed class OperationalContextMiddleware(RequestDelegate next)
{
    private const string TenantHeader = "X-Tenant-Id";
    private const string OperationalUnitHeader = "X-Operational-Unit-Id";

    public async Task InvokeAsync(
        HttpContext httpContext,
        ICurrentUser currentUser,
        ICurrentContextSetter currentContext)
    {
        var cancellationToken = httpContext.RequestAborted;

        if (httpContext.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() is not null || !currentUser.IsAuthenticated)
        {
            await next(httpContext);
            return;
        }

        if (!TryReadGuidHeader(httpContext, TenantHeader, out var tenantId))
        {
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsync($"Missing or invalid {TenantHeader}.", cancellationToken);
            return;
        }

        var hasOperationalUnitHeader = TryReadGuidHeader(httpContext, OperationalUnitHeader, out var operationalUnitId);
        var tenantScopes = currentUser.Session.TenantScopes
            .Where(scope => scope.TenantId == tenantId)
            .ToArray();

        var operationalScopes = hasOperationalUnitHeader
            ? currentUser.Session.OperationalScopes
                .Where(scope => scope.TenantId == tenantId && scope.OperationalUnitId == operationalUnitId)
                .ToArray()
            : Array.Empty<OperationalScope>();

        var hasTenantAccess = tenantScopes.Length > 0;
        var hasOperationalAccess = hasOperationalUnitHeader && operationalScopes.Length > 0;

        if (!hasTenantAccess && !hasOperationalAccess)
        {
            httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
            await httpContext.Response.WriteAsync("User does not have access to the requested tenant or operational unit.", cancellationToken);
            return;
        }

        var tenantPermissions = AggregatePermissions(
            tenantScopes.Select(scope => scope.AllowedPermissions),
            tenantScopes.Select(scope => scope.DeniedPermissions));

        var operationalPermissions = AggregatePermissions(
            operationalScopes.Select(scope => scope.AllowedPermissions),
            operationalScopes.Select(scope => scope.DeniedPermissions));

        currentContext.Set(
            tenantId,
            hasOperationalUnitHeader ? operationalUnitId : null,
            tenantPermissions,
            operationalPermissions);

        await next(httpContext);
    }

    private static bool TryReadGuidHeader(HttpContext httpContext, string headerName, out Guid value)
    {
        value = default;
        return httpContext.Request.Headers.TryGetValue(headerName, out var rawValue)
            && Guid.TryParse(rawValue.FirstOrDefault(), out value);
    }

    private static IReadOnlySet<string> AggregatePermissions(
        IEnumerable<IReadOnlyList<string>> allowedGroups,
        IEnumerable<IReadOnlyList<string>> deniedGroups)
    {
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var permission in allowedGroups.SelectMany(group => group))
        {
            allowed.Add(permission);
        }

        foreach (var permission in deniedGroups.SelectMany(group => group))
        {
            allowed.Remove(permission);
        }

        return allowed;
    }
}
