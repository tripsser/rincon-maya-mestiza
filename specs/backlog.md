# NORIX Backlog

Ideas y modulos que aun no estan listos para implementacion directa. Cuando un item tenga alcance claro, se crea o actualiza su spec.

## Plataforma Y Dev Loop

- Automatizar reportes de cambios con n8n.
- Avisos de deploy fallido desde Coolify.
- Resumen diario de specs/tasks pendientes.
- Validacion automatica de specs incompletas.

## Operacion Restaurante

- `005-print-jobs-local-agent`: trabajos de impresion, agente Windows, spooler, TCP/ESC/POS y estados.
- `006-productos-menus-categorias`: catalogo, menus, categorias, productos y areas de preparacion.
- `007-operacion-comandas`: comandas, detalles, mesas, cocina, caja y pagos.
- Inventario tecnologico y activos por unidad operativa.
- Dispositivos operativos: impresoras, lectores NFC, lectores de barras, huella, cajas registradoras.

## CRM, Mensajeria Y Bots

- CRM WhatsApp/mensajeria propio basado en lo rescatado de Forja, Vocero CRM, Inmox Community y wacrm.
- Bots/agentes de producto para atencion, reservas, pedidos y soporte.
- Bandeja omnicanal por tenant/restaurante/unidad operativa.
- Automatizaciones de mensajeria con logs y trazabilidad.

## UX Y Producto

- Temas visuales: solido/glass y dark/light.
- Homologacion completa de tablas/colecciones.
- Launcher global tipo Ctrl+K.
- Portales por contexto segun autorizacion: tenant, restaurante/marca y unidad operativa.

## Infraestructura

- Backups automaticos PostgreSQL.
- Estrategia de migraciones para produccion.
- Separacion de ambientes.
- Observabilidad basica: logs, health checks y alertas.
