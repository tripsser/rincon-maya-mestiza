# Retro: Portal Contextual UX

## Resultado Actual

El layout ya comunica jerarquia y contexto, pero todavia necesita pulido visual y reglas mas firmes para tablas, drawers y estados.

## Errores Encontrados

- Algunos cambios de tema hicieron que la interfaz se sintiera plana.
- Los chips de rails no siempre quedaron visualmente consistentes.
- Los sidebars tuvieron problemas de altura, scroll y comportamiento en pantallas chicas.
- La diferencia entre coleccion y detalle de recurso no siempre fue clara al inicio.

## Arreglos Aplicados

- Se agrego arquitectura por features.
- Se agrego bottom navigation para mobile.
- Se separo el concepto de rail por recurso.
- Se empezo a alinear el layout a filosofia tipo Azure.
- Se unifico el comportamiento de rails con dos modos persistentes: fijado desplegado y fijado contraido.
- Se centralizo la geometria compacta de sidebar/rails con variables y clases compartidas: ancho compacto, stack, item, chip y control usan el mismo eje.
- Se homologo la animacion de `TenantSidebar` y `ResourceRail`: ambos usan variables de ancho, estado expanded/compact, reveal de rail y animacion interna de contenido.
- Se corrigio el chip compacto para que sea cuadrado, no una tarjeta vertical.
- Se agrego tooltip custom para rails contraidos usando portal a `document.body`, evitando que el `overflow` del sidebar corte el tooltip.
- Se movio el shell del portal a layouts persistentes: tenant, restaurante y sucursal. Al navegar, los sidebars quedan montados y solo cambia el contenido del contexto.
- Se extrajeron `RestaurantResourceRail` y `BranchResourceRail` desde `pages` hacia `features/tenant/restaurants/components` para separar navegacion persistente de pantallas de contenido.

## Pendientes Nuevos

- Crear pruebas visuales o screenshots de referencia.
- Definir tokens finales de tema oscuro.
- Crear tabla canonica NORIX.
- Crear launcher global.
- Validar visualmente que los controles de rail no compitan con el chip de contexto en desktop.
- Validar que los tooltips nativos de rails contraidos sean suficientes antes de crear un tooltip custom.
- Revisar si `RestaurantPortalLayout` y `BranchPortalLayout` deben exponer datos por `Outlet context` cuando el contenido empiece a repetir demasiado las mismas queries.
