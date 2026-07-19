-- Limpieza de datos del esquema multitenant para reiniciar pruebas.
-- No toca "__EFMigrationsHistory"; las migraciones aplicadas se conservan.
-- Uso esperado: ejecutar antes de volver a correr el seed inicial.

BEGIN;

TRUNCATE TABLE
    "AspNetUserTokens",
    "AspNetUserLogins",
    "AspNetUserClaims",
    "AspNetUserRoles",
    "AspNetRoleClaims",
    "AspNetRoles",
    "AspNetUsers",
    asignaciones_operativas_permisos,
    roles_operativos_permisos,
    asignaciones_operativas,
    permisos_operativos,
    roles_operativos,
    clientes,
    empleados,
    unidades_operativas,
    direcciones,
    entidades_fiscales,
    asignaciones_restaurante_permisos,
    asignaciones_restaurante,
    roles_restaurante_permisos,
    permisos_restaurante,
    roles_restaurante,
    restaurantes,
    asignaciones_inquilino_permisos,
    asignaciones_inquilino,
    roles_inquilino_permisos,
    permisos_inquilino,
    roles_inquilino,
    inquilinos
RESTART IDENTITY CASCADE;

COMMIT;
