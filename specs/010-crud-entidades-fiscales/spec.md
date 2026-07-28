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

No incluye:

- Detalle de recurso con rail propio.
- Asociacion visual con unidades operativas.
- Validacion fiscal avanzada contra SAT.

## Criterios De Aceptacion

- [x] API expone CRUD base.
- [x] Frontend muestra coleccion.
- [x] Sidebar tenant navega a la coleccion.
- [x] Mobile sheet navega a la coleccion.
- [x] Build backend pasa.
- [x] Build frontend pasa.

