# Decisions: Portal Contextual UX

## Decisiones

### 2026-07-27 - Portal Unico

Decision:

NORIX tendra un solo portal. Lo que cambia es el contexto de trabajo.

Motivo:

Se parece a la filosofia de Azure: el usuario navega recursos dentro del mismo producto, no cambia de aplicacion.

Consecuencia:

La navegacion, tabs y acciones deben depender del recurso activo.

### 2026-07-27 - Rails Jerarquicos

Decision:

Tenant, restaurante/marca y unidad operativa usan rails anidados.

Motivo:

Permite visualizar jerarquia y autorizacion por nivel sin perder contexto.

Consecuencia:

Cada rail debe poder contraerse y el responsive necesita una estrategia propia.

### 2026-07-27 - Coleccion Antes De Recurso

Decision:

Las colecciones muestran primero la lista. El rail anidado aparece al abrir un recurso.

Motivo:

Evita confundir administracion de coleccion con administracion de recurso especifico.

Consecuencia:

`/tenant/restaurantes` no debe verse igual que `/tenant/restaurantes/:id`.

### 2026-07-27 - Edicion Con Drawer

Decision:

La edicion desde colecciones se hara con panel lateral.

Motivo:

Mantiene contexto y evita cambiar toda la pantalla para operaciones cortas.

Consecuencia:

Los formularios deben poder vivir en `SideDrawer` y cerrar sin perder la coleccion.

