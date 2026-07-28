# UX: Tablas Y Colecciones NORIX

## Direccion Visual

La tabla debe sentirse parte de NORIX Console:

- Oscura, seria y limpia.
- Bordes sutiles.
- Estados con color de marca.
- Hover claro sin gritar.
- Tipografia densa pero legible.
- Paginacion compacta.
- Filtros visibles sin ocupar demasiado alto.

## Referencia De Producto

La tabla debe acercarse al estilo de panel moderno que el usuario marco como referencia:

- Toolbar superior dentro del contenedor.
- Filtros tipo botones compactos.
- Tabla con rows bien separadas.
- Badges pequenos y legibles.
- Paginacion inferior.
- Action bar flotante o inferior al seleccionar.

No se debe copiar literal la referencia. Se adapta a NORIX con paleta, jerarquia y contexto propios.

## Layout Desktop

Estructura:

1. Header del recurso o coleccion.
2. Command bar contextual.
3. Tabs si aplica.
4. Contenedor de coleccion.
5. Toolbar interna.
6. Tabla.
7. Footer con seleccion/paginacion.

## Layout Mobile

En mobile:

- La toolbar se compacta.
- Los filtros avanzados abren sheet.
- Las filas pueden convertirse a cards.
- Las acciones por fila deben quedar en menu.
- La seleccion multiple debe seguir siendo posible, pero no estorbar.

## Estados Canonicos

### Loading

- Skeleton rows.
- No spinner gigante si la tabla ya tiene estructura.

### Vacio

- Mensaje corto.
- Accion primaria si el usuario tiene permiso.

### Error

- Mensaje claro.
- Boton reintentar.
- Detalle tecnico oculto o secundario.

### Sin Permisos

- Explicar que no tiene acceso para ver o modificar.
- No mostrar acciones que no puede ejecutar.

### Sin Resultados

- Indicar que los filtros no devuelven resultados.
- Boton limpiar filtros.

## Badges

Estados iniciales recomendados:

- Activo: verde.
- Inactivo: gris.
- Pendiente: azul.
- Error: rojo.
- Advertencia: amarillo/naranja.
- Procesando: violeta o azul.

## Drawers

El drawer debe:

- Salir desde la derecha en desktop.
- Salir como sheet inferior o pantalla completa parcial en mobile.
- Tener titulo, descripcion corta opcional, formulario y acciones fijas abajo.
- Bloquear cierre accidental si hay cambios sin guardar.

