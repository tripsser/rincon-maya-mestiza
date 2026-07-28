using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestauranteSaaS.Api.Domain.Entities;

namespace RestauranteSaaS.Api.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Inquilino> Inquilinos => Set<Inquilino>();
    public DbSet<RoleInquilino> RolesInquilino => Set<RoleInquilino>();
    public DbSet<PermisoInquilino> PermisosInquilino => Set<PermisoInquilino>();
    public DbSet<RoleInquilinoPermiso> RolesInquilinoPermisos => Set<RoleInquilinoPermiso>();
    public DbSet<AsignacionInquilino> AsignacionesInquilino => Set<AsignacionInquilino>();
    public DbSet<AsignacionInquilinoPermiso> AsignacionesInquilinoPermisos => Set<AsignacionInquilinoPermiso>();
    public DbSet<RoleRestaurante> RolesRestaurante => Set<RoleRestaurante>();
    public DbSet<PermisoRestaurante> PermisosRestaurante => Set<PermisoRestaurante>();
    public DbSet<RoleRestaurantePermiso> RolesRestaurantePermisos => Set<RoleRestaurantePermiso>();
    public DbSet<AsignacionRestaurante> AsignacionesRestaurante => Set<AsignacionRestaurante>();
    public DbSet<AsignacionRestaurantePermiso> AsignacionesRestaurantePermisos => Set<AsignacionRestaurantePermiso>();
    public DbSet<Restaurante> Restaurantes => Set<Restaurante>();
    public DbSet<EntidadFiscal> EntidadesFiscales => Set<EntidadFiscal>();
    public DbSet<Direccion> Direcciones => Set<Direccion>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<UnidadOperativa> UnidadesOperativas => Set<UnidadOperativa>();
    public DbSet<RoleOperativo> RolesOperativos => Set<RoleOperativo>();
    public DbSet<PermisoOperativo> PermisosOperativos => Set<PermisoOperativo>();
    public DbSet<RoleOperativoPermiso> RolesOperativosPermisos => Set<RoleOperativoPermiso>();
    public DbSet<AsignacionOperativa> AsignacionesOperativas => Set<AsignacionOperativa>();
    public DbSet<AsignacionOperativaPermiso> AsignacionesOperativasPermisos => Set<AsignacionOperativaPermiso>();
    public DbSet<ConsecutivoCodigo> ConsecutivosCodigos => Set<ConsecutivoCodigo>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.HasPostgresExtension("pgcrypto");

        MapIdentity(builder);
        MapCodigoEntities(builder);
        MapTenantAuthorization(builder);
        MapRestaurantAuthorization(builder);
        MapBusinessEntities(builder);
        MapOperationalAuthorization(builder);
    }

    private static void MapCodigoEntities(ModelBuilder builder)
    {
        builder.Entity<ConsecutivoCodigo>(entity =>
        {
            entity.ToTable("consecutivos_codigos");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.ScopeTipo).HasColumnName("scope_tipo").HasMaxLength(40);
            entity.Property(row => row.IdScope).HasColumnName("id_scope");
            entity.Property(row => row.Entidad).HasColumnName("entidad").HasMaxLength(80);
            entity.Property(row => row.Prefijo).HasColumnName("prefijo").HasMaxLength(20);
            entity.Property(row => row.UltimoNumero).HasColumnName("ultimo_numero");
            entity.Property(row => row.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(row => row.ActualizadoEn).HasColumnName("actualizado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(row => new { row.ScopeTipo, row.IdScope, row.Entidad }).IsUnique().HasDatabaseName("ux_consecutivos_codigos_scope_entidad");
        });
    }

    private static void MapIdentity(ModelBuilder builder)
    {
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("AspNetUsers");
            entity.Property(user => user.Id).HasDefaultValueSql("gen_random_uuid()");
            entity.Property(user => user.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(user => user.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(user => user.ActualizadoEn).HasColumnName("actualizado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        builder.Entity<IdentityRole<Guid>>(entity =>
        {
            entity.ToTable("AspNetRoles");
            entity.Property(role => role.Id).HasDefaultValueSql("gen_random_uuid()");
        });
        builder.Entity<IdentityUserRole<Guid>>().ToTable("AspNetUserRoles");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("AspNetUserClaims");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("AspNetUserLogins");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("AspNetRoleClaims");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("AspNetUserTokens");
    }

    private static void MapTenantAuthorization(ModelBuilder builder)
    {
        builder.Entity<Inquilino>(entity =>
        {
            entity.ToTable("inquilinos");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(150);
            entity.Property(row => row.Estado).HasColumnName("estado").HasMaxLength(30).HasDefaultValue("activo");
            entity.Property(row => row.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_inquilinos_codigo");
            entity.ToTable(table => table.HasCheckConstraint("ck_inquilinos_estado", "estado IN ('activo', 'inactivo', 'suspendido')"));
        });

        builder.Entity<RoleInquilino>(entity =>
        {
            entity.ToTable("roles_inquilino");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(100);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_roles_inquilino_inquilino");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_roles_inquilino_activo");
            entity.HasIndex(row => new { row.IdInquilino, row.Codigo }).IsUnique().HasDatabaseName("ux_roles_inquilino_inquilino_codigo");
            entity.HasIndex(row => new { row.IdInquilino, row.Nombre }).IsUnique().HasDatabaseName("ux_roles_inquilino_inquilino_nombre");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_roles_inquilino_inquilinos");
        });

        builder.Entity<PermisoInquilino>(entity =>
        {
            entity.ToTable("permisos_inquilino");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(100);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(120);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_permisos_inquilino_codigo");
        });

        builder.Entity<RoleInquilinoPermiso>(entity =>
        {
            entity.ToTable("roles_inquilino_permisos");
            entity.HasKey(row => new { row.IdRoleInquilino, row.IdPermisoInquilino });
            entity.Property(row => row.IdRoleInquilino).HasColumnName("id_rol_inquilino");
            entity.Property(row => row.IdPermisoInquilino).HasColumnName("id_permiso_inquilino");
            entity.HasIndex(row => row.IdPermisoInquilino).HasDatabaseName("idx_roles_inquilino_permisos_permiso");
            entity.HasOne<RoleInquilino>().WithMany().HasForeignKey(row => row.IdRoleInquilino).HasConstraintName("fk_roles_inquilino_permisos_roles").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoInquilino>().WithMany().HasForeignKey(row => row.IdPermisoInquilino).HasConstraintName("fk_roles_inquilino_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AsignacionInquilino>(entity =>
        {
            entity.ToTable("asignaciones_inquilino");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.IdUsuario).HasColumnName("id_usuario");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.IdRoleInquilino).HasColumnName("id_rol_inquilino");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(row => row.FechaInicio).HasColumnName("fecha_inicio").HasColumnType("date");
            entity.Property(row => row.FechaFin).HasColumnName("fecha_fin").HasColumnType("date");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_asignaciones_inquilino_codigo");
            entity.HasIndex(row => new { row.IdUsuario, row.IdInquilino, row.IdRoleInquilino }).IsUnique().HasDatabaseName("ux_asignaciones_inquilino_usuario_inquilino_rol");
            entity.HasIndex(row => row.IdUsuario).HasDatabaseName("idx_asignaciones_inquilino_usuario");
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_asignaciones_inquilino_inquilino");
            entity.HasIndex(row => row.IdRoleInquilino).HasDatabaseName("idx_asignaciones_inquilino_rol");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_asignaciones_inquilino_activo");
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(row => row.IdUsuario).HasConstraintName("fk_asignaciones_inquilino_usuarios");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_asignaciones_inquilino_inquilinos");
            entity.HasOne<RoleInquilino>().WithMany().HasForeignKey(row => row.IdRoleInquilino).HasConstraintName("fk_asignaciones_inquilino_roles");
        });

        builder.Entity<AsignacionInquilinoPermiso>(entity =>
        {
            entity.ToTable("asignaciones_inquilino_permisos");
            entity.HasKey(row => new { row.IdAsignacionInquilino, row.IdPermisoInquilino });
            entity.Property(row => row.IdAsignacionInquilino).HasColumnName("id_asignacion_inquilino");
            entity.Property(row => row.IdPermisoInquilino).HasColumnName("id_permiso_inquilino");
            entity.Property(row => row.Permitido).HasColumnName("permitido").HasDefaultValue(true);
            entity.HasIndex(row => row.IdPermisoInquilino).HasDatabaseName("idx_asignaciones_inquilino_permisos_permiso");
            entity.HasOne<AsignacionInquilino>().WithMany().HasForeignKey(row => row.IdAsignacionInquilino).HasConstraintName("fk_asignaciones_inquilino_permisos_asignaciones").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoInquilino>().WithMany().HasForeignKey(row => row.IdPermisoInquilino).HasConstraintName("fk_asignaciones_inquilino_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void MapRestaurantAuthorization(ModelBuilder builder)
    {
        builder.Entity<RoleRestaurante>(entity =>
        {
            entity.ToTable("roles_restaurante");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(100);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_roles_restaurante_inquilino");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_roles_restaurante_activo");
            entity.HasIndex(row => new { row.IdInquilino, row.Codigo }).IsUnique().HasDatabaseName("ux_roles_restaurante_inquilino_codigo");
            entity.HasIndex(row => new { row.IdInquilino, row.Nombre }).IsUnique().HasDatabaseName("ux_roles_restaurante_inquilino_nombre");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_roles_restaurante_inquilinos");
        });

        builder.Entity<PermisoRestaurante>(entity =>
        {
            entity.ToTable("permisos_restaurante");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(100);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(120);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_permisos_restaurante_codigo");
        });

        builder.Entity<RoleRestaurantePermiso>(entity =>
        {
            entity.ToTable("roles_restaurante_permisos");
            entity.HasKey(row => new { row.IdRoleRestaurante, row.IdPermisoRestaurante });
            entity.Property(row => row.IdRoleRestaurante).HasColumnName("id_rol_restaurante");
            entity.Property(row => row.IdPermisoRestaurante).HasColumnName("id_permiso_restaurante");
            entity.HasIndex(row => row.IdPermisoRestaurante).HasDatabaseName("idx_roles_restaurante_permisos_permiso");
            entity.HasOne<RoleRestaurante>().WithMany().HasForeignKey(row => row.IdRoleRestaurante).HasConstraintName("fk_roles_restaurante_permisos_roles").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoRestaurante>().WithMany().HasForeignKey(row => row.IdPermisoRestaurante).HasConstraintName("fk_roles_restaurante_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AsignacionRestaurante>(entity =>
        {
            entity.ToTable("asignaciones_restaurante");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.IdUsuario).HasColumnName("id_usuario");
            entity.Property(row => row.IdRestaurante).HasColumnName("id_restaurante");
            entity.Property(row => row.IdRoleRestaurante).HasColumnName("id_rol_restaurante");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(row => row.FechaInicio).HasColumnName("fecha_inicio").HasColumnType("date");
            entity.Property(row => row.FechaFin).HasColumnName("fecha_fin").HasColumnType("date");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_asignaciones_restaurante_codigo");
            entity.HasIndex(row => new { row.IdUsuario, row.IdRestaurante, row.IdRoleRestaurante }).IsUnique().HasDatabaseName("ux_asignaciones_restaurante_usuario_restaurante_rol");
            entity.HasIndex(row => row.IdUsuario).HasDatabaseName("idx_asignaciones_restaurante_usuario");
            entity.HasIndex(row => row.IdRestaurante).HasDatabaseName("idx_asignaciones_restaurante_restaurante");
            entity.HasIndex(row => row.IdRoleRestaurante).HasDatabaseName("idx_asignaciones_restaurante_rol");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_asignaciones_restaurante_activo");
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(row => row.IdUsuario).HasConstraintName("fk_asignaciones_restaurante_usuarios");
            entity.HasOne<Restaurante>().WithMany().HasForeignKey(row => row.IdRestaurante).HasConstraintName("fk_asignaciones_restaurante_restaurantes");
            entity.HasOne<RoleRestaurante>().WithMany().HasForeignKey(row => row.IdRoleRestaurante).HasConstraintName("fk_asignaciones_restaurante_roles");
        });

        builder.Entity<AsignacionRestaurantePermiso>(entity =>
        {
            entity.ToTable("asignaciones_restaurante_permisos");
            entity.HasKey(row => new { row.IdAsignacionRestaurante, row.IdPermisoRestaurante });
            entity.Property(row => row.IdAsignacionRestaurante).HasColumnName("id_asignacion_restaurante");
            entity.Property(row => row.IdPermisoRestaurante).HasColumnName("id_permiso_restaurante");
            entity.Property(row => row.Permitido).HasColumnName("permitido").HasDefaultValue(true);
            entity.HasIndex(row => row.IdPermisoRestaurante).HasDatabaseName("idx_asignaciones_restaurante_permisos_permiso");
            entity.HasOne<AsignacionRestaurante>().WithMany().HasForeignKey(row => row.IdAsignacionRestaurante).HasConstraintName("fk_asignaciones_restaurante_permisos_asignaciones").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoRestaurante>().WithMany().HasForeignKey(row => row.IdPermisoRestaurante).HasConstraintName("fk_asignaciones_restaurante_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void MapBusinessEntities(ModelBuilder builder)
    {
        builder.Entity<Restaurante>(entity =>
        {
            entity.ToTable("restaurantes");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(150);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.Property(row => row.LogoUrl).HasColumnName("logo_url");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_restaurantes_inquilino");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_restaurantes_activo");
            entity.HasIndex(row => new { row.IdInquilino, row.Codigo }).IsUnique().HasDatabaseName("ux_restaurantes_inquilino_codigo");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_restaurantes_inquilinos");
        });

        builder.Entity<EntidadFiscal>(entity =>
        {
            entity.ToTable("entidades_fiscales");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Rfc).HasColumnName("rfc").HasMaxLength(13);
            entity.Property(row => row.RazonSocial).HasColumnName("razon_social").HasMaxLength(200);
            entity.Property(row => row.RegimenFiscal).HasColumnName("regimen_fiscal").HasMaxLength(120);
            entity.Property(row => row.Correo).HasColumnName("correo").HasMaxLength(256);
            entity.Property(row => row.Telefono).HasColumnName("telefono").HasMaxLength(30);
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_entidades_fiscales_inquilino");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_entidades_fiscales_activo");
            entity.HasIndex(row => row.Rfc).IsUnique().HasDatabaseName("ux_entidades_fiscales_rfc");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_entidades_fiscales_inquilinos");
        });

        builder.Entity<Direccion>(entity =>
        {
            entity.ToTable("direcciones");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Pais).HasColumnName("pais").HasMaxLength(80);
            entity.Property(row => row.Estado).HasColumnName("estado").HasMaxLength(100);
            entity.Property(row => row.Municipio).HasColumnName("municipio").HasMaxLength(100);
            entity.Property(row => row.Colonia).HasColumnName("colonia").HasMaxLength(120);
            entity.Property(row => row.CodigoPostal).HasColumnName("codigo_postal").HasMaxLength(10);
            entity.Property(row => row.Calle).HasColumnName("calle").HasMaxLength(150);
            entity.Property(row => row.NumeroExterior).HasColumnName("numero_exterior").HasMaxLength(20);
            entity.Property(row => row.NumeroInterior).HasColumnName("numero_interior").HasMaxLength(20);
            entity.Property(row => row.Referencia).HasColumnName("referencia");
            entity.Property(row => row.Latitud).HasColumnName("latitud").HasPrecision(9, 6);
            entity.Property(row => row.Longitud).HasColumnName("longitud").HasPrecision(9, 6);
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_direcciones_inquilino");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_direcciones_inquilinos");
        });

        builder.Entity<Cliente>(entity =>
        {
            entity.ToTable("clientes");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdUsuario).HasColumnName("id_usuario");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.Nombres).HasColumnName("nombres").HasMaxLength(100);
            entity.Property(row => row.Apellidos).HasColumnName("apellidos").HasMaxLength(100);
            entity.Property(row => row.Telefono).HasColumnName("telefono").HasMaxLength(30);
            entity.Property(row => row.CreadoEn).HasColumnName("creado_en").HasColumnType("timestamp without time zone").HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(row => row.IdUsuario).HasDatabaseName("idx_clientes_usuario");
            entity.HasIndex(row => row.IdUsuario).IsUnique().HasDatabaseName("ux_clientes_usuario");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_clientes_codigo");
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(row => row.IdUsuario).HasConstraintName("fk_clientes_usuarios");
        });
    }

    private static void MapOperationalAuthorization(ModelBuilder builder)
    {
        builder.Entity<Empleado>(entity =>
        {
            entity.ToTable("empleados");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdUsuario).HasColumnName("id_usuario");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.NumeroEmpleado).HasColumnName("numero_empleado").HasMaxLength(50);
            entity.Property(row => row.Nombres).HasColumnName("nombres").HasMaxLength(100);
            entity.Property(row => row.Apellidos).HasColumnName("apellidos").HasMaxLength(100);
            entity.Property(row => row.Telefono).HasColumnName("telefono").HasMaxLength(30);
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.HasIndex(row => row.IdUsuario).HasDatabaseName("idx_empleados_usuario");
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_empleados_inquilino");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_empleados_activo");
            entity.HasIndex(row => new { row.IdInquilino, row.IdUsuario }).IsUnique().HasDatabaseName("ux_empleados_inquilino_id_usuario");
            entity.HasIndex(row => new { row.IdInquilino, row.NumeroEmpleado }).IsUnique().HasDatabaseName("ux_empleados_inquilino_numero_empleado");
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(row => row.IdUsuario).HasConstraintName("fk_empleados_usuarios");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_empleados_inquilinos");
        });

        builder.Entity<UnidadOperativa>(entity =>
        {
            entity.ToTable("unidades_operativas");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.IdRestaurante).HasColumnName("id_restaurante");
            entity.Property(row => row.IdEntidadFiscal).HasColumnName("id_entidad_fiscal");
            entity.Property(row => row.IdDireccion).HasColumnName("id_direccion");
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(150);
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(row => row.FechaApertura).HasColumnName("fecha_apertura").HasColumnType("date");
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_unidades_operativas_inquilino");
            entity.HasIndex(row => row.IdRestaurante).HasDatabaseName("idx_unidades_operativas_restaurante");
            entity.HasIndex(row => row.IdEntidadFiscal).HasDatabaseName("idx_unidades_operativas_entidad_fiscal");
            entity.HasIndex(row => row.IdDireccion).HasDatabaseName("idx_unidades_operativas_direccion");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_unidades_operativas_activo");
            entity.HasIndex(row => new { row.IdInquilino, row.Codigo }).IsUnique().HasDatabaseName("ux_unidades_operativas_inquilino_codigo");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_unidades_operativas_inquilinos");
            entity.HasOne<Restaurante>().WithMany().HasForeignKey(row => row.IdRestaurante).HasConstraintName("fk_unidades_operativas_restaurantes");
            entity.HasOne<EntidadFiscal>().WithMany().HasForeignKey(row => row.IdEntidadFiscal).HasConstraintName("fk_unidades_operativas_entidades_fiscales");
            entity.HasOne<Direccion>().WithMany().HasForeignKey(row => row.IdDireccion).HasConstraintName("fk_unidades_operativas_direcciones");
        });

        builder.Entity<RoleOperativo>(entity =>
        {
            entity.ToTable("roles_operativos");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.IdInquilino).HasColumnName("id_inquilino");
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(100);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.HasIndex(row => row.IdInquilino).HasDatabaseName("idx_roles_operativos_inquilino");
            entity.HasIndex(row => new { row.IdInquilino, row.Nombre }).IsUnique().HasDatabaseName("ux_roles_operativos_inquilino_nombre");
            entity.HasOne<Inquilino>().WithMany().HasForeignKey(row => row.IdInquilino).HasConstraintName("fk_roles_operativos_inquilinos");
        });

        builder.Entity<PermisoOperativo>(entity =>
        {
            entity.ToTable("permisos_operativos");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(100);
            entity.Property(row => row.Nombre).HasColumnName("nombre").HasMaxLength(120);
            entity.Property(row => row.Descripcion).HasColumnName("descripcion");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_permisos_operativos_codigo");
        });

        builder.Entity<RoleOperativoPermiso>(entity =>
        {
            entity.ToTable("roles_operativos_permisos");
            entity.HasKey(row => new { row.IdRoleOperativo, row.IdPermisoOperativo });
            entity.Property(row => row.IdRoleOperativo).HasColumnName("id_rol_operativo");
            entity.Property(row => row.IdPermisoOperativo).HasColumnName("id_permiso_operativo");
            entity.HasIndex(row => row.IdPermisoOperativo).HasDatabaseName("idx_roles_operativos_permisos_permiso");
            entity.HasOne<RoleOperativo>().WithMany().HasForeignKey(row => row.IdRoleOperativo).HasConstraintName("fk_roles_operativos_permisos_roles").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoOperativo>().WithMany().HasForeignKey(row => row.IdPermisoOperativo).HasConstraintName("fk_roles_operativos_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<AsignacionOperativa>(entity =>
        {
            entity.ToTable("asignaciones_operativas");
            entity.HasKey(row => row.Id);
            entity.Property(row => row.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");
            entity.Property(row => row.Codigo).HasColumnName("codigo").HasMaxLength(40);
            entity.Property(row => row.IdEmpleado).HasColumnName("id_empleado");
            entity.Property(row => row.IdUnidadOperativa).HasColumnName("id_unidad_operativa");
            entity.Property(row => row.IdRoleOperativo).HasColumnName("id_rol_operativo");
            entity.Property(row => row.Activo).HasColumnName("activo").HasDefaultValue(true);
            entity.Property(row => row.FechaInicio).HasColumnName("fecha_inicio").HasColumnType("date");
            entity.Property(row => row.FechaFin).HasColumnName("fecha_fin").HasColumnType("date");
            entity.HasIndex(row => row.Codigo).IsUnique().HasDatabaseName("ux_asignaciones_operativas_codigo");
            entity.HasIndex(row => new { row.IdEmpleado, row.IdUnidadOperativa, row.IdRoleOperativo }).IsUnique().HasDatabaseName("ux_asignaciones_operativas_empleado_unidad_rol");
            entity.HasIndex(row => row.IdEmpleado).HasDatabaseName("idx_asignaciones_operativas_empleado");
            entity.HasIndex(row => row.IdUnidadOperativa).HasDatabaseName("idx_asignaciones_operativas_unidad_operativa");
            entity.HasIndex(row => row.IdRoleOperativo).HasDatabaseName("idx_asignaciones_operativas_rol_operativo");
            entity.HasIndex(row => row.Activo).HasDatabaseName("idx_asignaciones_operativas_activo");
            entity.HasOne<Empleado>().WithMany().HasForeignKey(row => row.IdEmpleado).HasConstraintName("fk_asignaciones_operativas_empleados");
            entity.HasOne<UnidadOperativa>().WithMany().HasForeignKey(row => row.IdUnidadOperativa).HasConstraintName("fk_asignaciones_operativas_unidades_operativas");
            entity.HasOne<RoleOperativo>().WithMany().HasForeignKey(row => row.IdRoleOperativo).HasConstraintName("fk_asignaciones_operativas_roles_operativos");
        });

        builder.Entity<AsignacionOperativaPermiso>(entity =>
        {
            entity.ToTable("asignaciones_operativas_permisos");
            entity.HasKey(row => new { row.IdAsignacionOperativa, row.IdPermisoOperativo });
            entity.Property(row => row.IdAsignacionOperativa).HasColumnName("id_asignacion_operativa");
            entity.Property(row => row.IdPermisoOperativo).HasColumnName("id_permiso_operativo");
            entity.Property(row => row.Permitido).HasColumnName("permitido").HasDefaultValue(true);
            entity.HasIndex(row => row.IdPermisoOperativo).HasDatabaseName("idx_asignaciones_operativas_permisos_permiso");
            entity.HasOne<AsignacionOperativa>().WithMany().HasForeignKey(row => row.IdAsignacionOperativa).HasConstraintName("fk_asignaciones_operativas_permisos_asignaciones").OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<PermisoOperativo>().WithMany().HasForeignKey(row => row.IdPermisoOperativo).HasConstraintName("fk_asignaciones_operativas_permisos_permisos").OnDelete(DeleteBehavior.Cascade);
        });
    }
}
