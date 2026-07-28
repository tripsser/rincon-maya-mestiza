# Spec: Accesibilidad Frontend

## Estado

En implementacion.

## Objetivo

Crear un baseline de accesibilidad para `Norix.App` sin cambiar la identidad visual aprobada.

## Alcance Inicial

- Foco visible global para teclado.
- Landmarks y metadatos HTML correctos.
- Drawers con semantica de dialogo.
- Tabs con semantica accesible.
- Botones icon-only con nombre accesible.
- Tooltips accesibles en rails contraidos.
- Estados de error/carga con `aria-live` cuando aplique.

## Fuera De Alcance Por Ahora

- Auditoria WCAG completa.
- Pruebas automatizadas con axe/playwright.
- Rediseño completo de contraste.
- Navegacion avanzada por teclado en tablas.

## Criterios De Aceptacion

- El sitio declara idioma correcto.
- Los elementos interactivos tienen foco visible.
- Los drawers anuncian titulo y comportamiento de dialogo.
- Las tabs anuncian estado seleccionado.
- Los controles icon-only tienen `aria-label`.
- El build del frontend pasa.
