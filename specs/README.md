# NORIX Specs

Esta carpeta es la fuente viva para disenar, construir y corregir NORIX por modulos.

`IMPLEMENTACION_MULTITENANT.md` queda como bitacora historica grande. Las decisiones nuevas deben aterrizar aqui en specs pequenas, revisables y listas para implementarse.

## Loop De Trabajo

1. Descubrir: entender el problema, usuarios, restricciones y ejemplos reales.
2. Especificar: escribir que debe pasar, que no debe pasar y como se valida.
3. Aterrizar arquitectura: modelo de datos, API, UX, autorizacion, integraciones y riesgos.
4. Planear tareas: partir el cambio en pasos pequenos con criterios de aceptacion.
5. Implementar: tocar codigo solo contra una spec aprobada o razonablemente clara.
6. Verificar: build, lint, pruebas, screenshots o validacion manual segun aplique.
7. Aprender: documentar errores, ajustes, deuda tecnica y decisiones nuevas.
8. Actualizar specs: si la implementacion ensena algo, la spec se corrige.

## Convencion

Cada spec vive en una carpeta numerada:

`NNN-nombre-del-modulo/`

Archivos recomendados:

- `spec.md`: comportamiento esperado y alcance.
- `plan.md`: arquitectura y pasos de implementacion.
- `data-model.md`: tablas, entidades, indices y reglas.
- `api-contract.md`: endpoints, requests, responses y errores.
- `ux.md`: flujos, vistas, estados y decisiones visuales.
- `tasks.md`: checklist ejecutable.
- `decisions.md`: decisiones tomadas y alternativas descartadas.
- `retro.md`: aprendizajes despues de implementar.

No todos los archivos son obligatorios para cada spec. Si el cambio es chico, se puede usar solo `spec.md`, `tasks.md` y `retro.md`.

## Estados Canonicos

- `Borrador`
- `Aterrizada`
- `En implementacion`
- `Implementada`
- `Validada`
- `Pausada`
- `Replanteada`
- `Congelada`

Los detalles de transicion, DoD y regla de documentacion viven en `000-self-improving-loop`.

## Estado Inicial

- `000-self-improving-loop`: define como vamos a trabajar.
- `001-multitenant-auth-context`: resume el slice ya implementado y deja pendientes reales.
- `002-portal-contextual-ux`: documenta el portal unico, rails jerarquicos, responsive y decisiones visuales.
- `003-coolify-cloudflare-deployment`: documenta el despliegue separado con Coolify y Cloudflare Tunnel.
- `004-tablas-colecciones-norix`: define el patron canonico para tablas, colecciones, estados y drawers.
- `008-crm-mensajeria`: aterriza lo mejor de Forja, Vocero CRM, Inmox Community y wacrm para un modulo CRM/mensajeria propio.
- `009-codigos-humanos-entidades`: define como generar codigos humanos de negocio sin captura manual.
- `010-crud-entidades-fiscales`: CRUD de entidades fiscales del tenant con tabla y drawer.
- `011-accesibilidad-frontend`: baseline de accesibilidad para foco, dialogs, tabs, labels y navegacion.
- `backlog.md`: ideas aun no aterrizadas como specs ejecutables.

## Specs Pendientes Sugeridas

- `005-print-jobs-local-agent`: trabajos de impresion, agente Windows, spooler, TCP/ESC/POS y estados.
- `006-productos-menus-categorias`: catalogo, menus, categorias y areas de preparacion.
- `007-operacion-comandas`: comandas, detalles, mesas, cocina y flujo operativo.
