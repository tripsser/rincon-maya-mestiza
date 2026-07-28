# Spec: Codigos Humanos De Entidades

## Estado

Borrador

## Objetivo

Definir como NORIX genera codigos humanos de negocio para entidades clave, sin pedirle al usuario que los escriba manualmente.

## Problema

Los `id` tecnicos son GUIDs y sirven para integridad, pero no para operacion diaria. El usuario necesita codigos cortos, legibles y estables para reconocer recursos rapidamente:

- restaurante/marca.
- unidad operativa/sucursal.
- empleado.
- producto.
- menu.
- categoria.
- comanda.
- dispositivo.
- impresora.
- inventario tecnologico.

Si cada pantalla permite escribir codigos a mano, apareceran duplicados, formatos distintos, errores de captura y codigos sin sentido.

## Principio

El usuario no escribe el codigo por default. NORIX lo genera automaticamente con una convencion por entidad y scope.

El usuario puede ver el codigo, copiarlo y buscar por el. Editarlo manualmente debe ser una excepcion con permiso administrativo.

## Reglas Generales

- Cada entidad con codigo debe tener un prefijo claro.
- El codigo debe ser unico dentro de su scope natural.
- El codigo debe ser estable; no cambia si cambia el nombre.
- El codigo no reemplaza al GUID.
- El codigo debe poder generarse en backend dentro de transaccion.
- El frontend puede previsualizar, pero el backend decide.
- Los codigos deben ser case-insensitive para busqueda.

## Niveles De Generacion

El codigo se genera segun el nivel donde vive la entidad. La regla no debe definirse solo por nombre de tabla, sino por jerarquia: quien contiene a quien.

### Nivel Plataforma

Entidades que existen para NORIX como SaaS, antes de entrar a un tenant.

Ejemplos:

- inquilinos.
- planes.
- suscripciones.
- clientes SaaS internos, si existen despues.

Scope:

- plataforma.

Ejemplo:

- `TEN-0001`

### Nivel Tenant

Entidades que cuelgan directamente de un inquilino.

Ejemplos:

- restaurantes/marcas.
- empleados.
- entidades fiscales, si se decide que tengan codigo.
- direcciones, si algun dia se requiere codigo operativo.
- roles/permisos/asignaciones de tenant, si se vuelven visibles para negocio.

Scope:

- `id_inquilino`.

Ejemplos:

- `RES-0001`
- `EMP-0001`

### Nivel Restaurante / Marca

Entidades que cuelgan de una marca/restaurante.

Ejemplos:

- unidades operativas/sucursales.
- productos maestros.
- menus maestros.
- categorias.
- areas de preparacion.

Scope:

- `id_restaurante`.

Ejemplos:

- `SUC-0001`
- `PROD-0001`
- `MENU-0001`

### Nivel Unidad Operativa / Sucursal

Entidades que existen dentro de una sucursal concreta.

Ejemplos:

- activos tecnologicos.
- impresoras.
- computadoras.
- cajas.
- mesas.
- inventario operativo.

Scope:

- `id_unidad_operativa`.

Ejemplos:

- `IMP-0001`
- `ACT-0001`

### Nivel Operacion / Documento

Entidades transaccionales que pueden requerir fecha, turno o caja para lectura humana.

Ejemplos:

- comandas.
- tickets.
- cortes.
- trabajos de impresion.
- movimientos de inventario.

Scope:

- normalmente `id_unidad_operativa` + periodo.

Ejemplo:

- `CMD-20260728-0001`

### Usuarios Identity

Los usuarios de `AspNetUsers` no deben tratarse igual que recursos de negocio.

Regla inicial:

- El usuario se identifica por email y `Id` tecnico.
- No necesita codigo humano por default.
- Si despues se necesita un codigo publico de usuario, debe ser una decision separada, porque un mismo usuario puede tener scopes en varios tenants.

### Clientes

Clientes requiere decision aparte:

- Si son clientes globales del tenant, scope `id_inquilino`.
- Si son clientes por restaurante/marca, scope `id_restaurante`.
- Si son clientes operativos de sucursal, scope `id_unidad_operativa`.

Decision pendiente:

- Definir si `clientes` sera una entidad global por tenant o contextual por restaurante/sucursal.

## Ejemplos Iniciales

- Inquilino: `TEN-0001`
- Restaurante/marca: `RES-0001`
- Unidad operativa/sucursal: `SUC-0001`
- Empleado: `EMP-0001`
- Producto: `PROD-0001`
- Menu: `MENU-0001`
- Categoria: `CAT-0001`
- Comanda: `CMD-20260728-0001`
- Impresora: `IMP-0001`
- Dispositivo: `DISP-0001`

## Pendiente De Decision

Definir si los codigos usaran:

- Secuencia numerica por entidad y scope.
- Prefijo derivado de entidad + consecutivo.
- Prefijo derivado de marca/sucursal + consecutivo.
- Codigo corto mas humano basado en slug del nombre.

Recomendacion inicial:

- Usar prefijo fijo por entidad + consecutivo por scope.
- Evitar slugs en el codigo principal porque cambian con nombres y generan conflictos.
- No generar codigo para usuarios Identity en esta etapa.

## Criterios De Aceptacion

- [ ] Existe convencion de prefijos.
- [ ] Existe tabla o mecanismo de secuencias por scope.
- [ ] El backend genera codigos atomicos.
- [ ] Los CRUDs no piden codigo manual por default.
- [ ] Las tablas muestran codigo como columna principal secundaria.
- [ ] Busquedas pueden usar codigo.
