# Plan: Multitenant Auth Context

## Arquitectura Actual

Backend:

- ASP.NET Core 9 Web API.
- ASP.NET Identity sobre `AspNetUsers`.
- EF Core con PostgreSQL.
- Redis con StackExchange.Redis.
- JWT en cookie para sesion corta.

Frontend:

- Vite + React + TypeScript.
- Zustand para estado local de sesion/contexto.
- TanStack Query para datos remotos.
- React Router por contextos.

Infraestructura:

- Docker Compose para Coolify.
- Servicios separados: `web`, `api`, `postgres`, `redis`.
- Cloudflare Tunnel vive en el host y entra por el proxy de Coolify.

## Direccion

La API debe evolucionar a arquitectura por features sin meter logica de negocio en controllers. El frontend tambien debe mantenerse por features para evitar que el layout, estilos, estado y llamadas API queden mezclados.

## Validacion

- `dotnet build RestauranteSaaS.Api/RestauranteSaaS.Api.csproj`
- `npm run build` en `Norix.App`
- Prueba manual de login y `/api/me`
- Prueba manual de contexto con headers:
  - `X-Tenant-Id`
  - `X-Restaurant-Id`
  - `X-Operational-Unit-Id`

## Riesgos

- Sesiones en Redis pueden quedar desactualizadas si cambian permisos.
- La jerarquia tenant/restaurante/unidad puede confundirse si una pantalla mezcla scopes.
- RLS debe entrar despues de estabilizar contratos de contexto.
