# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

El usuario principal es el dueno o administrador de restaurantes y marcas restauranteras. Trabaja sobre una operacion que puede tener uno o varios restaurantes, varias sucursales, usuarios administrativos y personal operativo.

Audiencias secundarias confirmadas por el proyecto:
- Administradores de marca/restaurante que gestionan catalogo, sucursales, usuarios y permisos de su marca.
- Administradores o gerentes de sucursal que operan bajo contexto de unidad operativa.
- Personal operativo que eventualmente usara flujos como mesas, comandas, cocina, caja, clientes y dispositivos.

## Product Purpose

NORIX es un sistema operativo para restaurantes: una plataforma ERP/CRM restaurantera para administrar y operar negocios multiinquilino, multimarca y multisucursal desde un solo portal.

El producto debe permitir administrar estructura, acceso, usuarios, permisos, restaurantes, unidades operativas, entidades fiscales, catalogos, operacion diaria, dispositivos y automatizaciones sin partir la experiencia en sistemas separados.

El exito del producto significa que el usuario entiende rapidamente en que contexto esta trabajando, que puede administrar desde ahi, y que la operacion se mantiene ordenada aunque el negocio crezca.

## Positioning

NORIX se posiciona como el sistema operativo restaurantero que organiza tenant, marca/restaurante y sucursal como recursos jerarquicos dentro de un solo portal.

Su mecanismo diferencial es el contexto de trabajo: la aplicacion no debe sentirse como muchos portales separados, sino como una sola plataforma donde el menu, permisos y datos cambian segun el recurso activo.

El modelo toma inspiracion conceptual de Azure/Entra: el usuario navega recursos y contextos, no aplicaciones aisladas.

## Operating Context

El producto opera en restaurantes reales con necesidades administrativas y operativas:
- Administracion de inquilino, usuarios, roles, permisos y asignaciones.
- Administracion de restaurantes/marcas, sucursales/unidades operativas, entidades fiscales y direcciones.
- Operacion futura de mesas, comandas, cocina, caja, pagos, clientes, inventario y dispositivos.
- Integracion futura con agentes locales, impresoras, lectores NFC, lectores de huella, computadoras, cajas registradoras y lectores de barras.
- Sesiones distribuidas con JWT corto, cookie httpOnly, Redis y contexto por headers para tenant y unidad operativa.

## Capabilities and Constraints

Capacidades confirmadas:
- SaaS multi-tenant para restaurantes.
- Identity como base de usuarios.
- Autorizacion separada por niveles: tenant, marca/restaurante y unidad operativa.
- Contexto de trabajo jerarquico y rails de navegacion.
- Frontend separado en Vite/React.
- Backend en .NET 9, ASP.NET Core, EF Core, PostgreSQL, Redis y JWT.
- Despliegue preparado con Docker Compose/Coolify.

Restricciones y decisiones abiertas:
- El diseno visual definitivo aun no esta aterrizado.
- Los colores de marca NORIX son obligatorios.
- La landing puede inspirarse en referencias externas por composicion y ritmo, pero no debe copiar su identidad visual.
- No usar blanco dominante como identidad principal de NORIX.
- No inventar clientes, cifras comerciales, testimonios o evidencia no confirmada.

## Brand Commitments

Nombre del producto: NORIX SaaS.

Claim de trabajo: el sistema operativo para restaurantes.

Identidad confirmada:
- Azul profundo NORIX como base.
- Grafito oscuro como soporte.
- Verde NORIX, azul NORIX y violeta como acentos.
- Tipografia base observada en la marca: DM Sans.
- Tono corporativo, serio, robusto y tecnologico.

Referencias confirmadas:
- Azure/Entra para filosofia de portal contextual y navegacion por recursos.
- QuantumFlux como referencia de composicion editorial, bloques grandes y energia visual, no como paleta ni identidad.

## Evidence on Hand

Activos y contexto disponibles:
- Imagen de identidad NORIX compartida por el usuario en el hilo.
- Implementacion frontend existente en `Norix.App`.
- Implementacion backend existente en `RestauranteSaaS.Api`.
- Documentacion viva en `IMPLEMENTACION_MULTITENANT.md`.
- Scripts SQL en `scripts/` y raiz.
- Landing actual en `Norix.App/src/features/marketing/pages/LandingPage.tsx`.

Ausencias importantes:
- No hay testimonios reales confirmados.
- No hay cifras comerciales reales confirmadas.
- No hay version final aprobada del sistema visual de landing.

## Product Principles

1. Un solo portal, muchos contextos.
2. La autorizacion debe explicar la interfaz, no esconderse detras de ella.
3. La jerarquia tenant, marca y sucursal debe sentirse natural para usuarios restauranteros.
4. La operacion real pesa mas que una demo bonita.
5. El sistema debe crecer sin obligar al usuario a reaprender la plataforma.

## Accessibility & Inclusion

El producto es una aplicacion web operativa. Debe sostener navegacion con teclado, foco visible, contraste suficiente, estados claros y comportamiento responsivo para escritorio, tablet y movil.
