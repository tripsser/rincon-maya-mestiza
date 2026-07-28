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

### 2026-07-28 - Modo Fijo De Rails

Decision:

Cada navbar/rail desktop puede operar en dos modos fijos: `expanded` y `compact`.

Motivo:

El despliegue automatico por hover se siente incomodo en una navegacion jerarquica densa. El usuario debe decidir si quiere la barra abierta o contraida.

Consecuencia:

`TenantSidebar` y `ResourceRail` comparten el mismo hook y control visual. Cuando un rail esta contraido, los items y chips principales exponen tooltip nativo mediante `title` y `aria-label`.

### 2026-07-28 - Layout Persistente Por Nivel

Decision:

El sidebar tenant, el rail restaurante/marca y el rail unidad operativa/sucursal viven en layouts persistentes con `Outlet`.

Motivo:

La navegacion debe sentirse como Azure: el marco del portal no se recarga ni reanima completo. Solo cambia el contenido del contexto activo.

Consecuencia:

Las paginas de coleccion/detalle ya no deben montar `TenantSidebar`, `PortalTopBar` ni rails de recurso directamente. Cada pagina solo renderiza su area de contenido y sus drawers.

### 2026-07-28 - Separacion Semantica De Render Tree

Decision:

Los rails de recurso viven en `features/*/components`, no dentro de archivos `pages`.

Motivo:

Una pagina representa contenido navegable. Un rail representa navegacion contextual persistente. Mezclarlos hace que los layouts dependan de pantallas especificas y confunde el arbol de renderizado.

Consecuencia:

`app/layouts` puede importar componentes de feature para componer el shell, pero no debe importar rails desde `pages`. Las paginas no deben exportar piezas de navegacion persistente.
