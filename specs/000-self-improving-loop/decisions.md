# Decisions: Self Improving Loop

## Decisiones

### 2026-07-28 - Specs Como Fuente Operable

Decision:

Usar `specs/` como fuente viva para modulos, arquitectura, UX, deploy y aprendizaje. `IMPLEMENTACION_MULTITENANT.md` queda como bitacora historica.

Motivo:

La bitacora grande contiene contexto valioso, pero mezcla demasiados temas y ya no sirve como guia ejecutable para cada cambio.

Alternativas consideradas:

- Seguir usando solo `IMPLEMENTACION_MULTITENANT.md`.
- Crear documentacion dispersa por carpeta tecnica.

Impacto:

Cada cambio relevante debe actualizar la spec correspondiente. Las decisiones nuevas no deben vivir solo en chat.

Pendientes:

Migrar gradualmente decisiones grandes restantes hacia specs pequenas.

### 2026-07-28 - DoD Por Tipo De Cambio

Decision:

Definir Definition of Done por backend, frontend, base de datos e infraestructura.

Motivo:

NORIX ya toca varias capas a la vez. Sin DoD, un cambio puede quedar "funcionando" pero romper docs, seed, deploy o UX.

Alternativas consideradas:

- Usar solo build como validacion.
- Validar manualmente sin checklist.

Impacto:

Cada cierre de tarea debe mencionar los checks relevantes y actualizar specs cuando aplique.

Pendientes:

Agregar checks automatizados mas adelante cuando existan pruebas.
