namespace RestauranteSaaS.Api.Domain.Entities;

public sealed class ConsecutivoCodigo
{
    public Guid Id { get; set; }
    public string ScopeTipo { get; set; } = string.Empty;
    public Guid IdScope { get; set; }
    public string Entidad { get; set; } = string.Empty;
    public string Prefijo { get; set; } = string.Empty;
    public long UltimoNumero { get; set; }
    public DateTime CreadoEn { get; set; }
    public DateTime ActualizadoEn { get; set; }
}
