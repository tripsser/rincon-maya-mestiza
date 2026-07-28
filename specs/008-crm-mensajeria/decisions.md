# Decisions: CRM Y Mensajeria NORIX

## Decisiones

### 2026-07-28 - No Copiar Repos Completos

Decision:

NORIX tomara patrones de los repos revisados, pero no integrara ninguno como base directa.

Motivo:

La arquitectura de NORIX ya esta definida con `.NET`, PostgreSQL, Redis, React/Vite y autorizacion jerarquica propia.

Consecuencia:

Las referencias sirven para producto, seguridad e ideas de flujo; la implementacion sera propia.

### 2026-07-28 - Seguridad Contextual Primero

Decision:

Todo recurso CRM/mensajeria debe validar ownership por contexto antes de operar.

Motivo:

Los CRMs multi-tenant tienen riesgo alto de fuga de datos cuando se aceptan ids arbitrarios desde cliente.

Consecuencia:

Ningun endpoint debe confiar solo en `id` recibido; siempre se filtra por tenant/restaurante/sucursal autorizado.

### 2026-07-28 - IA Sin Vector DB Inicial

Decision:

Si se agrega IA, primero usara contexto relacional desde PostgreSQL.

Motivo:

Para NORIX no se justifica iniciar con base vectorial si el problema inicial se resuelve con historial, cliente, sucursal, pedidos y reglas.

Consecuencia:

pgvector o vector DB queda como mejora posterior, no requisito base.

