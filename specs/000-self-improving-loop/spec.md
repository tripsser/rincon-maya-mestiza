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

## Reglas

- No meter decisiones nuevas solo en chat si afectan arquitectura. Deben quedar en la spec correspondiente.
- No agrandar `IMPLEMENTACION_MULTITENANT.md` con detalles nuevos de modulos; usar `specs/`.
- Cada spec debe tener estado: `Borrador`, `Aprobada`, `En implementacion`, `Implementada`, `Pausada` o `Replanteada`.
- Si una implementacion contradice la spec, se actualiza la spec o se corrige la implementacion.
- Cada modulo nuevo debe iniciar con lo minimo: `spec.md`, `plan.md`, `tasks.md` y `retro.md`.

## Criterios De Aceptacion

- [x] Existe carpeta `specs/`.
- [x] Existe plantilla reusable.
- [x] Existe una spec del propio loop.
- [x] Existe una spec inicial para multitenant auth/context.
- [ ] Migrar gradualmente decisiones grandes desde `IMPLEMENTACION_MULTITENANT.md`.

