# Retro: Self Improving Loop

## Resultado

Se creo una estructura ligera de specs para que el proyecto deje de depender de una sola bitacora enorme.

## Aprendizajes

- La bitacora historica sigue siendo util para rastrear como llegamos aqui.
- Las specs deben ser pequenas y orientadas a modulo para que puedan guiar implementacion real.
- El loop tiene que aceptar retroalimentacion: si al construir descubrimos algo mejor, la spec cambia.

## Pendientes Nuevos

- Crear specs separadas para frontend/UX, despliegue y modulos operativos.

## 2026-07-28

Cambios:

- Se definieron estados canonicos para specs.
- Se agrego Definition of Done por tipo de cambio.
- Se definio cuando una decision del chat debe pasar a spec.
- Se agrego `decisions.md` del propio loop.
- Se creo `specs/backlog.md` como estacionamiento de ideas no aterrizadas.

Errores:

- El loop estaba documentado como intencion, pero le faltaban reglas operables para cerrar tareas.

Arreglos:

- Se actualizaron `spec.md`, `tasks.md` y `README.md`.

Verificacion:

- Revision manual de estructura `specs/`.

Siguiente:

- Usar este loop en el proximo modulo nuevo y evitar que las decisiones relevantes queden solo en conversacion.

## 2026-07-28 - Refactor CRUD/Recurso

Cambios:

- Se extrajeron componentes compartidos de frontend para topbar, cards, campos, filas de informacion y paneles placeholder.
- Se movio la logica de entidades fiscales a `FiscalEntitiesService`.

Errores:

- El CRUD de entidades fiscales empezo a duplicar patrones ya presentes en restaurantes.
- El endpoint tenia consulta, validacion y persistencia directa.

Arreglos:

- Los endpoints de entidades fiscales quedan como adaptadores HTTP.
- Restaurantes y entidades fiscales comparten piezas visuales pequenas sin crear una abstraccion grande.

Verificacion:

- `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj`.
- `npm.cmd run build` en `Norix.App`.

Siguiente:

- Repetir este criterio cuando el siguiente CRUD empiece a duplicar la tercera variante del mismo patron.
