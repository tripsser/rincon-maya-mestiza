using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Application.Sessions;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Infrastructure.Persistence;
using StackExchange.Redis;

namespace RestauranteSaaS.Api.Infrastructure.Auth;

public sealed class SessionService(
    AppDbContext dbContext,
    UserManager<ApplicationUser> userManager,
    IConnectionMultiplexer redis,
    IOptions<DistributedSessionOptions> options) : ISessionService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly DistributedSessionOptions sessionOptions = options.Value;

    public async Task<CreatedSession> CreateSessionAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sessionId = Guid.NewGuid();
        var session = await BuildSessionAsync(userId, cancellationToken);
        await StoreSessionAsync(sessionId, session);
        return new CreatedSession(sessionId, session);
    }

    public async Task<UserSession?> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var payload = await redis.GetDatabase().StringGetAsync(GetKey(sessionId));
        var session = payload.IsNullOrEmpty
            ? null
            : JsonSerializer.Deserialize<UserSession>(payload!, JsonOptions);

        if (session is not null && NeedsRuntimeRefresh(session))
        {
            session = await BuildSessionAsync(session.UserId, cancellationToken);
            await StoreSessionAsync(sessionId, session);
        }

        return session;
    }

    public async Task<UserSession?> RefreshSessionAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var current = await GetSessionAsync(sessionId, cancellationToken);
        if (current is null)
        {
            return null;
        }

        var refreshed = await BuildSessionAsync(current.UserId, cancellationToken);
        await StoreSessionAsync(sessionId, refreshed);
        return refreshed;
    }

    public Task RevokeSessionAsync(Guid sessionId, CancellationToken cancellationToken)
        => redis.GetDatabase().KeyDeleteAsync(GetKey(sessionId));

    private async Task<UserSession> BuildSessionAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var user = await userManager.Users.AsNoTracking()
            .SingleAsync(row => row.Id == userId, cancellationToken);

        var tenantScopes = await BuildTenantScopesAsync(userId, cancellationToken);
        var restaurantScopes = await BuildRestaurantScopesAsync(userId, cancellationToken);
        var operationalScopes = await BuildOperationalScopesAsync(userId, cancellationToken);

        return new UserSession(
            user.Id,
            user.Email ?? string.Empty,
            tenantScopes,
            restaurantScopes,
            operationalScopes,
            now,
            now.AddMinutes(sessionOptions.ExpirationMinutes));
    }

    private async Task<IReadOnlyList<TenantScope>> BuildTenantScopesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var assignments = await (
            from assignment in dbContext.AsignacionesInquilino.AsNoTracking()
            join role in dbContext.RolesInquilino.AsNoTracking() on assignment.IdRoleInquilino equals role.Id
            where assignment.IdUsuario == userId
                && assignment.Activo
                && role.Activo
                && assignment.FechaInicio <= today
                && (assignment.FechaFin == null || assignment.FechaFin >= today)
            select new
            {
                Assignment = assignment,
                Role = role
            }).ToListAsync(cancellationToken);

        var scopes = new List<TenantScope>();
        foreach (var item in assignments)
        {
            var rolePermissions = await (
                from rolePermission in dbContext.RolesInquilinoPermisos.AsNoTracking()
                join permission in dbContext.PermisosInquilino.AsNoTracking()
                    on rolePermission.IdPermisoInquilino equals permission.Id
                where rolePermission.IdRoleInquilino == item.Role.Id
                select permission.Codigo).ToListAsync(cancellationToken);

            var directPermissions = await (
                from assignmentPermission in dbContext.AsignacionesInquilinoPermisos.AsNoTracking()
                join permission in dbContext.PermisosInquilino.AsNoTracking()
                    on assignmentPermission.IdPermisoInquilino equals permission.Id
                where assignmentPermission.IdAsignacionInquilino == item.Assignment.Id
                select new { permission.Codigo, assignmentPermission.Permitido }).ToListAsync(cancellationToken);

            var allowed = new HashSet<string>(rolePermissions, StringComparer.OrdinalIgnoreCase);
            var denied = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var direct in directPermissions)
            {
                if (direct.Permitido)
                {
                    allowed.Add(direct.Codigo);
                }
                else
                {
                    denied.Add(direct.Codigo);
                    allowed.Remove(direct.Codigo);
                }
            }

            scopes.Add(new TenantScope(
                item.Assignment.IdInquilino,
                item.Assignment.Id,
                item.Role.Id,
                item.Role.Codigo,
                item.Role.Nombre,
                allowed.Order(StringComparer.OrdinalIgnoreCase).ToArray(),
                denied.Order(StringComparer.OrdinalIgnoreCase).ToArray()));
        }

        return scopes;
    }

    private async Task<IReadOnlyList<RestaurantScope>> BuildRestaurantScopesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var assignments = await (
            from assignment in dbContext.AsignacionesRestaurante.AsNoTracking()
            join restaurant in dbContext.Restaurantes.AsNoTracking() on assignment.IdRestaurante equals restaurant.Id
            join role in dbContext.RolesRestaurante.AsNoTracking() on assignment.IdRoleRestaurante equals role.Id
            where assignment.IdUsuario == userId
                && assignment.Activo
                && restaurant.Activo
                && role.Activo
                && assignment.FechaInicio <= today
                && (assignment.FechaFin == null || assignment.FechaFin >= today)
            select new
            {
                Assignment = assignment,
                Restaurant = restaurant,
                Role = role
            }).ToListAsync(cancellationToken);

        var scopes = new List<RestaurantScope>();
        foreach (var item in assignments)
        {
            var rolePermissions = await (
                from rolePermission in dbContext.RolesRestaurantePermisos.AsNoTracking()
                join permission in dbContext.PermisosRestaurante.AsNoTracking()
                    on rolePermission.IdPermisoRestaurante equals permission.Id
                where rolePermission.IdRoleRestaurante == item.Role.Id
                select permission.Codigo).ToListAsync(cancellationToken);

            var directPermissions = await (
                from assignmentPermission in dbContext.AsignacionesRestaurantePermisos.AsNoTracking()
                join permission in dbContext.PermisosRestaurante.AsNoTracking()
                    on assignmentPermission.IdPermisoRestaurante equals permission.Id
                where assignmentPermission.IdAsignacionRestaurante == item.Assignment.Id
                select new { permission.Codigo, assignmentPermission.Permitido }).ToListAsync(cancellationToken);

            var allowed = new HashSet<string>(rolePermissions, StringComparer.OrdinalIgnoreCase);
            var denied = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var direct in directPermissions)
            {
                if (direct.Permitido)
                {
                    allowed.Add(direct.Codigo);
                }
                else
                {
                    denied.Add(direct.Codigo);
                    allowed.Remove(direct.Codigo);
                }
            }

            scopes.Add(new RestaurantScope(
                item.Restaurant.IdInquilino,
                item.Restaurant.Id,
                item.Assignment.Id,
                item.Role.Id,
                item.Role.Codigo,
                item.Role.Nombre,
                allowed.Order(StringComparer.OrdinalIgnoreCase).ToArray(),
                denied.Order(StringComparer.OrdinalIgnoreCase).ToArray()));
        }

        return scopes;
    }

    private async Task<IReadOnlyList<OperationalScope>> BuildOperationalScopesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var assignments = await (
            from employee in dbContext.Empleados.AsNoTracking()
            join assignment in dbContext.AsignacionesOperativas.AsNoTracking() on employee.Id equals assignment.IdEmpleado
            join unit in dbContext.UnidadesOperativas.AsNoTracking() on assignment.IdUnidadOperativa equals unit.Id
            join role in dbContext.RolesOperativos.AsNoTracking() on assignment.IdRoleOperativo equals role.Id
            where employee.IdUsuario == userId
                && employee.Activo
                && assignment.Activo
                && unit.Activo
                && assignment.FechaInicio <= today
                && (assignment.FechaFin == null || assignment.FechaFin >= today)
            select new
            {
                Employee = employee,
                Assignment = assignment,
                Unit = unit,
                Role = role
            }).ToListAsync(cancellationToken);

        var scopes = new List<OperationalScope>();
        foreach (var item in assignments)
        {
            var rolePermissions = await (
                from rolePermission in dbContext.RolesOperativosPermisos.AsNoTracking()
                join permission in dbContext.PermisosOperativos.AsNoTracking()
                    on rolePermission.IdPermisoOperativo equals permission.Id
                where rolePermission.IdRoleOperativo == item.Role.Id
                select permission.Codigo).ToListAsync(cancellationToken);

            var directPermissions = await (
                from assignmentPermission in dbContext.AsignacionesOperativasPermisos.AsNoTracking()
                join permission in dbContext.PermisosOperativos.AsNoTracking()
                    on assignmentPermission.IdPermisoOperativo equals permission.Id
                where assignmentPermission.IdAsignacionOperativa == item.Assignment.Id
                select new { permission.Codigo, assignmentPermission.Permitido }).ToListAsync(cancellationToken);

            var allowed = new HashSet<string>(rolePermissions, StringComparer.OrdinalIgnoreCase);
            var denied = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var direct in directPermissions)
            {
                if (direct.Permitido)
                {
                    allowed.Add(direct.Codigo);
                }
                else
                {
                    denied.Add(direct.Codigo);
                    allowed.Remove(direct.Codigo);
                }
            }

            scopes.Add(new OperationalScope(
                item.Unit.IdInquilino,
                item.Unit.IdRestaurante,
                item.Unit.Id,
                item.Employee.Id,
                item.Assignment.Id,
                item.Role.Id,
                item.Role.Nombre,
                allowed.Order(StringComparer.OrdinalIgnoreCase).ToArray(),
                denied.Order(StringComparer.OrdinalIgnoreCase).ToArray()));
        }

        return scopes;
    }

    private Task StoreSessionAsync(Guid sessionId, UserSession session)
    {
        var payload = JsonSerializer.Serialize(session, JsonOptions);
        return redis.GetDatabase().StringSetAsync(GetKey(sessionId), payload, session.ExpiresAt - DateTimeOffset.UtcNow);
    }

    private static bool NeedsRuntimeRefresh(UserSession session)
        => session.RestaurantScopes is null
            || session.OperationalScopes.Any(scope => scope.RestaurantId == Guid.Empty);

    private string GetKey(Guid sessionId) => $"{sessionOptions.KeyPrefix}:{sessionId}";
}
