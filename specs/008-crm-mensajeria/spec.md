# Spec: CRM Y Mensajeria NORIX

## Estado

Borrador / Investigacion aterrizada

## Objetivo

Definir el modulo futuro de CRM, mensajeria e inbox omnicanal de NORIX tomando lo mejor de las referencias revisadas, sin copiar una arquitectura que no encaje con nuestro producto.

## Referencias Revisadas

- `santmun/forja`
- `kevinrivm/vocero-crm`
- `inmox-community`
- `ArnasDon/wacrm`

## Decision Principal

NORIX no adoptara completo ninguno de los repos revisados. Se tomaran patrones de producto y arquitectura, pero la implementacion debe vivir en nuestra base:

- Backend `.NET 9`.
- PostgreSQL propio.
- Redis para sesion/cache/jobs cuando aplique.
- Frontend Vite React.
- Contexto jerarquico NORIX: tenant, restaurante/marca y unidad operativa/sucursal.
- Autorizacion propia por permisos de tenant/restaurante/operacion.

## Que Debe Resolver

El modulo CRM/mensajeria debe permitir:

- Capturar conversaciones de WhatsApp.
- Asignar conversaciones a usuarios/empleados.
- Ver historial de mensajes por contacto.
- Identificar clientes/contactos.
- Crear notas internas.
- Etiquetar conversaciones/contactos.
- Enviar mensajes libres dentro de ventana permitida.
- Enviar plantillas aprobadas fuera de ventana.
- Hacer broadcasts controlados.
- Automatizar respuestas y acciones.
- Registrar logs de automatizacion.
- Evitar duplicados por webhook.
- Validar ownership por contexto en cada accion.

## Contexto NORIX

Un restaurante puede necesitar CRM en varios alcances:

- Tenant: supervision global de clientes/conversaciones de todas las marcas.
- Restaurante/marca: gestion comercial y reputacion de una marca.
- Unidad operativa/sucursal: atencion operacional local, reservas, pedidos, quejas o seguimiento.

La autorizacion debe decidir que conversaciones puede ver cada usuario segun su scope.

## Riesgo Critico

Este modulo tiene alto riesgo de fuga de datos entre tenants/sucursales si se aceptan ids enviados por cliente sin validar ownership.

Regla obligatoria:

- Todo endpoint que reciba `id_contacto`, `id_conversacion`, `id_mensaje`, `id_automatizacion`, `id_broadcast` o similares debe validar que el recurso pertenece al contexto autorizado antes de leer o escribir.

## Criterios De Aceptacion Iniciales

- [ ] Existe modelo de datos base.
- [ ] Existe contrato de webhook inbound.
- [ ] Existe estrategia de idempotencia.
- [ ] Existe estrategia de asignacion.
- [ ] Existe estrategia de permisos por contexto.
- [ ] Existe estrategia de templates/broadcasts.
- [ ] Existe estrategia de automatizaciones.
- [ ] Existe UX de inbox base.

