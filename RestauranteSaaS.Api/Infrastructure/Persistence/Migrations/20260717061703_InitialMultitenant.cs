using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace RestauranteSaaS.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialMultitenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pgcrypto", ",,");

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    creado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    actualizado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "inquilinos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false, defaultValue: "activo"),
                    creado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inquilinos", x => x.id);
                    table.CheckConstraint("ck_inquilinos_estado", "estado IN ('activo', 'inactivo', 'suspendido')");
                });

            migrationBuilder.CreateTable(
                name: "permisos_inquilino",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permisos_inquilino", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "permisos_operativos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permisos_operativos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "clientes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombres = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellidos = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    creado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clientes", x => x.id);
                    table.ForeignKey(
                        name: "fk_clientes_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "direcciones",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    pais = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    estado = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    municipio = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    colonia = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    codigo_postal = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    calle = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    numero_exterior = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    numero_interior = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    referencia = table.Column<string>(type: "text", nullable: true),
                    latitud = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    longitud = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_direcciones", x => x.id);
                    table.ForeignKey(
                        name: "fk_direcciones_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "empleados",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    numero_empleado = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    nombres = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    apellidos = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_empleados", x => x.id);
                    table.ForeignKey(
                        name: "fk_empleados_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_empleados_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "entidades_fiscales",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    rfc = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    razon_social = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    regimen_fiscal = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    correo = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    telefono = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_entidades_fiscales", x => x.id);
                    table.ForeignKey(
                        name: "fk_entidades_fiscales_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "restaurantes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: true),
                    logo_url = table.Column<string>(type: "text", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_restaurantes", x => x.id);
                    table.ForeignKey(
                        name: "fk_restaurantes_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_inquilino",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_inquilino", x => x.id);
                    table.ForeignKey(
                        name: "fk_roles_inquilino_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_operativos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_operativos", x => x.id);
                    table.ForeignKey(
                        name: "fk_roles_operativos_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "unidades_operativas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    id_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    id_entidad_fiscal = table.Column<Guid>(type: "uuid", nullable: false),
                    id_direccion = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_apertura = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_unidades_operativas", x => x.id);
                    table.ForeignKey(
                        name: "fk_unidades_operativas_direcciones",
                        column: x => x.id_direccion,
                        principalTable: "direcciones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_unidades_operativas_entidades_fiscales",
                        column: x => x.id_entidad_fiscal,
                        principalTable: "entidades_fiscales",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_unidades_operativas_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_unidades_operativas_restaurantes",
                        column: x => x.id_restaurante,
                        principalTable: "restaurantes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_inquilino",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    id_rol_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_inicio = table.Column<DateTime>(type: "date", nullable: false),
                    fecha_fin = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_inquilino", x => x.id);
                    table.ForeignKey(
                        name: "fk_asignaciones_inquilino_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_inquilino_roles",
                        column: x => x.id_rol_inquilino,
                        principalTable: "roles_inquilino",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_inquilino_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_inquilino_permisos",
                columns: table => new
                {
                    id_rol_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_inquilino = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_inquilino_permisos", x => new { x.id_rol_inquilino, x.id_permiso_inquilino });
                    table.ForeignKey(
                        name: "fk_roles_inquilino_permisos_permisos",
                        column: x => x.id_permiso_inquilino,
                        principalTable: "permisos_inquilino",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_roles_inquilino_permisos_roles",
                        column: x => x.id_rol_inquilino,
                        principalTable: "roles_inquilino",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_operativos_permisos",
                columns: table => new
                {
                    id_rol_operativo = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_operativo = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_operativos_permisos", x => new { x.id_rol_operativo, x.id_permiso_operativo });
                    table.ForeignKey(
                        name: "fk_roles_operativos_permisos_permisos",
                        column: x => x.id_permiso_operativo,
                        principalTable: "permisos_operativos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_roles_operativos_permisos_roles",
                        column: x => x.id_rol_operativo,
                        principalTable: "roles_operativos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_operativas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    id_empleado = table.Column<Guid>(type: "uuid", nullable: false),
                    id_unidad_operativa = table.Column<Guid>(type: "uuid", nullable: false),
                    id_rol_operativo = table.Column<Guid>(type: "uuid", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_inicio = table.Column<DateTime>(type: "date", nullable: false),
                    fecha_fin = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_operativas", x => x.id);
                    table.ForeignKey(
                        name: "fk_asignaciones_operativas_empleados",
                        column: x => x.id_empleado,
                        principalTable: "empleados",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_operativas_roles_operativos",
                        column: x => x.id_rol_operativo,
                        principalTable: "roles_operativos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_operativas_unidades_operativas",
                        column: x => x.id_unidad_operativa,
                        principalTable: "unidades_operativas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_inquilino_permisos",
                columns: table => new
                {
                    id_asignacion_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_inquilino = table.Column<Guid>(type: "uuid", nullable: false),
                    permitido = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_inquilino_permisos", x => new { x.id_asignacion_inquilino, x.id_permiso_inquilino });
                    table.ForeignKey(
                        name: "fk_asignaciones_inquilino_permisos_asignaciones",
                        column: x => x.id_asignacion_inquilino,
                        principalTable: "asignaciones_inquilino",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_inquilino_permisos_permisos",
                        column: x => x.id_permiso_inquilino,
                        principalTable: "permisos_inquilino",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_operativas_permisos",
                columns: table => new
                {
                    id_asignacion_operativa = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_operativo = table.Column<Guid>(type: "uuid", nullable: false),
                    permitido = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_operativas_permisos", x => new { x.id_asignacion_operativa, x.id_permiso_operativo });
                    table.ForeignKey(
                        name: "fk_asignaciones_operativas_permisos_asignaciones",
                        column: x => x.id_asignacion_operativa,
                        principalTable: "asignaciones_operativas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_operativas_permisos_permisos",
                        column: x => x.id_permiso_operativo,
                        principalTable: "permisos_operativos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_inquilino_activo",
                table: "asignaciones_inquilino",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_inquilino_inquilino",
                table: "asignaciones_inquilino",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_inquilino_rol",
                table: "asignaciones_inquilino",
                column: "id_rol_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_inquilino_usuario",
                table: "asignaciones_inquilino",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_inquilino_codigo",
                table: "asignaciones_inquilino",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_inquilino_usuario_inquilino_rol",
                table: "asignaciones_inquilino",
                columns: new[] { "id_usuario", "id_inquilino", "id_rol_inquilino" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_inquilino_permisos_permiso",
                table: "asignaciones_inquilino_permisos",
                column: "id_permiso_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_operativas_activo",
                table: "asignaciones_operativas",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_operativas_empleado",
                table: "asignaciones_operativas",
                column: "id_empleado");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_operativas_rol_operativo",
                table: "asignaciones_operativas",
                column: "id_rol_operativo");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_operativas_unidad_operativa",
                table: "asignaciones_operativas",
                column: "id_unidad_operativa");

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_operativas_codigo",
                table: "asignaciones_operativas",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_operativas_empleado_unidad_rol",
                table: "asignaciones_operativas",
                columns: new[] { "id_empleado", "id_unidad_operativa", "id_rol_operativo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_operativas_permisos_permiso",
                table: "asignaciones_operativas_permisos",
                column: "id_permiso_operativo");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_clientes_codigo",
                table: "clientes",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_clientes_usuario",
                table: "clientes",
                column: "id_usuario",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_direcciones_inquilino",
                table: "direcciones",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_empleados_activo",
                table: "empleados",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_empleados_inquilino",
                table: "empleados",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_empleados_usuario",
                table: "empleados",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_empleados_inquilino_id_usuario",
                table: "empleados",
                columns: new[] { "id_inquilino", "id_usuario" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_empleados_inquilino_numero_empleado",
                table: "empleados",
                columns: new[] { "id_inquilino", "numero_empleado" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_entidades_fiscales_activo",
                table: "entidades_fiscales",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_entidades_fiscales_inquilino",
                table: "entidades_fiscales",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "ux_entidades_fiscales_rfc",
                table: "entidades_fiscales",
                column: "rfc",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_inquilinos_codigo",
                table: "inquilinos",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_permisos_inquilino_codigo",
                table: "permisos_inquilino",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_permisos_operativos_codigo",
                table: "permisos_operativos",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_restaurantes_activo",
                table: "restaurantes",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_restaurantes_inquilino",
                table: "restaurantes",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "ux_restaurantes_inquilino_codigo",
                table: "restaurantes",
                columns: new[] { "id_inquilino", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_roles_inquilino_activo",
                table: "roles_inquilino",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_roles_inquilino_inquilino",
                table: "roles_inquilino",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "ux_roles_inquilino_inquilino_codigo",
                table: "roles_inquilino",
                columns: new[] { "id_inquilino", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_roles_inquilino_inquilino_nombre",
                table: "roles_inquilino",
                columns: new[] { "id_inquilino", "nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_roles_inquilino_permisos_permiso",
                table: "roles_inquilino_permisos",
                column: "id_permiso_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_roles_operativos_inquilino",
                table: "roles_operativos",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "ux_roles_operativos_inquilino_nombre",
                table: "roles_operativos",
                columns: new[] { "id_inquilino", "nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_roles_operativos_permisos_permiso",
                table: "roles_operativos_permisos",
                column: "id_permiso_operativo");

            migrationBuilder.CreateIndex(
                name: "idx_unidades_operativas_activo",
                table: "unidades_operativas",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_unidades_operativas_direccion",
                table: "unidades_operativas",
                column: "id_direccion");

            migrationBuilder.CreateIndex(
                name: "idx_unidades_operativas_entidad_fiscal",
                table: "unidades_operativas",
                column: "id_entidad_fiscal");

            migrationBuilder.CreateIndex(
                name: "idx_unidades_operativas_inquilino",
                table: "unidades_operativas",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "idx_unidades_operativas_restaurante",
                table: "unidades_operativas",
                column: "id_restaurante");

            migrationBuilder.CreateIndex(
                name: "ux_unidades_operativas_inquilino_codigo",
                table: "unidades_operativas",
                columns: new[] { "id_inquilino", "codigo" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asignaciones_inquilino_permisos");

            migrationBuilder.DropTable(
                name: "asignaciones_operativas_permisos");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "clientes");

            migrationBuilder.DropTable(
                name: "roles_inquilino_permisos");

            migrationBuilder.DropTable(
                name: "roles_operativos_permisos");

            migrationBuilder.DropTable(
                name: "asignaciones_inquilino");

            migrationBuilder.DropTable(
                name: "asignaciones_operativas");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "permisos_inquilino");

            migrationBuilder.DropTable(
                name: "permisos_operativos");

            migrationBuilder.DropTable(
                name: "roles_inquilino");

            migrationBuilder.DropTable(
                name: "empleados");

            migrationBuilder.DropTable(
                name: "roles_operativos");

            migrationBuilder.DropTable(
                name: "unidades_operativas");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "direcciones");

            migrationBuilder.DropTable(
                name: "entidades_fiscales");

            migrationBuilder.DropTable(
                name: "restaurantes");

            migrationBuilder.DropTable(
                name: "inquilinos");
        }
    }
}
