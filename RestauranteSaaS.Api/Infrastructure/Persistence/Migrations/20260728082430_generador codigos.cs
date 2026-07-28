using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestauranteSaaS.Api.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class generadorcodigos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "consecutivos_codigos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    scope_tipo = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    id_scope = table.Column<Guid>(type: "uuid", nullable: false),
                    entidad = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    prefijo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ultimo_numero = table.Column<long>(type: "bigint", nullable: false),
                    creado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    actualizado_en = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consecutivos_codigos", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ux_consecutivos_codigos_scope_entidad",
                table: "consecutivos_codigos",
                columns: new[] { "scope_tipo", "id_scope", "entidad" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "consecutivos_codigos");
        }
    }
}
