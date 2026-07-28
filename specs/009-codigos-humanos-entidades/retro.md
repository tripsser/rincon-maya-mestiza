# Retro: Codigos Humanos De Entidades

## Resultado

Se implemento la primera version del generador de codigos humanos.

Alcance implementado:

- Entidad `ConsecutivoCodigo`.
- Servicio `ICodigoEntidadService`.
- Generacion atomica con transaccion y advisory lock PostgreSQL.
- Integracion en alta de restaurantes/marcas.
- UI de restaurantes ya no pide codigo manual.

Alcance revertido:

- Migracion manual `consecutivos_codigos`.
- Cambio manual al snapshot EF.

## Aprendizajes

- El contador debe depender del padre jerarquico, no solo de la entidad.
- PostgreSQL permite multiples `NULL` en indices unique, por eso `id_scope` se guarda siempre con valor. Para plataforma/global se usa `Guid.Empty`.
- No se debe crear migracion EF manualmente cuando el tooling local esta bloqueado; se deja pendiente para generarla con `dotnet ef migrations add` en un entorno sano.

## Pendientes Nuevos

- Integrar codigos en unidades operativas cuando exista CRUD de sucursales.
- Generar la migracion EF correctamente.
- Definir si clientes son tenant, restaurante o sucursal.
- Definir si algun dia se permitira edicion manual con permiso administrativo.
