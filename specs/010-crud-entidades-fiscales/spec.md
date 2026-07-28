# Spec: CRUD Entidades Fiscales

## Estado

Implementada

## Objetivo

Administrar entidades fiscales del tenant desde una coleccion NORIX con tabla, filtros, drawer de alta/edicion y activacion logica.

## Alcance

Incluye:

- Listado por tenant.
- Busqueda por RFC, razon social, regimen fiscal, correo o telefono.
- Filtro por estado activo/inactivo.
- Crear entidad fiscal.
- Editar entidad fiscal.
- Activar/desactivar entidad fiscal.
- Vista frontend en `/tenant/entidades-fiscales`.
- Vista individual en `/tenant/entidades-fiscales/{id}`.
- Edicion desde drawer dentro del detalle.
- Pestaña `Unidades operativas` dentro del detalle, filtrada por la entidad fiscal.

No incluye:

- Rail propio de entidad fiscal; por ahora vive como recurso individual dentro del contexto tenant.
- Validacion fiscal avanzada contra SAT.

## Criterios De Aceptacion

- [x] API expone CRUD base.
- [x] Frontend muestra coleccion.
- [x] Sidebar tenant navega a la coleccion.
- [x] Mobile sheet navega a la coleccion.
- [x] La coleccion abre la vista individual por id.
- [x] La vista individual permite editar y activar/desactivar.
- [x] API expone unidades operativas por entidad fiscal.
- [x] Frontend muestra unidades operativas al seleccionar la pestaña.
- [x] Build backend pasa.
- [x] Build frontend pasa.
