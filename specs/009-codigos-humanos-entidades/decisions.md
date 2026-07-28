# Decisions: Codigos Humanos De Entidades

## Decisiones

### 2026-07-28 - Codigo Generado Por Backend

Decision:

Los codigos humanos seran generados por backend, no capturados manualmente por el usuario.

Motivo:

Evita duplicados, formatos inconsistentes y errores operativos.

Consecuencia:

Los formularios no deben pedir codigo por default.

### 2026-07-28 - GUID Sigue Siendo Id Tecnico

Decision:

El codigo humano no reemplaza al `id` tecnico.

Motivo:

El GUID mantiene integridad y relaciones internas; el codigo sirve para lectura, busqueda y operacion.

Consecuencia:

Las relaciones de base de datos siguen usando `id`/`id_*`, no codigos.

### 2026-07-28 - Codigo Segun Jerarquia

Decision:

El consecutivo de un codigo se calcula segun el nivel jerarquico donde vive la entidad: plataforma, tenant, restaurante, sucursal u operacion.

Motivo:

No es lo mismo generar el codigo de un tenant que el de una sucursal o una comanda. Cada entidad cuelga de un padre distinto y ese padre define su scope natural.

Consecuencia:

La tabla de consecutivos debe guardar `scope_tipo` e `id_scope`, y no solo la entidad.

### 2026-07-28 - Usuarios Identity Sin Codigo Inicial

Decision:

`AspNetUsers` no tendra codigo humano por default.

Motivo:

El usuario se identifica por email y `Id` tecnico. Sus permisos dependen de asignaciones por tenant/restaurante/sucursal, no de un codigo propio.

Consecuencia:

Si en el futuro se necesita codigo visible de usuario, se define como decision separada.
