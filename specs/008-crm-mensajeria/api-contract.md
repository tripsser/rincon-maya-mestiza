# API Contract: CRM Y Mensajeria NORIX

## Webhook Inbound

### POST /api/messaging/whatsapp/webhook

Responsabilidades:

- Verificar firma HMAC del proveedor.
- Validar canal.
- Persistir evento/mensaje de forma idempotente.
- Crear contacto/conversacion si aplica.
- Responder rapido para evitar reintentos innecesarios.
- Encolar procesamiento posterior.

Errores:

- `401`: firma invalida.
- `404`: canal no configurado.
- `409`: evento duplicado ya procesado, si se decide reportar.

## Inbox

### GET /api/crm/conversations

Debe filtrar por contexto activo:

- tenant
- restaurante/marca
- unidad operativa/sucursal

### GET /api/crm/conversations/{id}

Debe validar ownership antes de devolver datos.

### POST /api/crm/conversations/{id}/messages

Debe validar:

- usuario autenticado.
- contexto autorizado.
- ventana de WhatsApp si es mensaje libre.
- template aprobado si esta fuera de ventana.
- rate limit.

## Assignments

### POST /api/crm/conversations/{id}/assign

Asignar conversacion a usuario/agente.

Regla:

- El asignado debe tener acceso al contexto de la conversacion.

## Public API Futura

Las API keys deben:

- Guardarse hasheadas.
- Tener scopes explicitos.
- Ser revocables.
- Estar amarradas a tenant/restaurante/sucursal.
- Tener rate limiting.

Scopes candidatos:

- `conversations:read`
- `messages:send`
- `messages:read`
- `contacts:read`
- `contacts:write`
- `broadcasts:send`
- `webhooks:manage`

