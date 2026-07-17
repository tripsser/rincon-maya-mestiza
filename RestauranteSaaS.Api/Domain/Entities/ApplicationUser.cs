using Microsoft.AspNetCore.Identity;

namespace RestauranteSaaS.Api.Domain.Entities;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public bool Activo { get; set; } = true;
    public DateTime CreadoEn { get; set; }
    public DateTime ActualizadoEn { get; set; }
}
