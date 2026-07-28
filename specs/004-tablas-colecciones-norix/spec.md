# Spec: Tablas Y Colecciones NORIX

## Estado

Borrador

## Objetivo

Definir un patron canonico para colecciones, tablas, seleccion, filtros, acciones y estados en NORIX.

## Por Que Importa

La mayoria del sistema se administra mediante colecciones:

- Restaurantes / Marcas
- Unidades operativas / Sucursales
- Usuarios
- Roles
- Permisos
- Productos
- Menus
- Categorias
- Dispositivos
- Impresoras
- Comandas
- Inventario

Si cada vista resuelve tablas a su modo, NORIX se sentira inconsistente y caro de mantener. La tabla canonica debe volverse un bloque reutilizable de producto.

## Principios

- Una coleccion no es solo una tabla; es una superficie de trabajo.
- El usuario debe poder buscar, filtrar, seleccionar, actuar y entrar al detalle sin aprender un patron nuevo en cada modulo.
- Click principal en fila abre el recurso.
- Crear/editar rapido desde coleccion usa drawer lateral.
- Acciones destructivas requieren confirmacion.
- Permisos afectan acciones visibles y disponibles.
- Mobile no debe mostrar una tabla rota; debe cambiar a cards compactas o filas simplificadas.

## Anatomia Canonica

Una coleccion NORIX debe tener:

- Header de coleccion con titulo, descripcion corta opcional y accion primaria.
- Toolbar con busqueda, filtros rapidos, filtros avanzados y vista.
- Tabla o lista principal.
- Badges de estado consistentes.
- Acciones por fila.
- Seleccion multiple.
- Barra de acciones al seleccionar.
- Paginacion.
- Estados de loading, vacio, error, sin permisos y sin resultados.
- Drawer lateral para crear/editar.

## Comportamiento Base

### Busqueda

- Debe estar arriba de la tabla.
- Debe filtrar por campos humanos relevantes, no por ids tecnicos por default.
- Debe permitir limpiar rapidamente.

### Filtros

- Filtros rapidos como chips o botones compactos.
- Filtros avanzados en popover/drawer pequeno.
- Los filtros activos deben verse claramente.

### Seleccion

- Checkbox por fila.
- Checkbox en header para seleccionar pagina actual.
- Al seleccionar filas aparece action bar.
- La action bar debe mostrar cantidad seleccionada.

### Acciones Por Fila

- Acciones frecuentes pueden ser icon buttons.
- Acciones secundarias van en menu de tres puntos.
- Acciones peligrosas separadas visualmente.

### Detalle

- Click en fila navega al detalle del recurso.
- El detalle no debe abrirse en modal.
- El detalle puede tener su propio rail contextual si el recurso lo amerita.

### Crear Y Editar

- Crear desde coleccion abre drawer lateral.
- Editar desde coleccion abre drawer lateral.
- Editar desde detalle puede ser inline puntual con icono de lapiz o drawer de propiedades.

## Criterios De Aceptacion

- [ ] Existe componente canonico para colecciones.
- [ ] Existe componente de toolbar canonico.
- [ ] Existe componente de tabla canonico.
- [ ] Existe action bar de seleccion.
- [ ] Existe drawer estandar para formularios.
- [ ] Existen estados canonicos.
- [ ] La vista de restaurantes/marcas usa el patron.
- [ ] La vista se adapta a mobile sin romper layout.

