# Retro: Tablas Y Colecciones NORIX

## Resultado

Se inicio la estandarizacion real de colecciones con `DataTable`.
Restaurantes/marcas, entidades fiscales y la subcoleccion de sucursales dentro del recurso restaurante ya usan el mismo patron visual base.

## Errores Encontrados

- La subcoleccion de sucursales seguia usando una tabla manual, por eso se veia distinta a las colecciones principales.

## Arreglos

- Se reemplazo la tabla manual de sucursales por `DataTableShell`, `DataTableHeader`, `DataTableBody`, `DataTableFooter`, `DataTableFilterButton` y `StatusBadge`.
- Se verifico el frontend con `npm.cmd run build`.

## Pendientes Nuevos

- Auditar todas las pantallas de tenant/restaurante/sucursal para detectar tablas manuales restantes.
- Definir el comportamiento real de paginacion, filtros y selector `View`; por ahora el componente visual esta homogeneizado.
