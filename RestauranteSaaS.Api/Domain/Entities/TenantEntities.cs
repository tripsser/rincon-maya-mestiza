namespace RestauranteSaaS.Api.Domain.Entities;

public sealed class Inquilino
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime CreadoEn { get; set; }
}

public sealed class RoleInquilino
{
    public Guid Id { get; set; }
    public Guid IdInquilino { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public bool Activo { get; set; }
}

public sealed class PermisoInquilino
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
}

public sealed class RoleInquilinoPermiso
{
    public Guid IdRoleInquilino { get; set; }
    public Guid IdPermisoInquilino { get; set; }
}

public sealed class AsignacionInquilino
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public Guid IdUsuario { get; set; }
    public Guid IdInquilino { get; set; }
    public Guid IdRoleInquilino { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}

public sealed class AsignacionInquilinoPermiso
{
    public Guid IdAsignacionInquilino { get; set; }
    public Guid IdPermisoInquilino { get; set; }
    public bool Permitido { get; set; }
}
