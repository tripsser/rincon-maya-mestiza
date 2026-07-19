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
  - Headers de contexto: `X-Tenant-Id`, `X-Restaurant-Id` y `X-Operational-Unit-Id`.
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
- Se valido el primer flujo vertical funcional:
  - Login con Identity
  - JWT en cookie
  - Sesion en Redis
  - Permisos desde PostgreSQL
  - Contexto tenant/unidad operativa
  - UI minima mostrando datos reales

## Decision frontend

- Se creara frontend separado con Vite.
- Stack acordado:
  - React
  - TypeScript
  - Vite
  - TanStack Query
  - Zustand
  - React Router
  - Tailwind CSS
  - Zod
  - Lucide React
- Responsabilidades:
  - TanStack Query manejara datos remotos del backend: `/api/me`, restaurantes, unidades operativas, productos, comandas, etc.
  - Zustand manejara estado local/global de UI y contexto activo:
    - `tenantId`
    - `restaurantId`
    - `operationalUnitId`
    - sidebar/menu
    - filtros temporales
    - seleccion local de vistas operativas
  - El cliente HTTP del frontend usara el estado de Zustand para mandar:
    - `X-Tenant-Id`
    - `X-Restaurant-Id`
    - `X-Operational-Unit-Id`
- En desarrollo:
  - Frontend Vite: `http://localhost:5173`
  - API ASP.NET Core: `http://localhost:5016`
  - Se necesitara CORS con credentials en la API para permitir cookie httpOnly entre puertos.
- En produccion se decidira despues si:
  - el build del frontend se sirve desde ASP.NET Core, o
  - frontend y API se despliegan separados.

## Decision autorizacion por restaurante

- Se agrega un tercer plano semantico de autorizacion:
  - Inquilino
  - Restaurante / marca
  - Unidad operativa
- Restaurante/marca tendra su propia familia de roles, permisos y asignaciones, igual que inquilino y unidad operativa.
- La razon principal es semantica:
  - administrar un inquilino completo no es lo mismo que administrar una marca/restaurante;
  - administrar una marca/restaurante no es lo mismo que operar una sucursal/unidad operativa.
- Familias conceptuales:
  - `roles_inquilino`
  - `permisos_inquilino`
  - `asignaciones_inquilino`
  - `roles_restaurante`
  - `permisos_restaurante`
  - `asignaciones_restaurante`
  - `roles_restaurante_permisos`
  - `asignaciones_restaurante_permisos`
  - `roles_operativos`
  - `permisos_operativos`
  - `asignaciones_operativas`
- Decision de relacion:
  - `asignaciones_restaurante` apunta a `id_usuario`, no a `id_empleado`.
  - `asignaciones_restaurante` apunta a `id_restaurante`.
  - `asignaciones_restaurante` no lleva `id_inquilino`, porque el inquilino se obtiene desde `restaurantes.id_inquilino`.
  - `roles_restaurante` si lleva `id_inquilino` para que los roles administrativos de restaurante se definan por tenant.
- Se agregaron entidades EF y migraciones para el plano restaurante.
- Migraciones creadas:
  - `20260719044126_AddRestaurantAuthorization`
  - `20260719044208_FixRestaurantAuthorizationSnapshot`
- Tablas agregadas por migracion:
  - `roles_restaurante`
  - `permisos_restaurante`
  - `roles_restaurante_permisos`
  - `asignaciones_restaurante`
  - `asignaciones_restaurante_permisos`
- `20260719044208_FixRestaurantAuthorizationSnapshot` no genera cambios SQL; solo estabiliza el snapshot/historial de EF.
- Validacion:
  - `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj` exitoso.
  - `dotnet ef database update` aplico las migraciones correctamente.
  - `dotnet ef migrations has-pending-model-changes` indica que no hay cambios pendientes.
- Se adapto el runtime al nuevo plano restaurante:
  - El JWT se mantiene minimo con `sub`, `sid` y `exp`; no se agregan claims de permisos ni scopes.
  - Redis ahora guarda `restaurantScopes` ademas de `tenantScopes` y `operationalScopes`.
  - `operationalScopes` ahora incluye `restaurantId` para derivar el restaurante desde la unidad operativa.
  - `OperationalContextMiddleware` acepta `X-Restaurant-Id` como header opcional.
  - `/api/me` devuelve `restaurantId` y `restaurantPermissions`.
  - La interfaz minima `/me.html` muestra tenant, restaurante, unidad y las tres familias de permisos.
