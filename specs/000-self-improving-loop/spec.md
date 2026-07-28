# Spec: Self Improving Loop

## Estado

Activo

## Objetivo

Crear un ciclo de trabajo para que NORIX mejore por iteraciones: cada cambio deja especificacion, implementacion, validacion y aprendizaje.

## Problema

La documentacion actual esta concentrada en `IMPLEMENTACION_MULTITENANT.md`. Sirvio para avanzar rapido, pero ya mezcla bitacora, arquitectura, decisiones, errores, UX, despliegue y pendientes. Eso hace dificil saber que esta aprobado, que esta pendiente y que aprendimos.

## Principio

NORIX se construye como producto por recursos y contextos. Cada modulo debe poder explicar:

- Que recurso administra.
- En que contexto vive: tenant, restaurante/marca, unidad operativa o plataforma.
- Que permisos requiere.
- Que datos persiste.
- Que endpoints expone.
- Como se valida.
- Que aprendimos al implementarlo.

## Loop

1. Spec: definir comportamiento, reglas y alcance.
2. Plan: aterrizar arquitectura y pasos.
3. Tasks: convertir el plan en trabajo ejecutable.
4. Implementacion: hacer cambios pequenos y verificables.
5. Verificacion: build, lint, pruebas, migraciones o screenshots.
6. Retro: registrar errores, arreglos y deuda.
7. Ajuste: actualizar la spec si cambio la verdad del sistema.

## Estados Canonicos

Cada spec debe usar uno de estos estados:

- `Borrador`: idea aun incompleta.
- `Aterrizada`: alcance claro, lista para planear o implementar.
- `En implementacion`: se esta tocando codigo, scripts, docs o infraestructura.
- `Implementada`: cambio hecho y verificado tecnicamente.
- `Validada`: usuario/proceso confirmo que funciona en el flujo real.
- `Pausada`: detenida por decision consciente.
- `Replanteada`: la direccion cambio y requiere nueva definicion.
- `Congelada`: estable; solo se modifica con decision explicita.

Transiciones recomendadas:

- `Borrador` -> `Aterrizada` cuando el alcance y no-alcance esten claros.
- `Aterrizada` -> `En implementacion` cuando se empiece a ejecutar.
- `En implementacion` -> `Implementada` cuando pasen checks tecnicos.
- `Implementada` -> `Validada` cuando el usuario o flujo real lo confirme.
- Cualquier estado -> `Replanteada` si cambia la premisa principal.
- Cualquier estado -> `Pausada` si se decide esperar.

## Reglas

- No meter decisiones nuevas solo en chat si afectan arquitectura. Deben quedar en la spec correspondiente.
- No agrandar `IMPLEMENTACION_MULTITENANT.md` con detalles nuevos de modulos; usar `specs/`.
- Cada spec debe tener estado canonico.
- Si una implementacion contradice la spec, se actualiza la spec o se corrige la implementacion.
- Cada modulo nuevo debe iniciar con lo minimo: `spec.md`, `plan.md`, `tasks.md` y `retro.md`.
- No crear una spec nueva si ya existe una cercana; primero actualizar la existente.
- Las decisiones que cambian contratos, arquitectura o forma de operar deben registrarse en `decisions.md`.

## Cuando Documentar

Una decision pasa del chat a spec si afecta alguno de estos puntos:

- Modelo de datos, migraciones, scripts, seed o truncate.
- Contratos API, DTOs, rutas, codigos de error o headers.
- Autenticacion, autorizacion, permisos, scopes o contexto.
- Infraestructura, compose, deploy, dominios, tunnel, backups o secretos.
- UX canonica, navegacion, layout, tablas, drawers, temas o responsive.
- Reglas de negocio que impactan historico, auditoria, soft delete o folios/codigos.
- Integraciones externas como n8n, Cloudflare, WhatsApp, impresoras o agentes locales.

Si es solo un ajuste local obvio, puede quedar en `tasks.md` o `retro.md` sin decision formal.

## Definition Of Done

Backend:

- `dotnet build RestauranteSaaS.Api/RestauranteSaaS.Api.csproj` pasa si se toca API.
- Endpoint, request, response y errores quedan en spec o `api-contract.md` si aplica.
- La logica importante no queda escondida en controllers/endpoints si requiere dominio/servicio.

Frontend:

- `npm.cmd run build` pasa si se toca `Norix.App`.
- UX relevante queda en `ux.md` o spec.
- Estados de loading, vacio y error se consideran cuando aplique.

Base de datos:

- Scripts SQL, seed y truncate se actualizan si cambia el esquema manual.
- Migraciones se generan/aplican solo cuando el usuario lo pida o confirme.
- Cambios de nombres/constraints se documentan.

Infraestructura:

- Compose/config se valida cuando cambie deploy.
- Docs de deploy se actualizan si cambia el flujo real.
- No se documentan secretos reales.

Cierre:

- `tasks.md` refleja lo hecho y lo pendiente.
- `decisions.md` registra decisiones relevantes.
- `retro.md` registra errores, arreglos y aprendizajes importantes.
- Commit/push solo se hace cuando el usuario lo pida.

## Plantilla De Decision

```md
### YYYY-MM-DD - Titulo

Decision:

Motivo:

Alternativas consideradas:

Impacto:

Pendientes:
```

## Plantilla De Retro

```md
## YYYY-MM-DD

Cambios:

Errores:

Arreglos:

Verificacion:

Siguiente:
```

## Criterios De Aceptacion

- [x] Existe carpeta `specs/`.
- [x] Existe plantilla reusable.
- [x] Existe una spec del propio loop.
- [x] Existe una spec inicial para multitenant auth/context.
- [x] Estados canonicos definidos.
- [x] Regla de cuando documentar definida.
- [x] Definition of Done definida.
- [x] Plantillas de decision y retro definidas.
- [ ] Migrar gradualmente decisiones grandes desde `IMPLEMENTACION_MULTITENANT.md`.
