# UX: Portal Contextual

## Layout Base

El layout se compone de:

- Navbar superior de ancho completo.
- Breadcrumb jerarquico.
- Rail global/contextual.
- Rails anidados por recurso.
- Area de contenido del recurso activo.
- Navegacion mobile inferior.

## Tenant

Menu lateral sugerido:

- Inicio
- Directorio
- Restaurantes / Marcas
- Unidades operativas / Sucursales
- Entidades fiscales
- Direcciones
- Usuarios
- Acceso
- Roles
- Permisos
- Asignaciones
- Actividad
- Auditoria
- Sesiones
- Configuracion

La vista tenant debe servir para administracion global del cliente. Puede mostrar datos agregados, pero no debe sustituir el contexto operacional de sucursal.

## Restaurante / Marca

Coleccion:

- Lista de restaurantes/marcas.
- Filtros.
- Acciones de crear, actualizar, exportar.
- Al seleccionar uno, se navega al recurso.

Detalle:

- Informacion general.
- Sucursales.
- Catalogo.
- Acceso.
- Actividad.
- Configuracion.

El rail de restaurante aparece solo al entrar al recurso.

## Unidad Operativa / Sucursal

Detalle operativo sugerido:

- Inicio
- Operacion
- Mesas
- Comandas
- Cocina
- Caja
- Clientes
- Dispositivos
- Impresoras
- Inventario
- Usuarios
- Configuracion

Este contexto es estrictamente operacional. No debe mostrar administracion global del tenant salvo accesos de navegacion.

## Mobile

En pantallas pequenas:

- Los rails laterales no deben quedar fuera del alcance.
- La navegacion principal baja a bottom nav.
- La accion "Mas" abre una pestana/sheet hacia arriba.
- Debe evitar varias filas permanentes; si hay muchas opciones, se usa panel expandible.

## Tema Visual

Base de marca:

- Azul profundo: `#080f19`
- Gris grafito: `#141a24`
- Azul NORIX: `#2563ff`
- Verde NORIX: `#22d3a6`
- Violeta: `#7c4dff`
- Gris claro: `#e2e6f0`

Direccion actual:

- Mantener layout oscuro NORIX.
- Usar glass con sutileza, sin gradientes blancos fuertes en paneles.
- Los chips de contexto deben tener profundidad y glow de marca.
- Evitar que los paneles se vean solidos o planos.
- Tema claro queda pendiente; no es prioridad hasta madurar el dark.

## Estrategia De Temas Pendiente

NORIX debe soportar dos estilos visuales y dos modos de color:

- `solid-dark`: tema base recomendado; serio, robusto, corporativo y estable.
- `solid-light`: variante clara del tema solido, pendiente de diseno fino.
- `glass-dark`: variante premium con transparencias, glow y mayor profundidad.
- `glass-light`: variante clara con glass, pendiente porque requiere cuidar contraste y evitar que se vea plano.

La implementacion futura debe separarlo en dos ejes:

- `themeStyle`: `solid` o `glass`.
- `themeMode`: `dark` o `light`.

Los componentes no deben depender de clases sueltas por tema. Deben consumir tokens CSS compartidos como `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`, `--glow`, `--panel-bg` y `--chip-bg`.

Decision temporal:

- Mantener `solid-dark` como default.
- No invertir tiempo todavia en los temas light hasta cerrar tablas, drawers y estados base.

## Pendientes Visuales

- Afinar textura/fondo para que el glass resalte.
- Homogeneizar chips de tenant, restaurante y sucursal.
- Definir tabla final inspirada en el panel externo, adaptada a NORIX.
- Definir transiciones de rail sin parpadeo.
