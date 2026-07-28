# Data Model: Codigos Humanos De Entidades

## Opcion Recomendada Inicial

Crear una tabla de control de consecutivos por scope.

### consecutivos_codigos

Campos candidatos:

- `id`
- `scope_tipo`
- `id_scope`
- `entidad`
- `prefijo`
- `ultimo_numero`
- `creado_en`
- `actualizado_en`

Unique:

- `UNIQUE (scope_tipo, id_scope, entidad)`

## Ejemplo

Para restaurantes dentro de un tenant:

- `scope_tipo = 'tenant'`
- `id_scope = id_inquilino`
- `entidad = 'restaurante'`
- `prefijo = 'RES'`
- `ultimo_numero = 12`

Siguiente codigo:

- `RES-0013`

## Concurrencia

La generacion debe ser atomica:

1. Abrir transaccion.
2. Bloquear fila del consecutivo con `FOR UPDATE` o equivalente EF/SQL.
3. Incrementar `ultimo_numero`.
4. Generar codigo.
5. Insertar entidad con codigo.
6. Commit.

## Alternativa PostgreSQL

Usar secuencias PostgreSQL por entidad/scope.

Ventaja:

- Muy robusto para concurrencia.

Desventaja:

- Manejar secuencias dinamicas por tenant/restaurante puede volverse mas dificil de migrar y mantener.

## Reglas Por Entidad Pendientes

| Nivel | Entidad | Scope sugerido | Prefijo | Nota |
| --- | --- | --- | --- | --- |
| plataforma | inquilinos | plataforma | TEN | consecutivo global NORIX |
| tenant | restaurantes | id_inquilino | RES | marca/restaurante dentro del tenant |
| tenant | empleados | id_inquilino | EMP | empleado pertenece al tenant |
| tenant | clientes | pendiente | CLI | depende de decision de alcance |
| restaurante | unidades_operativas | id_restaurante | SUC | sucursal dentro de marca |
| restaurante | productos | id_restaurante | PROD | productos maestros de marca |
| restaurante | menus | id_restaurante | MENU | menus maestros de marca |
| restaurante | categorias | id_restaurante | CAT | categorias de catalogo |
| restaurante | areas_preparacion | id_restaurante | AREA | areas de preparacion |
| sucursal | activos_tecnologicos | id_unidad_operativa | ACT | inventario tecnologico local |
| sucursal | impresoras | id_unidad_operativa | IMP | hija/especializacion de activo |
| sucursal | computadoras | id_unidad_operativa | COMP | hija/especializacion de activo |
| operacion | comandas | id_unidad_operativa + fecha | CMD | consecutivo por dia/sucursal |
| operacion | trabajos_impresion | id_unidad_operativa + fecha | PRN | consecutivo tecnico-operativo |

## Entidades Sin Codigo Inicial

### AspNetUsers

No llevara codigo humano por default.

Motivo:

- Identity ya tiene `Id` tecnico y email.
- Un usuario puede administrar varios tenants o tener distintos roles.
- Un codigo unico de usuario no expresa contexto de negocio.

### Tablas Puente

No llevan codigo:

- asignaciones_inquilino.
- asignaciones_restaurante.
- asignaciones_operativas.
- roles_permisos.
- productos_areas_preparacion.

Motivo:

- Funcionan como relacion/asignacion.
- Su identificacion humana viene de las entidades relacionadas.
