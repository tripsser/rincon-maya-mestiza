using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestauranteSaaS.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantAuthorization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "permisos_restaurante",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    nombre = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permisos_restaurante", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles_restaurante",
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
                    table.PrimaryKey("PK_roles_restaurante", x => x.id);
                    table.ForeignKey(
                        name: "fk_roles_restaurante_inquilinos",
                        column: x => x.id_inquilino,
                        principalTable: "inquilinos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_restaurante",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    codigo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    id_usuario = table.Column<Guid>(type: "uuid", nullable: false),
                    id_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    id_rol_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    fecha_inicio = table.Column<DateTime>(type: "date", nullable: false),
                    fecha_fin = table.Column<DateTime>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_restaurante", x => x.id);
                    table.ForeignKey(
                        name: "fk_asignaciones_restaurante_restaurantes",
                        column: x => x.id_restaurante,
                        principalTable: "restaurantes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_restaurante_roles",
                        column: x => x.id_rol_restaurante,
                        principalTable: "roles_restaurante",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_restaurante_usuarios",
                        column: x => x.id_usuario,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_restaurante_permisos",
                columns: table => new
                {
                    id_rol_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_restaurante = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_restaurante_permisos", x => new { x.id_rol_restaurante, x.id_permiso_restaurante });
                    table.ForeignKey(
                        name: "fk_roles_restaurante_permisos_permisos",
                        column: x => x.id_permiso_restaurante,
                        principalTable: "permisos_restaurante",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_roles_restaurante_permisos_roles",
                        column: x => x.id_rol_restaurante,
                        principalTable: "roles_restaurante",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "asignaciones_restaurante_permisos",
                columns: table => new
                {
                    id_asignacion_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    id_permiso_restaurante = table.Column<Guid>(type: "uuid", nullable: false),
                    permitido = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asignaciones_restaurante_permisos", x => new { x.id_asignacion_restaurante, x.id_permiso_restaurante });
                    table.ForeignKey(
                        name: "fk_asignaciones_restaurante_permisos_asignaciones",
                        column: x => x.id_asignacion_restaurante,
                        principalTable: "asignaciones_restaurante",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_asignaciones_restaurante_permisos_permisos",
                        column: x => x.id_permiso_restaurante,
                        principalTable: "permisos_restaurante",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_restaurante_activo",
                table: "asignaciones_restaurante",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_restaurante_restaurante",
                table: "asignaciones_restaurante",
                column: "id_restaurante");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_restaurante_rol",
                table: "asignaciones_restaurante",
                column: "id_rol_restaurante");

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_restaurante_usuario",
                table: "asignaciones_restaurante",
                column: "id_usuario");

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_restaurante_codigo",
                table: "asignaciones_restaurante",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_asignaciones_restaurante_usuario_restaurante_rol",
                table: "asignaciones_restaurante",
                columns: new[] { "id_usuario", "id_restaurante", "id_rol_restaurante" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_asignaciones_restaurante_permisos_permiso",
                table: "asignaciones_restaurante_permisos",
                column: "id_permiso_restaurante");

            migrationBuilder.CreateIndex(
                name: "ux_permisos_restaurante_codigo",
                table: "permisos_restaurante",
                column: "codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_roles_restaurante_activo",
                table: "roles_restaurante",
                column: "activo");

            migrationBuilder.CreateIndex(
                name: "idx_roles_restaurante_inquilino",
                table: "roles_restaurante",
                column: "id_inquilino");

            migrationBuilder.CreateIndex(
                name: "ux_roles_restaurante_inquilino_codigo",
                table: "roles_restaurante",
                columns: new[] { "id_inquilino", "codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ux_roles_restaurante_inquilino_nombre",
                table: "roles_restaurante",
                columns: new[] { "id_inquilino", "nombre" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_roles_restaurante_permisos_permiso",
                table: "roles_restaurante_permisos",
                column: "id_permiso_restaurante");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asignaciones_restaurante_permisos");

            migrationBuilder.DropTable(
                name: "roles_restaurante_permisos");

            migrationBuilder.DropTable(
                name: "asignaciones_restaurante");

            migrationBuilder.DropTable(
                name: "permisos_restaurante");

            migrationBuilder.DropTable(
                name: "roles_restaurante");
        }
    }
}
