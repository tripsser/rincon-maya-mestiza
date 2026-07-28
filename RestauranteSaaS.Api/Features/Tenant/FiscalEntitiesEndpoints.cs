using Microsoft.AspNetCore.Http.HttpResults;
using RestauranteSaaS.Api.Application.Abstractions;

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
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        string? busqueda,
        bool? activo,
        CancellationToken cancellationToken)
    {
        var entities = await fiscalEntitiesService.GetFiscalEntitiesAsync(
            currentContext.TenantId,
            busqueda,
            activo,
            cancellationToken);

        return TypedResults.Ok<IReadOnlyList<FiscalEntityResponse>>(entities);
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound>> GetFiscalEntityAsync(
        Guid id,
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var entity = await fiscalEntitiesService.GetFiscalEntityAsync(
            currentContext.TenantId,
            id,
            cancellationToken);

        return entity is null ? TypedResults.NotFound() : TypedResults.Ok(entity);
    }

    private static async Task<Results<Ok<IReadOnlyList<FiscalEntityOperationalUnitResponse>>, NotFound>> GetFiscalEntityOperationalUnitsAsync(
        Guid id,
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var operationalUnits = await fiscalEntitiesService.GetOperationalUnitsAsync(
            currentContext.TenantId,
            id,
            cancellationToken);

        return operationalUnits is null
            ? TypedResults.NotFound()
            : TypedResults.Ok<IReadOnlyList<FiscalEntityOperationalUnitResponse>>(operationalUnits);
    }

    private static async Task<Results<Created<FiscalEntityResponse>, Conflict<string>, BadRequest<string>>> CreateFiscalEntityAsync(
        UpsertFiscalEntityRequest request,
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var result = await fiscalEntitiesService.CreateFiscalEntityAsync(
            currentContext.TenantId,
            request,
            cancellationToken);

        if (result.Status == FiscalEntityMutationStatus.BadRequest)
        {
            return TypedResults.BadRequest(result.Error!);
        }

        if (result.Status == FiscalEntityMutationStatus.Conflict)
        {
            return TypedResults.Conflict(result.Error!);
        }

        return TypedResults.Created(
            $"/api/tenant/entidades-fiscales/{result.Entity!.Id}",
            result.Entity);
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound, Conflict<string>, BadRequest<string>>> UpdateFiscalEntityAsync(
        Guid id,
        UpsertFiscalEntityRequest request,
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var result = await fiscalEntitiesService.UpdateFiscalEntityAsync(
            currentContext.TenantId,
            id,
            request,
            cancellationToken);

        if (result.Status == FiscalEntityMutationStatus.NotFound)
        {
            return TypedResults.NotFound();
        }

        if (result.Status == FiscalEntityMutationStatus.BadRequest)
        {
            return TypedResults.BadRequest(result.Error!);
        }

        if (result.Status == FiscalEntityMutationStatus.Conflict)
        {
            return TypedResults.Conflict(result.Error!);
        }

        return TypedResults.Ok(result.Entity!);
    }

    private static async Task<Results<Ok<FiscalEntityResponse>, NotFound>> UpdateFiscalEntityStatusAsync(
        Guid id,
        UpdateFiscalEntityStatusRequest request,
        FiscalEntitiesService fiscalEntitiesService,
        ICurrentContext currentContext,
        CancellationToken cancellationToken)
    {
        var fiscalEntity = await fiscalEntitiesService.UpdateStatusAsync(
            currentContext.TenantId,
            id,
            request.Activo,
            cancellationToken);

        return fiscalEntity is null ? TypedResults.NotFound() : TypedResults.Ok(fiscalEntity);
    }
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
