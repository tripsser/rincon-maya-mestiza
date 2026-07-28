# Plan: Portal Contextual UX

## Arquitectura Frontend

El frontend usa arquitectura por features:

- `app`: providers, router y configuracion global.
- `features/auth`: login y estado de autenticacion.
- `features/context`: portal/contexto principal.
- `features/tenant/restaurants`: pantallas de restaurantes/marcas.
- `shared/api`: cliente HTTP compartido.
- `shared/ui`: componentes visuales reutilizables.

## Componentes Actuales Relevantes

- `TenantSidebar`
- `ResourceRail`
- `ContextRailChip`
- `ResourceHeader`
- `CommandBar`
- `DataTable`
- `SideDrawer`
- `MobileBottomNav`
- `ThemeToggle`

## Estrategia

1. Congelar la idea de layout por contexto.
2. Separar vistas por nivel: tenant, restaurante, sucursal.
3. Hacer que colecciones no abran rail hasta seleccionar recurso.
4. Homogeneizar acciones y headers.
5. Mejorar tablas y drawers.
6. Pulir responsive.
7. Agregar launcher global.

## Validacion

- `npm run build`
- `npm run lint` si esta configurado.
- Revision manual en desktop.
- Revision manual en viewport mediano.
- Revision manual en mobile.

## Riesgos

- Mezclar autorizacion con navegacion visual.
- Que el rail anidado se vuelva decorativo y no represente recurso real.
- Que el tema visual opaque la usabilidad de tablas y formularios.

