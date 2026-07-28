using Microsoft.EntityFrameworkCore;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Domain.Entities;

namespace RestauranteSaaS.Api.Infrastructure.Persistence;

public sealed class CodigoEntidadService(AppDbContext dbContext) : ICodigoEntidadService
{
    private static readonly IReadOnlyDictionary<string, string> Prefijos = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["inquilinos"] = "TEN",
        ["restaurantes"] = "RES",
        ["empleados"] = "EMP",
        ["clientes"] = "CLI",
        ["unidades_operativas"] = "SUC",
        ["productos"] = "PROD",
        ["menus"] = "MENU",
        ["categorias"] = "CAT",
        ["areas_preparacion"] = "AREA",
        ["activos_tecnologicos"] = "ACT",
        ["impresoras"] = "IMP",
        ["computadoras"] = "COMP",
        ["comandas"] = "CMD",
        ["trabajos_impresion"] = "PRN"
    };

    public async Task<string> GenerarAsync(
        string entidad,
        string scopeTipo,
        Guid? idScope,
        CancellationToken cancellationToken)
    {
        var entidadNormalizada = Normalizar(entidad);
        var scopeTipoNormalizado = Normalizar(scopeTipo);
        var idScopeNormalizado = idScope ?? Guid.Empty;
        var prefijo = ObtenerPrefijo(entidadNormalizada);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var lockKey = $"{scopeTipoNormalizado}:{idScopeNormalizado}:{entidadNormalizada}";
        await dbContext.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtext({lockKey}))",
            cancellationToken);

        var consecutivo = await dbContext.ConsecutivosCodigos
            .FromSqlInterpolated($"""
                SELECT *
                FROM consecutivos_codigos
                WHERE scope_tipo = {scopeTipoNormalizado}
                    AND entidad = {entidadNormalizada}
                    AND id_scope = {idScopeNormalizado}
                FOR UPDATE
                """)
            .SingleOrDefaultAsync(cancellationToken);

        if (consecutivo is null)
        {
            consecutivo = new ConsecutivoCodigo
            {
                ScopeTipo = scopeTipoNormalizado,
                IdScope = idScopeNormalizado,
                Entidad = entidadNormalizada,
                Prefijo = prefijo,
                UltimoNumero = 0
            };

            dbContext.ConsecutivosCodigos.Add(consecutivo);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        consecutivo.UltimoNumero++;
        consecutivo.Prefijo = prefijo;
        consecutivo.ActualizadoEn = NowWithoutTimeZone();

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return $"{prefijo}-{consecutivo.UltimoNumero:0000}";
    }

    private static string ObtenerPrefijo(string entidad)
    {
        if (Prefijos.TryGetValue(entidad, out var prefijo))
        {
            return prefijo;
        }

        throw new InvalidOperationException($"No existe prefijo configurado para la entidad '{entidad}'.");
    }

    private static string Normalizar(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("El valor no puede estar vacio.", nameof(value));
        }

        return value.Trim().ToLowerInvariant();
    }

    private static DateTime NowWithoutTimeZone()
        => DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
}
