# Plan: Tablas Y Colecciones NORIX

## Componentes A Crear O Madurar

- `CollectionPage`
- `CollectionToolbar`
- `DataTable`
- `DataTablePagination`
- `DataTableSelectionBar`
- `RowActionsMenu`
- `StatusBadge`
- `SideDrawer`
- `EmptyState`
- `ErrorState`
- `LoadingRows`

## Implementacion Propuesta

1. Revisar `shared/ui/DataTable.tsx`, `SideDrawer.tsx`, `StatusBadge.tsx` y pantallas de restaurantes.
2. Definir API de componentes con TypeScript.
3. Aplicar el patron primero en `Restaurantes / Marcas`.
4. Validar desktop.
5. Validar mobile.
6. Documentar ajustes en `retro.md`.
7. Replicar despues en unidades, usuarios y productos.

## API Visual Sugerida

```ts
type CollectionAction = {
  label: string;
  icon?: ReactNode;
  intent?: "default" | "primary" | "danger";
  onClick: () => void;
};

type CollectionFilter = {
  id: string;
  label: string;
  value: string;
  active?: boolean;
};
```

## Validacion

- `npm run build`
- Revision manual en desktop.
- Revision manual en mobile.
- Confirmar que la tabla no se rompe con nombres largos.
- Confirmar que acciones y badges no cambian altura de fila.

## Riesgos

- Sobre-abstraer antes de tener 2 o 3 colecciones reales.
- Hacer una tabla demasiado generica y dificil de usar.
- Sacrificar densidad por exceso de decoracion.

