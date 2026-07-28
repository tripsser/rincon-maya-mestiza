namespace RestauranteSaaS.Api.Application.Abstractions;

public interface ICodigoEntidadService
{
    Task<string> GenerarAsync(
        string entidad,
        string scopeTipo,
        Guid? idScope,
        CancellationToken cancellationToken);
}
