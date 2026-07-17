namespace RestauranteSaaS.Api.Domain.Entities;

public sealed class Restaurante
{
    public Guid Id { get; set; }
    public Guid IdInquilino { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? LogoUrl { get; set; }
    public bool Activo { get; set; }
}

public sealed class EntidadFiscal
{
    public Guid Id { get; set; }
    public Guid IdInquilino { get; set; }
    public string Rfc { get; set; } = string.Empty;
    public string RazonSocial { get; set; } = string.Empty;
    public string RegimenFiscal { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
}

public sealed class Direccion
{
    public Guid Id { get; set; }
    public Guid IdInquilino { get; set; }
    public string Pais { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Colonia { get; set; } = string.Empty;
    public string CodigoPostal { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public string NumeroExterior { get; set; } = string.Empty;
    public string? NumeroInterior { get; set; }
    public string? Referencia { get; set; }
    public decimal? Latitud { get; set; }
    public decimal? Longitud { get; set; }
}

public sealed class Cliente
{
    public Guid Id { get; set; }
    public Guid IdUsuario { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public DateTime CreadoEn { get; set; }
}
