# Research: CRM Y Mensajeria NORIX

## Resumen

Se revisaron cuatro referencias. Cada una aporta algo distinto:

- Forja: escalabilidad edge/event-driven.
- Vocero CRM: CRM WhatsApp con enfoque practico de producto.
- Inmox Community: specs, tenant scope e ingest robusto.
- wacrm: CRM WhatsApp completo con inbox, automations, broadcasts y API publica.

## Forja

Tomar:

- Mentalidad de escalabilidad desde el dia uno.
- Webhooks/eventos desacoplados.
- Edge o workers como posibilidad futura para canales publicos.
- Separar ingestion rapida de procesamiento pesado.

No tomar directo:

- Stack Cloudflare completo como base principal.
- Dependencia inicial de Vectorize/R2/Durable Objects para NORIX.

Traduccion NORIX:

- Crear un modulo futuro tipo `Norix.Edge.Messaging` solo si el volumen o la exposicion publica lo exige.
- Mantener la API principal en `.NET`.
- Procesar webhooks rapido, persistir evento y responder 200 antes de trabajos pesados.

## Vocero CRM

Tomar:

- Enfoque de inbox + CRM como producto real, no solo chat.
- Conversaciones ligadas a clientes/contactos.
- Handoff humano.
- Ideas de pipeline comercial si se adapta a restaurantes.

No tomar directo:

- Su estructura completa si no encaja con nuestro dominio.
- Un CRM generico sin contexto restaurante/sucursal.

Traduccion NORIX:

- El CRM debe entender restaurantes, sucursales, reservaciones, pedidos, quejas y seguimiento.
- Los agentes deben trabajar desde contexto NORIX, no desde una bandeja plana.

## Inmox Community

Tomar:

- Carpeta `specs/` como forma de trabajar.
- `organization_id` / tenant scope aplicado de forma consistente.
- Ingest idempotente.
- Crear contacto/conversacion si no existen.
- Procesamiento posterior al webhook.
- IA usando contexto desde PostgreSQL antes de pensar en vector DB.
- Validar acciones sugeridas por IA del lado servidor.

No tomar directo:

- Dominio inmobiliario.
- Modelo de propiedades/candidaturas salvo como inspiracion estructural.

Traduccion NORIX:

- Usar specs por modulo.
- Para IA futura, empezar con contexto relacional: cliente, historial, sucursal, pedidos, preferencias y politicas.
- Vector DB no es requisito inicial.

## wacrm

Tomar:

- Inbox compartido.
- Contactos con tags y campos personalizados.
- Conversaciones con asignacion, status y notas.
- Broadcasts con plantillas aprobadas por Meta.
- Automatizaciones con triggers, waits, condiciones y logs.
- API publica con keys hasheadas, scopes y revocacion.
- Webhooks HMAC verificados.
- Tokens cifrados en reposo.
- Rate limiting.

No tomar directo:

- Stack Next.js + Supabase como base.
- Modelo "un numero WhatsApp = un usuario" como regla NORIX.
- Cuenta compartida para multiples agentes.

Traduccion NORIX:

- Un canal WhatsApp debe poder pertenecer a tenant, restaurante o sucursal segun configuracion.
- Multiples usuarios/agentes deben poder operar un inbox con permisos reales.
- Las API keys deben tener scopes y contexto.
- Las automatizaciones deben validar ownership antes de modificar contactos/conversaciones.

## Conclusion

NORIX debe construir su propio modulo CRM/mensajeria con:

- Ingestion robusta estilo Inmox/Forja.
- UX/funcionalidad CRM estilo wacrm/Vocero.
- Seguridad contextual propia de NORIX.
- Specs antes de implementar.

