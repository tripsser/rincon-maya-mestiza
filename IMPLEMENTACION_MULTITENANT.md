# Implementacion multitenant

## Objetivo

Implementar el primer slice funcional de autenticacion, sesion distribuida y contexto operativo para el SaaS multi-tenant de restaurantes.

## Bitacora

### 2026-07-16

- Se confirmo que el workspace actual contiene scripts SQL, pero no un proyecto .NET.
- Se iniciara la implementacion creando un proyecto ASP.NET Core Web API en este workspace.
- El esquema base real para esta iteracion es `entidades_multitenant.sql`.
- Decisiones confirmadas:
  - JWT minimo con `sub`, `sid` y `exp`.
  - JWT enviado en cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
  - Sesion enriquecida en Redis bajo `session:{sid}`.
  - Permisos calculados al login.
  - `RefreshSessionAsync` preparado, sin versionado de permisos en esta iteracion.
  - Sin refresh tokens en este slice.
  - Headers de contexto: `X-Tenant-Id` y `X-Operational-Unit-Id`.
  - Denegaciones directas (`permitido = false`) ganan sobre permisos por rol.
  - RLS queda preparado, sin policies completas todavia.
- Se creo el proyecto `RestauranteSaaS.Api` con ASP.NET Core Web API en .NET 9.
- Error encontrado: el primer `dotnet restore` fallo porque el sandbox no tenia acceso a NuGet.
- Arreglo: se ejecuto `dotnet restore` con acceso a red autorizado y los paquetes quedaron restaurados.
- Se agregaron paquetes para JWT Bearer, Identity EF Core, EF Core Design, Npgsql y StackExchange.Redis.
- Se agrego estructura inicial por capas:
  - `Domain/Entities`
  - `Application/Abstractions`
  - `Application/Auth`
  - `Application/Sessions`
  - `Infrastructure/Auth`
  - `Infrastructure/Persistence`
  - `Middleware`
  - `Features/Auth`
  - `Features/Me`
- Se mapearon entidades minimas contra el esquema real de `entidades_multitenant.sql`.
- Se implemento `AppDbContext` con Identity sobre `AspNetUsers` y tablas de autorizacion de inquilino/operacion.
- Se implementaron modelos de sesion para Redis con permisos permitidos y denegados.
- Se implemento `SessionService` para crear, obtener, refrescar y revocar sesiones.
- Se implemento `JwtTokenService` con JWT minimo: `sub`, `sid`, `exp`.
- Se implementaron `SessionAuthenticationMiddleware` y `OperationalContextMiddleware`.
- Se implementaron endpoints:
  - `POST /api/auth/login`
  - `GET /api/me`
- Se agrego configuracion base para PostgreSQL, Redis, JWT y sesion.
- Error encontrado: `SessionOptions` chocaba con `Microsoft.AspNetCore.Builder.SessionOptions`.
- Arreglo: se renombro la clase propia a `DistributedSessionOptions`.
- Validacion: `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj` compilo correctamente sin warnings ni errores.

### 2026-07-17

- Se inicio soporte de migraciones EF Core para que el esquema pueda avanzar y regresar por historial.
- Se detecto que el modelo EF estaba incompleto para generar una migracion inicial fiel al script `entidades_multitenant.sql`.
- Se agregaron entidades faltantes:
  - `Restaurante`
  - `EntidadFiscal`
  - `Direccion`
  - `Cliente`
- Se completo el mapeo EF con:
  - defaults `gen_random_uuid()`
  - extension PostgreSQL `pgcrypto`
  - longitudes de columnas principales
  - columnas `date` para fechas de asignacion/apertura
  - unique indexes
  - indexes de busqueda
  - foreign keys con nombres cercanos al script SQL
  - check constraint de estado en `inquilinos`
- Error encontrado: `dotnet ef` ensuciaba `project.assets.json` por falta de acceso a NuGet durante metadata/build interno.
- Arreglo: se ejecuto `dotnet restore --force --no-cache` con acceso a red y luego `dotnet ef migrations add`.
- Se creo la migracion inicial:
  - `RestauranteSaaS.Api/Infrastructure/Persistence/Migrations/20260717061703_InitialMultitenant.cs`
  - `RestauranteSaaS.Api/Infrastructure/Persistence/Migrations/20260717061703_InitialMultitenant.Designer.cs`
  - `RestauranteSaaS.Api/Infrastructure/Persistence/Migrations/AppDbContextModelSnapshot.cs`
- Error encontrado al aplicar migracion: el tooling intento escribir logs en Windows EventLog y el sandbox no tiene permisos.
- Arreglo: `Program.cs` ahora configura logging en `Console` y `Debug`, sin EventLog.
- Error actual al aplicar migracion: PostgreSQL rechazo la conexion por password incorrecto para usuario `postgres`.
  - Database: `restaurante_saas`
  - Server: `localhost:5432`
  - Usuario: `postgres`
  - Codigo Postgres: `28P01`
- Validacion: despues de los cambios, `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj` compila correctamente sin warnings ni errores.
- Se creo el script de seed inicial:
  - `seed inicial entidades_multitenant.sql`
- El seed incluye datos minimos para probar login, sesion Redis y contexto operativo:
  - Usuario Identity
  - Inquilino
  - Rol y permisos de inquilino
  - Asignacion de inquilino
  - Restaurante
  - Entidad fiscal
  - Direccion
  - Unidad operativa
  - Empleado
  - Rol y permisos operativos
  - Asignacion operativa
- Credenciales del seed:
  - Email: `admin@rinconmaya.test`
  - Password: `Admin123!`
