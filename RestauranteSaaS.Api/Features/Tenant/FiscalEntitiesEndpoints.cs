using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Infrastructure.Persistence;

namespace RestauranteSaaS.Api.Features.Tenant;

public static class FiscalEntitiesEndpoints
{
    public static IEndpointRouteBuilder MapTenantFiscalEntityEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tenant/entidades-fiscales")
            .RequireAuthorization()
            .WithTags("Tenant - Entidades fiscales");

        group.MapGet("", GetFiscalEntitiesAsync);
        group.MapGet("/{id:guid}", GetFiscalEntityAsync);
        group.MapGet("/{id:guid}/unidades-operativas", GetFiscalEntityOperationalUnitsAsync);
        group.MapPost("", CreateFiscalEntityAsync);
        group.MapPut("/{id:guid}", UpdateFiscalEntityAsync);
        group.MapPatch("/{id:guid}/estado", UpdateFiscalEntityStatusAsync);

        return app;
    }

    private static async Task<Ok<IReadOnlyList<FiscalEntityResponse>>> GetFiscalEntitiesAsync(
        AppDbContext dbContext,
        ICurrentContext currentContext,
        string? busqueda,
        bool? activo,
        CancellationToken cancellationToken)
    {
        var query = dbContext.EntidadesFiscales
            .AsNoTracking()
            .Where(entity => entity.IdInquilino == currentContext.TenantId);

        if (!string.IsNullOrWhiteSpace(busqueda))
        {
            var pattern = $"%{busqueda.Trim()}%";
            query = query.Where(entity =>
                EF.Functions.ILike(entity.Rfc, pattern)
                || EF.Functions.ILike(entity.RazonSocial, pattern)
                || EF.Functions.ILike(entity.RegimenFiscal, pattern)
                || (entity.Correo != null && EF.Functions.ILike(entity.Correo, pattern))
                || (entity.Telefono != null && EF.Functions.ILike(entity.Telefono, pattern)));
        }

        if (activo.HasValue)
        {
            query = query.Where(entity => entity.Activo == activo.Value);
        }

        var entities = await query
            .OrderBy(entity => entity.RazonSocial)
            .Select(entity => new FiscalEntityResponse(
                entity.Id,
                entity.IdInquilino,
                entity.Rfc,
                entity.RazonSocial,
                entity.RegimenFiscal,
                entity.Correo,
                entity.Telefono,
                entity.Activo))
            .ToArrayAsync(cancellationToken);

        return TypedResults.Ok<IReadOnlyList<FiscalEntityResponse>>(entities);
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound>> GetFiscalEntityAsync(
        Guid id,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var entity = await dbContext.EntidadesFiscales
            .AsNoTracking()
            .Where(row => row.Id == id && row.IdInquilino == currentContext.TenantId)
            .Select(row => new FiscalEntityResponse(
                row.Id,
                row.IdInquilino,
                row.Rfc,
                row.RazonSocial,
                row.RegimenFiscal,
                row.Correo,
                row.Telefono,
                row.Activo))
            .FirstOrDefaultAsync(cancellationToken);

        return entity is null ? TypedResults.NotFound() : TypedResults.Ok(entity);
    }

    private static async Task<Results<Ok<IReadOnlyList<FiscalEntityOperationalUnitResponse>>, NotFound>> GetFiscalEntityOperationalUnitsAsync(
        Guid id,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var fiscalEntityExists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Id == id && entity.IdInquilino == currentContext.TenantId,
            cancellationToken);

        if (!fiscalEntityExists)
        {
            return TypedResults.NotFound();
        }

        var operationalUnits = await (
                from unidad in dbContext.UnidadesOperativas.AsNoTracking()
                join restaurante in dbContext.Restaurantes.AsNoTracking() on unidad.IdRestaurante equals restaurante.Id
                where unidad.IdInquilino == currentContext.TenantId
                    && unidad.IdEntidadFiscal == id
                orderby restaurante.Nombre, unidad.Nombre
                select new FiscalEntityOperationalUnitResponse(
                    unidad.Id,
                    unidad.Codigo,
                    unidad.Nombre,
                    unidad.IdRestaurante,
                    restaurante.Codigo,
                    restaurante.Nombre,
                    unidad.Activo,
                    unidad.FechaApertura))
            .ToArrayAsync(cancellationToken);

        return TypedResults.Ok<IReadOnlyList<FiscalEntityOperationalUnitResponse>>(operationalUnits);
    }

    private static async Task<Results<Created<FiscalEntityResponse>, Conflict<string>, BadRequest<string>>> CreateFiscalEntityAsync(
        UpsertFiscalEntityRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return TypedResults.BadRequest(validationError);
        }

        var rfc = NormalizeRfc(request.Rfc);
        var exists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Rfc == rfc,
            cancellationToken);

        if (exists)
        {
            return TypedResults.Conflict("Ya existe una entidad fiscal con ese RFC.");
        }

        var fiscalEntity = new EntidadFiscal
        {
            IdInquilino = currentContext.TenantId,
            Rfc = rfc,
            RazonSocial = request.RazonSocial.Trim(),
            RegimenFiscal = request.RegimenFiscal.Trim(),
            Correo = NormalizeOptional(request.Correo),
            Telefono = NormalizeOptional(request.Telefono),
            Activo = true
        };

        dbContext.EntidadesFiscales.Add(fiscalEntity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Created(
            $"/api/tenant/entidades-fiscales/{fiscalEntity.Id}",
            ToResponse(fiscalEntity));
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound, Conflict<string>, BadRequest<string>>> UpdateFiscalEntityAsync(
        Guid id,
        UpsertFiscalEntityRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return TypedResults.BadRequest(validationError);
        }

        var fiscalEntity = await dbContext.EntidadesFiscales
            .FirstOrDefaultAsync(
                entity => entity.Id == id && entity.IdInquilino == currentContext.TenantId,
                cancellationToken);

        if (fiscalEntity is null)
        {
            return TypedResults.NotFound();
        }

        var rfc = NormalizeRfc(request.Rfc);
        var rfcExists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Id != id && entity.Rfc == rfc,
            cancellationToken);

        if (rfcExists)
        {
            return TypedResults.Conflict("Ya existe otra entidad fiscal con ese RFC.");
        }

        fiscalEntity.Rfc = rfc;
        fiscalEntity.RazonSocial = request.RazonSocial.Trim();
        fiscalEntity.RegimenFiscal = request.RegimenFiscal.Trim();
        fiscalEntity.Correo = NormalizeOptional(request.Correo);
        fiscalEntity.Telefono = NormalizeOptional(request.Telefono);

        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToResponse(fiscalEntity));
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound>> UpdateFiscalEntityStatusAsync(
        Guid id,
        UpdateFiscalEntityStatusRequest request,
        AppDbContext dbContext,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var fiscalEntity = await dbContext.EntidadesFiscales
            .FirstOrDefaultAsync(
                entity => entity.Id == id && entity.IdInquilino == currentContext.TenantId,
                cancellationToken);

        if (fiscalEntity is null)
        {
            return TypedResults.NotFound();
        }

        fiscalEntity.Activo = request.Activo;
        await dbContext.SaveChangesAsync(cancellationToken);

        return TypedResults.Ok(ToResponse(fiscalEntity));
    }

    private static string? Validate(UpsertFiscalEntityRequest request)
    {
        var rfc = NormalizeRfc(request.Rfc);
        if (string.IsNullOrWhiteSpace(rfc))
        {
            return "El RFC es requerido.";
        }

        if (rfc.Length is < 12 or > 13)
        {
            return "El RFC debe tener 12 o 13 caracteres.";
        }

        if (string.IsNullOrWhiteSpace(request.RazonSocial))
        {
            return "La razon social es requerida.";
        }

        if (request.RazonSocial.Trim().Length > 200)
        {
            return "La razon social no puede exceder 200 caracteres.";
        }

        if (string.IsNullOrWhiteSpace(request.RegimenFiscal))
        {
            return "El regimen fiscal es requerido.";
        }

        if (request.RegimenFiscal.Trim().Length > 120)
        {
            return "El regimen fiscal no puede exceder 120 caracteres.";
        }

        if (request.Correo?.Trim().Length > 256)
        {
            return "El correo no puede exceder 256 caracteres.";
        }

        if (request.Telefono?.Trim().Length > 30)
        {
            return "El telefono no puede exceder 30 caracteres.";
        }

        return null;
    }

    private static FiscalEntityResponse ToResponse(EntidadFiscal entity)
    {
        return new FiscalEntityResponse(
            entity.Id,
            entity.IdInquilino,
            entity.Rfc,
            entity.RazonSocial,
            entity.RegimenFiscal,
            entity.Correo,
            entity.Telefono,
            entity.Activo);
    }

    private static string NormalizeRfc(string value)
        => value.Trim().ToUpperInvariant();

    private static string? NormalizeOptional(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record FiscalEntityResponse(
    Guid Id,
    Guid IdInquilino,
    string Rfc,
    string RazonSocial,
    string RegimenFiscal,
    string? Correo,
    string? Telefono,
    bool Activo);

public sealed record UpsertFiscalEntityRequest(
    string Rfc,
    string RazonSocial,
    string RegimenFiscal,
    string? Correo,
    string? Telefono);

public sealed record UpdateFiscalEntityStatusRequest(bool Activo);

public sealed record FiscalEntityOperationalUnitResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    Guid IdRestaurante,
    string CodigoRestaurante,
    string NombreRestaurante,
    bool Activo,
    DateTime? FechaApertura);
