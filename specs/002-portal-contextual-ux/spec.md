# Spec: Portal Contextual UX

## Estado

En implementacion

## Objetivo

Construir una experiencia tipo portal unico, donde NORIX no cambia de aplicacion: cambia el recurso y el contexto de trabajo.

## Principio De Producto

NORIX Portal es uno solo. El usuario no entra a "otro sistema" cuando administra tenant, restaurante/marca o unidad operativa. Cambia el contexto activo y con eso cambia la navegacion, las acciones y la vista principal.

## Jerarquia

- Plataforma NORIX: administracion interna del SaaS.
- Tenant: cliente/organizacion que contiene restaurantes, fiscal, usuarios y configuracion.
- Restaurante/marca: recurso administrable dentro del tenant.
- Unidad operativa/sucursal: contexto operacional de restaurante.

## Comportamiento

- El navbar superior muestra marca, buscador global/launcher y acciones generales.
- El breadcrumb muestra la ruta jerarquica del recurso actual.
- El rail de tenant permanece como contexto padre.
- Al abrir un restaurante/marca aparece un rail anidado de restaurante.
- Al abrir una unidad operativa aparece un rail anidado de sucursal.
- Cada rail puede contraerse para ahorrar espacio.
- Cuando un rail hijo se abre, el rail padre puede contraerse si esta fijo.
- En pantallas medianas y chicas la navegacion debe adaptarse a una barra inferior expandible.

## Contextos Visuales

- Tenant: azul NORIX.
- Restaurante/marca: verde NORIX.
- Unidad operativa/sucursal: violeta NORIX.

## Reglas UX

- La coleccion se muestra primero sin rail anidado.
- El rail anidado aparece al entrar al detalle de un recurso.
- Las acciones deben ser consistentes entre contextos: agregar, administrar vistas, actualizar, exportar, comentarios.
- El detalle de recurso debe parecerse a Azure resource overview: header fuerte, acciones horizontales, tabs y rail contextual.
- La edicion principal se hara con panel lateral/drawer desde colecciones.
- En detalle de recurso, propiedades editables pueden usar icono de lapiz puntual en vez de una pestana grande de editar.

## No Incluye

- CRUD completo de todos los recursos.
- Permisos finales por vista.
- Buscador global real.
- Personalizacion avanzada de dashboards.

## Criterios De Aceptacion

- [x] Existe login visual NORIX.
- [x] Existe portal base despues del login.
- [x] Existe rail tenant.
- [x] Existe rail restaurante/marca.
- [x] Existe rail unidad operativa/sucursal.
- [x] Existe navegacion mobile inferior expandible.
- [ ] Homogeneizar tablas con el estilo elegido.
- [ ] Definir estados vacios y de error por recurso.
- [ ] Definir launcher global tipo Ctrl+K.
- [ ] Validar visualmente desktop, tablet y mobile.