- Se agrego compatibilidad defensiva para sesiones Redis antiguas: si una sesion no trae `restaurantScopes` o no trae `restaurantId` en `operationalScopes`, se recalcula y se guarda de nuevo.
- Se actualizo el seed inicial con rol, permisos y asignacion de restaurante para el usuario demo.

## Cobertura jerarquica de asignaciones

- La cobertura de acceso sera jerarquica para evitar asignaciones repetitivas.
- Un permiso/asignacion de nivel superior puede cubrir niveles inferiores cuando el permiso lo permita.
- Jerarquia:

```text
inquilino
  -> restaurante / marca
      -> unidad operativa
```

- Ejemplos:
  - Un admin global de inquilino puede administrar todos los restaurantes del inquilino sin asignarse a cada restaurante.
  - Un admin global de restaurantes/marca puede administrar todas las unidades operativas de ese restaurante sin asignarse explicitamente a cada unidad.
  - Un usuario operativo de unidad solo opera la unidad asignada, salvo que tenga asignacion superior.
- Las asignaciones explicitas de nivel inferior seguiran existiendo para casos puntuales.
- El calculo de permisos efectivos debera considerar:
  - permisos directos del alcance actual;
  - permisos heredados desde alcances superiores;
  - denegaciones explicitas, donde `permitido = false` gana sobre permisos heredados o de rol.
- La UI debera reflejar esta jerarquia:
  - contexto inquilino para administracion global;
  - contexto restaurante para administracion de marca/restaurante;
  - contexto unidad operativa para operacion diaria.

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
3. `SessionService` calcula asignaciones de inquilino, restaurante y operativas desde PostgreSQL.
4. Se calculan permisos por rol mas permisos directos.
5. Las denegaciones directas (`permitido = false`) remueven permisos aunque el rol los otorgue.
6. Se guarda la sesion enriquecida en Redis con llave `session:{sid}`.
7. Se genera JWT corto con `sub`, `sid` y `exp`.
8. El JWT se manda como cookie `access_token`, `HttpOnly`, `Secure`, `SameSite=Strict`.
9. En cada request autenticado, `SessionAuthenticationMiddleware` lee el `sid`, carga Redis y construye `ICurrentUser`.
10. `OperationalContextMiddleware` lee `X-Tenant-Id`, opcionalmente `X-Restaurant-Id` y opcionalmente `X-Operational-Unit-Id`, valida acceso y construye `ICurrentContext`.

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
  "restaurantScopes": [
    {
      "tenantId": "22222222-2222-2222-2222-222222222222",
      "restaurantId": "99999999-9999-9999-9999-999999999999",
      "assignmentId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "roleId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "roleCode": "ADMIN_RESTAURANTE",
      "roleName": "Administrador de restaurante",
      "allowedPermissions": [ "restaurante.configurar", "restaurante.menu.administrar" ],
      "deniedPermissions": []
    }
  ],
  "operationalScopes": [
    {
      "tenantId": "22222222-2222-2222-2222-222222222222",
      "restaurantId": "99999999-9999-9999-9999-999999999999",
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
X-Restaurant-Id: 99999999-9999-9999-9999-999999999999
X-Operational-Unit-Id: 55555555-5555-5555-5555-555555555555
```

Request con contexto restaurante:

```http
GET /api/me HTTP/1.1
Cookie: access_token={jwt}
X-Tenant-Id: 22222222-2222-2222-2222-222222222222
X-Restaurant-Id: 99999999-9999-9999-9999-999999999999
```

## Notas tecnicas

- La cookie se configura `Secure` por requerimiento. Para probar en navegador real se necesita HTTPS; en HTTP local el navegador puede no persistir/enviar la cookie.
- `X-Restaurant-Id` es opcional para endpoints administrativos de inquilino.
- `X-Operational-Unit-Id` es opcional para endpoints administrativos de inquilino o restaurante.
- Si se manda `X-Operational-Unit-Id`, el acceso se valida contra asignaciones operativas.
- Si se manda `X-Restaurant-Id`, el acceso se valida contra asignaciones de restaurante o contra un alcance superior de inquilino.
- Los controllers/endpoints no leen claims ni headers directamente.
- Despues de cambiar la forma de la sesion Redis, lo mas limpio es iniciar sesion de nuevo para crear un `sid` fresco con `restaurantScopes`; si se usa una cookie vieja, el backend intenta recalcular la sesion al leerla.
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
