using Microsoft.EntityFrameworkCore;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Infrastructure.Persistence;

namespace RestauranteSaaS.Api.Features.Tenant;

public sealed class FiscalEntitiesService(AppDbContext dbContext)
{
    public async Task<IReadOnlyList<FiscalEntityResponse>> GetFiscalEntitiesAsync(
        Guid tenantId,
        string? busqueda,
        bool? activo,
        CancellationToken cancellationToken)
    {
        var query = dbContext.EntidadesFiscales
            .AsNoTracking()
            .Where(entity => entity.IdInquilino == tenantId);

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

        return await query
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
    }

    public async Task<FiscalEntityResponse?> GetFiscalEntityAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken)
    {
        return await dbContext.EntidadesFiscales
            .AsNoTracking()
            .Where(row => row.Id == id && row.IdInquilino == tenantId)
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
    }

    public async Task<IReadOnlyList<FiscalEntityOperationalUnitResponse>?> GetOperationalUnitsAsync(
        Guid tenantId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var fiscalEntityExists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Id == id && entity.IdInquilino == tenantId,
            cancellationToken);

        if (!fiscalEntityExists)
        {
            return null;
        }

        return await (
                from unidad in dbContext.UnidadesOperativas.AsNoTracking()
                join restaurante in dbContext.Restaurantes.AsNoTracking() on unidad.IdRestaurante equals restaurante.Id
                where unidad.IdInquilino == tenantId
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
    }

    public async Task<FiscalEntityMutationResult> CreateFiscalEntityAsync(
        Guid tenantId,
        UpsertFiscalEntityRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return FiscalEntityMutationResult.BadRequest(validationError);
        }

        var rfc = NormalizeRfc(request.Rfc);
        var exists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Rfc == rfc,
            cancellationToken);

        if (exists)
        {
            return FiscalEntityMutationResult.Conflict("Ya existe una entidad fiscal con ese RFC.");
        }

        var fiscalEntity = new EntidadFiscal
        {
            IdInquilino = tenantId,
            Rfc = rfc,
            RazonSocial = request.RazonSocial.Trim(),
            RegimenFiscal = request.RegimenFiscal.Trim(),
            Correo = NormalizeOptional(request.Correo),
            Telefono = NormalizeOptional(request.Telefono),
            Activo = true
        };

        dbContext.EntidadesFiscales.Add(fiscalEntity);
        await dbContext.SaveChangesAsync(cancellationToken);

        return FiscalEntityMutationResult.Success(ToResponse(fiscalEntity));
    }

    public async Task<FiscalEntityMutationResult> UpdateFiscalEntityAsync(
        Guid tenantId,
        Guid id,
        UpsertFiscalEntityRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = Validate(request);
        if (validationError is not null)
        {
            return FiscalEntityMutationResult.BadRequest(validationError);
        }

        var fiscalEntity = await dbContext.EntidadesFiscales
            .FirstOrDefaultAsync(
                entity => entity.Id == id && entity.IdInquilino == tenantId,
                cancellationToken);

        if (fiscalEntity is null)
        {
            return FiscalEntityMutationResult.NotFound();
        }

        var rfc = NormalizeRfc(request.Rfc);
        var rfcExists = await dbContext.EntidadesFiscales.AnyAsync(
            entity => entity.Id != id && entity.Rfc == rfc,
            cancellationToken);

        if (rfcExists)
        {
            return FiscalEntityMutationResult.Conflict("Ya existe otra entidad fiscal con ese RFC.");
        }

        fiscalEntity.Rfc = rfc;
        fiscalEntity.RazonSocial = request.RazonSocial.Trim();
        fiscalEntity.RegimenFiscal = request.RegimenFiscal.Trim();
        fiscalEntity.Correo = NormalizeOptional(request.Correo);
        fiscalEntity.Telefono = NormalizeOptional(request.Telefono);

        await dbContext.SaveChangesAsync(cancellationToken);

        return FiscalEntityMutationResult.Success(ToResponse(fiscalEntity));
    }

    public async Task<FiscalEntityResponse?> UpdateStatusAsync(
        Guid tenantId,
        Guid id,
        bool activo,
        CancellationToken cancellationToken)
    {
        var fiscalEntity = await dbContext.EntidadesFiscales
            .FirstOrDefaultAsync(
                entity => entity.Id == id && entity.IdInquilino == tenantId,
                cancellationToken);

        if (fiscalEntity is null)
        {
            return null;
        }

        fiscalEntity.Activo = activo;
        await dbContext.SaveChangesAsync(cancellationToken);

        return ToResponse(fiscalEntity);
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

public enum FiscalEntityMutationStatus
{
    Success,
    NotFound,
    Conflict,
    BadRequest
}

public sealed record FiscalEntityMutationResult(
    FiscalEntityMutationStatus Status,
    FiscalEntityResponse? Entity = null,
    string? Error = null)
{
    public static FiscalEntityMutationResult Success(FiscalEntityResponse entity)
        => new(FiscalEntityMutationStatus.Success, entity);

    public static FiscalEntityMutationResult NotFound()
        => new(FiscalEntityMutationStatus.NotFound);

    public static FiscalEntityMutationResult Conflict(string error)
        => new(FiscalEntityMutationStatus.Conflict, Error: error);

    public static FiscalEntityMutationResult BadRequest(string error)
        => new(FiscalEntityMutationStatus.BadRequest, Error: error);
}
