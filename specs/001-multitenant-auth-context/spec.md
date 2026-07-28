# Spec: Multitenant Auth Context

## Estado

Implementada parcialmente

## Objetivo

Validar la infraestructura base de autenticacion, sesion distribuida y contexto jerarquico para NORIX.

## Contextos

- Tenant: administracion del inquilino, directorio, restaurantes/marcas, unidades operativas, entidades fiscales, roles y permisos de inquilino.
- Restaurante/marca: administracion de una marca dentro del tenant, con cobertura jerarquica hacia sus unidades operativas.
- Unidad operativa/sucursal: operacion estrictamente contextual del restaurante.

## Comportamiento Implementado

- Login con ASP.NET Identity.
- JWT corto en cookie httpOnly.
- Claims minimos: `sub`, `sid`, `exp`.
- Sesion enriquecida en Redis bajo `session:{sid}`.
- Middleware de autenticacion de sesion.
- Middleware de contexto operacional.
- Endpoints base:
  - `POST /api/auth/login`
  - `GET /api/me`

## Decisiones Vigentes

- Los roles y claims de ASP.NET Identity no son la autorizacion principal de negocio.
- Identity se usa para identidad tecnica: usuario, password, seguridad base y login.
- La autorizacion de negocio vive en:
  - `roles_inquilino`
  - `permisos_inquilino`
  - `asignaciones_inquilino`
  - `roles_restaurante`
  - `permisos_restaurante`
  - `asignaciones_restaurante`
  - `roles_operativos`
  - `permisos_operativos`
  - `asignaciones_operativas`
- El JWT no debe cargar permisos completos.
- Redis carga la sesion enriquecida para no recalcular permisos en cada request.
- Los controllers no leen claims ni headers directamente; consumen contexto inyectado.

## Criterios De Aceptacion Actuales

- [x] Login devuelve sesion valida.
- [x] `/api/me` devuelve identidad, tenant activo, unidad operativa activa y permisos efectivos.
- [x] Frontend puede iniciar sesion y ver datos.
- [x] Deploy separado en Coolify puede levantar web, API, PostgreSQL, Redis y tunnel de app.

## Pendientes

- [ ] Formalizar roles/permisos de restaurante en migracion y seed final.
- [ ] Agregar endpoints CRUD reales para tenant/restaurantes/unidades con permisos.
- [ ] Crear tests de autorizacion por contexto.
- [ ] Definir versionado o invalidacion de permisos en Redis.
- [ ] Preparar RLS PostgreSQL sin activar reglas peligrosas antes de tiempo.

