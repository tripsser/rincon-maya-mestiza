# Data Model: CRM Y Mensajeria NORIX

## Entidades Candidatas

### canales_mensajeria

Representa una conexion externa, inicialmente WhatsApp Cloud API.

Campos candidatos:

- `id`
- `id_inquilino`
- `id_restaurante`
- `id_unidad_operativa`
- `tipo`
- `nombre`
- `telefono`
- `phone_number_id`
- `waba_id`
- `access_token_encriptado`
- `activo`
- `creado_en`
- `actualizado_en`

Regla:

- El canal puede estar ligado a tenant, restaurante o unidad operativa, pero se debe definir una regla clara para no mezclar scopes ambiguos.

### contactos

Representa una persona/cliente potencial.

Campos candidatos:

- `id`
- `id_inquilino`
- `codigo`
- `nombre`
- `telefono`
- `email`
- `notas`
- `creado_en`
- `actualizado_en`

### conversaciones

Representa un hilo con un contacto dentro de un canal/contexto.

Campos candidatos:

- `id`
- `id_inquilino`
- `id_canal_mensajeria`
- `id_contacto`
- `id_usuario_asignado`
- `estado`
- `ultimo_mensaje_en`
- `creado_en`
- `actualizado_en`

### mensajes

Representa mensajes inbound/outbound.

Campos candidatos:

- `id`
- `id_conversacion`
- `direccion`
- `tipo`
- `contenido_texto`
- `payload_json`
- `external_message_id`
- `estado_entrega`
- `enviado_en`
- `recibido_en`
- `creado_en`

Indice unico:

- `UNIQUE (id_canal_mensajeria, external_message_id)`

### etiquetas_contacto

Tags reutilizables por tenant.

### contactos_etiquetas

Relacion muchos a muchos entre contactos y etiquetas.

### notas_conversacion

Notas internas de agentes.

### plantillas_mensajeria

Plantillas aprobadas por proveedor.

### broadcasts

Campanas de envio masivo controlado.

### broadcasts_destinatarios

Destinatarios y estado por contacto.

### automatizaciones_mensajeria

Automatizaciones por triggers.

### automatizaciones_mensajeria_logs

Historial de ejecucion y errores.

### api_keys_integracion

Llaves para API publica o integraciones externas.

Campos obligatorios:

- hash de llave, nunca guardar llave en claro.
- scopes.
- contexto.
- revocada_en.

## Pendientes De Modelo

- Definir si `contactos` se conecta con `clientes` existente o si se fusionan.
- Definir scope exacto de `canales_mensajeria`.
- Definir ownership de conversaciones por restaurante/sucursal.
- Definir storage para medios.

