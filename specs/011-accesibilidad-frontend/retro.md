# Retro: Accesibilidad Frontend

## Resultado Actual

Baseline inicial implementado.

## Errores Encontrados

- El HTML raiz estaba en ingles aunque la aplicacion esta en español.
- El foco visible no esta estandarizado; varios inputs y botones eliminan outline.
- Los drawers funcionan visualmente, pero aun necesitaban semantica de dialogo.
- Las tabs del header eran botones visuales sin roles de tablist/tab.

## Arreglos Aplicados

- Se cambio `lang="es"` y titulo `NORIX SaaS`.
- Se agrego foco visible global para teclado.
- `SideDrawer` ahora usa `role="dialog"`, `aria-modal`, titulo enlazado, foco inicial y cierre con `Escape`.
- `ResourceHeader` ahora expone tabs con `role="tablist"`, `role="tab"` y `aria-selected`.
- `PortalTopBar` convierte iconos sueltos en botones con `aria-label`.
- `CommandBar` y `DataTable` recibieron labels basicos para acciones/paginacion.
- `SideDrawer` ahora atrapa `Tab` / `Shift+Tab` dentro del panel y restaura foco al cerrar.
- `DataTableMessageRow` anuncia loading/empty states con `role="status"` y `aria-live`.
- `DataTableCheckbox` ahora es un `input type="checkbox"` real con labels por fila.
- Build frontend verificado con `npm.cmd run build`.

## Pendientes Nuevos

- Revisar contraste real de `text-white/34`, `text-white/38`, `text-white/42` sobre superficies glass.
- Crear prueba automatizada con axe cuando integremos Playwright o Vitest.
- Migrar drawers manuales restantes a `SideDrawer`.
- Conectar estado real de seleccion de filas antes de habilitar acciones masivas.
- Hacer que tabs soporten flechas izquierda/derecha.