- Se regenero el `PasswordHash` del usuario seed usando `PasswordHasher` oficial de ASP.NET Identity y se verifico con resultado `Success`.
- IDs utiles del seed:
  - `id_usuario`: `10000000-0000-0000-0000-000000000001`
  - `id_inquilino`: `20000000-0000-0000-0000-000000000001`
  - `id_unidad_operativa`: `33000000-0000-0000-0000-000000000001`
- Se agrego una interfaz web minima servida por la API:
  - `/` muestra login.
  - `/me.html` muestra identidad, contexto y permisos efectivos.
- Para facilitar pruebas locales por HTTP, la cookie `access_token` mantiene `Secure = true` fuera de Development, pero en Development se emite sin `Secure`.
- Error de validacion encontrado: no se pudo compilar sobre `bin/Debug` porque la API estaba corriendo y Windows tenia bloqueado `RestauranteSaaS.Api.exe`/`.dll`.
- Arreglo de validacion: se compilo hacia `.build-check/RestauranteSaaS.Api` y el build fue exitoso sin warnings ni errores.
- Error encontrado al probar login: los middlewares recibian `CancellationToken` como parametro inyectado y ASP.NET no lo puede resolver en middleware convencional.
- Arreglo: `SessionAuthenticationMiddleware` y `OperationalContextMiddleware` ahora usan `httpContext.RequestAborted`.
- Se actualizo el `PasswordHash` del usuario seed en PostgreSQL y se verifico que se afecto 1 fila.

## Estructura creada

```text
RestauranteSaaS.Api/
  Application/
    Abstractions/
    Auth/
    Sessions/
  Domain/
    Entities/
  Features/
    Auth/
    Me/
  Infrastructure/
    Auth/
    Persistence/
  Middleware/
```

## Flujo implementado

1. `POST /api/auth/login` recibe email y password.
2. Identity valida al usuario contra `AspNetUsers`.
3. `SessionService` calcula asignaciones de inquilino y operativas desde PostgreSQL.
4. Se calculan permisos por rol mas permisos directos.
5. Las denegaciones directas (`permitido = false`) remueven permisos aunque el rol los otorgue.
6. Se guarda la sesion enriquecida en Redis con llave `session:{sid}`.
7. Se genera JWT corto con `sub`, `sid` y `exp`.
8. El JWT se manda como cookie `access_token`, `HttpOnly`, `Secure`, `SameSite=Strict`.
9. En cada request autenticado, `SessionAuthenticationMiddleware` lee el `sid`, carga Redis y construye `ICurrentUser`.
10. `OperationalContextMiddleware` lee `X-Tenant-Id` y opcionalmente `X-Operational-Unit-Id`, valida acceso y construye `ICurrentContext`.

## Ejemplo de sesion Redis

Llave:

```text
session:2a0f91f8-1f7e-4f30-9df8-7636b6a80e5f
```

Payload:

```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "email": "admin@demo.com",
  "tenantScopes": [
    {
      "tenantId": "22222222-2222-2222-2222-222222222222",
      "assignmentId": "33333333-3333-3333-3333-333333333333",
      "roleId": "44444444-4444-4444-4444-444444444444",
      "roleCode": "ADMIN",
      "roleName": "Administrador",
      "allowedPermissions": [ "inquilinos.configurar", "restaurantes.crear" ],
      "deniedPermissions": []
    }
  ],
  "operationalScopes": [
    {
      "tenantId": "22222222-2222-2222-2222-222222222222",
      "operationalUnitId": "55555555-5555-5555-5555-555555555555",
      "employeeId": "66666666-6666-6666-6666-666666666666",
      "assignmentId": "77777777-7777-7777-7777-777777777777",
      "roleId": "88888888-8888-8888-8888-888888888888",
      "roleName": "Cajero",
      "allowedPermissions": [ "comandas.crear", "pagos.cobrar" ],
      "deniedPermissions": [ "pagos.cancelar" ]
    }
  ],
  "createdAt": "2026-07-16T23:59:00Z",
  "expiresAt": "2026-07-17T00:14:00Z"
}
```

## Ejemplos HTTP

Login:

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "admin@demo.com",
  "password": "Password123!"
}
```

Request con contexto de inquilino:

```http
GET /api/me HTTP/1.1
Cookie: access_token={jwt}
X-Tenant-Id: 22222222-2222-2222-2222-222222222222
```

Request con contexto operativo:

```http
GET /api/me HTTP/1.1
Cookie: access_token={jwt}
X-Tenant-Id: 22222222-2222-2222-2222-222222222222
X-Operational-Unit-Id: 55555555-5555-5555-5555-555555555555
```

## Notas tecnicas

- La cookie se configura `Secure` por requerimiento. Para probar en navegador real se necesita HTTPS; en HTTP local el navegador puede no persistir/enviar la cookie.
- `X-Operational-Unit-Id` es opcional para endpoints administrativos de inquilino.
- Si se manda `X-Operational-Unit-Id`, el acceso se valida contra asignaciones operativas.
- Los controllers/endpoints no leen claims ni headers directamente.
- RLS queda preparado conceptualmente porque el contexto activo esta centralizado en `ICurrentUser` e `ICurrentContext`; el siguiente paso tecnico seria agregar un interceptor/transaccion que ejecute `set_config` en PostgreSQL antes de queries protegidas.

## Pendientes

- Actualizar `ConnectionStrings:Postgres` con el password/usuario real de la BD local.
- Ejecutar:

```powershell
dotnet ef database update --project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --startup-project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --no-build
```

- Probar runtime con PostgreSQL y Redis reales levantados.
- Crear seed minimo de usuario/asignaciones/permisos para validar login extremo a extremo.
- Agregar interceptor para preparar variables de RLS en PostgreSQL.
