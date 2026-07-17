namespace RestauranteSaaS.Api.Domain.Entities;

public sealed class Empleado
{
    public Guid Id { get; set; }
    public Guid IdUsuario { get; set; }
    public Guid IdInquilino { get; set; }
    public string NumeroEmpleado { get; set; } = string.Empty;
    public string Nombres { get; set; } = string.Empty;
    public string Apellidos { get; set; } = string.Empty;
    public string? Telefono { get; set; }
    public bool Activo { get; set; }
}

public sealed class UnidadOperativa
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public Guid IdInquilino { get; set; }
    public Guid IdRestaurante { get; set; }
    public Guid IdEntidadFiscal { get; set; }
    public Guid IdDireccion { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public DateTime? FechaApertura { get; set; }
}

public sealed class RoleOperativo
{
    public Guid Id { get; set; }
    public Guid IdInquilino { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
}

public sealed class PermisoOperativo
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
}

public sealed class RoleOperativoPermiso
{
    public Guid IdRoleOperativo { get; set; }
    public Guid IdPermisoOperativo { get; set; }
}

public sealed class AsignacionOperativa
{
    public Guid Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public Guid IdEmpleado { get; set; }
    public Guid IdUnidadOperativa { get; set; }
    public Guid IdRoleOperativo { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }
}

public sealed class AsignacionOperativaPermiso
{
    public Guid IdAsignacionOperativa { get; set; }
    public Guid IdPermisoOperativo { get; set; }
    public bool Permitido { get; set; }
}
