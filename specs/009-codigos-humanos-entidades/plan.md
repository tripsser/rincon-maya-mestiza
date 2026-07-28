# Plan: Codigos Humanos De Entidades

## Estrategia

1. Definir prefijos por entidad.
2. Definir scope por entidad.
3. Crear tabla `consecutivos_codigos`.
4. Crear servicio backend `ICodigoEntidadService`.
5. Generar codigos dentro del caso de uso de creacion.
6. Ajustar formularios para no pedir codigo manual por default.
7. Mostrar codigo en tablas y headers de recurso.

## Backend

Servicio candidato:

```csharp
public interface ICodigoEntidadService
{
    Task<string> GenerarAsync(
        string entidad,
        string scopeTipo,
        Guid? idScope,
        CancellationToken cancellationToken);
}
```

## Frontend

Reglas:

- Formularios de creacion no muestran campo codigo por default.
- Si se muestra, debe ser readonly como previsualizacion.
- Edicion manual queda detras de permiso administrativo.

## Validacion

- Prueba de creacion concurrente.
- Prueba de unique por scope.
- Prueba de busqueda por codigo.
- Prueba de que cambiar nombre no cambia codigo.

