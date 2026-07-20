using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Infrastructure.Persistence;

namespace RestauranteSaaS.Api.Features.Tenant;

public static class RestaurantsEndpoints
{
    public static IEndpointRouteBuilder MapTenantRestaurantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tenant/restaurantes")
            .RequireAuthorization()
            .WithTags("Tenant - Restaurantes");

        group.MapGet("", GetRestaurantsAsync);
        group.MapGet("/{id:guid}", GetRestaurantAsync);
        group.MapGet("/{id:guid}/sucursales", GetRestaurantBranchesAsync);
        group.MapPost("", CreateRestaurantAsync);
        group.MapPut("/{id:guid}", UpdateRestaurantAsync);
        group.MapPatch("/{id:guid}/estado", UpdateRestaurantStatusAsync);

        return app;
    }

    private static async Task<Results<Ok<IReadOnlyList<RestaurantBranchResponse>>, NotFound>> GetRestaurantBranchesAsync(
        Guid id,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var restaurantExists = await dbContext.Restaurantes.AnyAsync(
            restaurante => restaurante.Id == id && restaurante.IdInquilino == currentContext.TenantId,
            cancellationToken);

        if (!restaurantExists)
        {
            return TypedResults.NotFound();
        }

        var branches = await dbContext.UnidadesOperativas
            .AsNoTracking()
            .Where(unidad => unidad.IdInquilino == currentContext.TenantId && unidad.IdRestaurante == id)
            .OrderBy(unidad => unidad.Nombre)
            .Select(unidad => new RestaurantBranchResponse(
                unidad.Id,
                unidad.Codigo,
                unidad.Nombre,
                unidad.Activo,
                unidad.FechaApertura))
            .ToArrayAsync(cancellationToken);

        return TypedResults.Ok<IReadOnlyList<RestaurantBranchResponse>>(branches);
    }

    private static async Task<Ok<IReadOnlyList<RestaurantListItemResponse>>> GetRestaurantsAsync(
        AppDbContext dbContext,
        ICurrentContext currentContext,
        string? busqueda,
        bool? activo,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Restaurantes
            .AsNoTracking()
            .Where(restaurante => restaurante.IdInquilino == currentContext.TenantId);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var pattern = $"%{busqueda.Trim()}%";
            query = query.Where(restaurante =>
                EF.Functions.ILike(restaurante.Codigo, pattern)
                || EF.Functions.ILike(restaurante.Nombre, pattern)
                || (restaurante.Descripcion != null && EF.Functions.ILike(restaurante.Descripcion, pattern)));
        }

        if (activo.HasValue)
        {
            query = query.Where(restaurante => restaurante.Activo == activo.Value);
        }

        var restaurants = await query
            .OrderBy(restaurante => restaurante.Nombre)
            .Select(restaurante => new RestaurantListItemResponse(
                restaurante.Id,
                restaurante.Codigo,
                restaurante.Nombre,
                restaurante.Descripcion,
                restaurante.LogoUrl,
                restaurante.Activo))
            .ToArrayAsync(cancellationToken);

        return TypedResults.Ok<IReadOnlyList<RestaurantListItemResponse>>(restaurants);
    }

    private static async Task<Results<Ok<RestaurantDetailResponse>, NotFound>> GetRestaurantAsync(
        Guid id,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var restaurant = await dbContext.Restaurantes
            .AsNoTracking()
            .Where(restaurante => restaurante.Id == id && restaurante.IdInquilino == currentContext.TenantId)
            .Select(restaurante => new RestaurantDetailResponse(
                restaurante.Id,
                restaurante.IdInquilino,
                restaurante.Codigo,
                restaurante.Nombre,
                restaurante.Descripcion,
                restaurante.LogoUrl,
                restaurante.Activo))
            .FirstOrDefaultAsync(cancellationToken);

        return restaurant is null ? TypedResults.NotFound() : TypedResults.Ok(restaurant);
    }

    private static async Task<Results<Created<RestaurantDetailResponse>, Conflict<string>, BadRequest<string>>> CreateRestaurantAsync(
        UpsertRestaurantRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return TypedResults.BadRequest(validationError);
        }

        var codigo = NormalizeCode(request.Codigo);
        var exists = await dbContext.Restaurantes.AnyAsync(
            restaurante => restaurante.IdInquilino == currentContext.TenantId && restaurante.Codigo == codigo,
            cancellationToken);

        if (exists)
        {
            return TypedResults.Conflict("Ya existe un restaurante con ese codigo en el inquilino actual.");
        }

        var restaurant = new Restaurante
        {
            IdInquilino = currentContext.TenantId,
            Codigo = codigo,
            Nombre = request.Nombre.Trim(),
            Descripcion = NormalizeOptional(request.Descripcion),
            LogoUrl = NormalizeOptional(request.LogoUrl),
            Activo = true
        };

        dbContext.Restaurantes.Add(restaurant);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = ToDetailResponse(restaurant);
        return TypedResults.Created($"/api/tenant/restaurantes/{restaurant.Id}", response);
    }

    private static async Task<Results<Ok<RestaurantDetailResponse>, NotFound, Conflict<string>, BadRequest<string>>> UpdateRestaurantAsync(
        Guid id,
        UpsertRestaurantRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return TypedResults.BadRequest(validationError);
        }

        var restaurant = await dbContext.Restaurantes
            .FirstOrDefaultAsync(
                restaurante => restaurante.Id == id && restaurante.IdInquilino == currentContext.TenantId,
                cancellationToken);

        if (restaurant is null)
        {
            return TypedResults.NotFound();
        }

        var codigo = NormalizeCode(request.Codigo);
        var codeExists = await dbContext.Restaurantes.AnyAsync(
            restaurante => restaurante.IdInquilino == currentContext.TenantId
                && restaurante.Id != id
                && restaurante.Codigo == codigo,
            cancellationToken);

        if (codeExists)
        {
            return TypedResults.Conflict("Ya existe otro restaurante con ese codigo en el inquilino actual.");
        }

        restaurant.Codigo = codigo;
        restaurant.Nombre = request.Nombre.Trim();
        restaurant.Descripcion = NormalizeOptional(request.Descripcion);
        restaurant.LogoUrl = NormalizeOptional(request.LogoUrl);

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToDetailResponse(restaurant));
    }

    private static async Task<Results<Ok<RestaurantDetailResponse>, NotFound>> UpdateRestaurantStatusAsync(
        Guid id,
        UpdateRestaurantStatusRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var restaurant = await dbContext.Restaurantes
            .FirstOrDefaultAsync(
                restaurante => restaurante.Id == id && restaurante.IdInquilino == currentContext.TenantId,
                cancellationToken);

        if (restaurant is null)
        {
            return TypedResults.NotFound();
        }

        restaurant.Activo = request.Activo;
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToDetailResponse(restaurant));
    }

    private static string? Validate(UpsertRestaurantRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Codigo))
        {
            return "El codigo es requerido.";
        }

        if (request.Codigo.Trim().Length > 40)
        {
            return "El codigo no puede exceder 40 caracteres.";
        }

        if (string.IsNullOrWhiteSpace(request.Nombre))
        {
            return "El nombre es requerido.";
        }

        if (request.Nombre.Trim().Length > 150)
        {
            return "El nombre no puede exceder 150 caracteres.";
        }

        return null;
    }

    private static string NormalizeCode(string value)
    {
        return value.Trim().ToUpperInvariant();
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static RestaurantDetailResponse ToDetailResponse(Restaurante restaurant)
    {
        return new RestaurantDetailResponse(
            restaurant.Id,
            restaurant.IdInquilino,
            restaurant.Codigo,
            restaurant.Nombre,
            restaurant.Descripcion,
            restaurant.LogoUrl,
            restaurant.Activo);
    }
}

public sealed record RestaurantListItemResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    string? LogoUrl,
    bool Activo);

public sealed record RestaurantDetailResponse(
    Guid Id,
    Guid IdInquilino,
    string Codigo,
    string Nombre,
    string? Descripcion,
    string? LogoUrl,
    bool Activo);

public sealed record UpsertRestaurantRequest(
    string Codigo,
    string Nombre,
    string? Descripcion,
    string? LogoUrl);

public sealed record UpdateRestaurantStatusRequest(bool Activo);

public sealed record RestaurantBranchResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    bool Activo,
    DateTime? FechaApertura);
