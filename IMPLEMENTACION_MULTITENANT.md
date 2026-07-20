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
- Se creo el proyecto frontend `Norix.App` con Vite oficial y template React + TypeScript.
- Se instalaron las dependencias acordadas:
  - TanStack Query;
  - Zustand;
  - React Router;
  - Tailwind CSS;
  - Zod;
  - Lucide React.
- Se implemento el primer login visual de NORIX:
  - identidad oscura corporativa;
  - colores de marca: azul profundo, gris grafito, azul NORIX, verde NORIX, violeta y gris claro;
  - login conectado a `POST /api/auth/login`;
  - cookie httpOnly manejada por el backend;
  - proxy de Vite `/api` hacia `http://localhost:5016` para desarrollo.
- Se agrego una vista placeholder `/contexto` para el siguiente slice: selector de contexto de trabajo.
- Validacion frontend:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Se inicio el contexto tenant en `Norix.App`:
  - `/contexto` muestra el primer shell administrativo de tenant.
  - Sidebar contextual con secciones de Inicio, Directorio, Acceso, Actividad y Configuracion.
  - Header con breadcrumb, acciones rapidas y contexto actual.
  - Paneles de resumen para restaurantes, unidades operativas, usuarios y entidades fiscales.
  - Panel derecho con contexto de trabajo, estructura del inquilino y sesion.
  - Datos visuales temporales basados en el seed; falta conectar endpoints especificos del tenant.
- Se rediseño `/contexto` para acercarlo a la referencia visual aprobada:
  - portal oscuro corporativo tipo Azure/NORIX;
  - sidebar denso con grupos administrativos;
  - topbar con launcher/busqueda;
  - tabs de recurso;
  - tarjetas compactas;
  - panel derecho con estructura jerarquica del inquilino;
  - colores y atmosfera tomados de la identidad visual NORIX.
- Validacion frontend despues del rediseño:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.

### CRUD tenant/restaurantes

- Se inicio el primer CRUD real del contexto tenant: `Restaurantes / Marcas`.
- Backend agregado:
  - `GET /api/tenant/restaurantes`
  - `GET /api/tenant/restaurantes/{id}`
  - `POST /api/tenant/restaurantes`
  - `PUT /api/tenant/restaurantes/{id}`
  - `PATCH /api/tenant/restaurantes/{id}/estado`
- El CRUD de restaurantes:
  - requiere autenticacion;
  - requiere contexto por `X-Tenant-Id`;
  - filtra siempre por `ICurrentContext.TenantId`;
  - valida duplicidad de `codigo` por inquilino;
  - permite activar/desactivar logicamente con `activo`.
- Frontend agregado:
  - ruta `/tenant/restaurantes`;
  - listado con busqueda y filtro por estado;
  - panel lateral para crear/editar;
  - accion para activar/desactivar;
  - acceso rapido desde `/contexto`.
- Decision temporal:
  - el frontend usa el `id_inquilino` del seed como header `X-Tenant-Id`;
  - pendiente reemplazarlo por el contexto activo real en Zustand cuando se implemente el selector de contexto.
- Validacion despues del CRUD de restaurantes:
  - `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj` exitoso.
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Error encontrado:
  - algunos accesos visuales a `Restaurantes / Marcas` seguian siendo botones sin navegacion real.
- Arreglo:
  - el item del sidebar `Restaurantes / Marcas` ahora navega a `/tenant/restaurantes`;
  - el `Ver todos` de la tarjeta `Restaurantes / Marcas` ahora navega a `/tenant/restaurantes`;
  - el acceso rapido se mantiene apuntando a `/tenant/restaurantes`.
- Validacion despues del arreglo de navegacion:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Error de arquitectura UI encontrado:
  - `/tenant/restaurantes` se habia implementado como pantalla independiente, rompiendo la filosofia tipo Azure acordada.
- Arreglo:
  - `/tenant/restaurantes` ahora vive dentro del mismo NORIX Portal;
  - conserva sidebar contextual de tenant;
  - conserva topbar/launcher;
  - muestra breadcrumb `Inicio > Grupo Gourmet > Restaurantes / Marcas`;
  - trata `Restaurantes / Marcas` como recurso activo del tenant, no como otra app;
  - mantiene el CRUD dentro del area de contenido del recurso.
- Validacion despues del ajuste tipo Azure:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste de contexto anidado:
  - al seleccionar una marca desde `/tenant/restaurantes`, ahora se abre `/tenant/restaurantes/{id}`;
  - esta ruta representa el contexto `Restaurante / Marca`;
  - el contexto restaurante/marca tiene su propio sidebar anidado:
    - Informacion general;
    - Sucursales;
    - Usuarios;
    - Roles y permisos;
    - Configuracion.
  - el sidebar incluye `Cambiar de nivel` para regresar al tenant `Grupo Gourmet`;
  - el header mantiene breadcrumb `Inicio > Grupo Gourmet > Restaurante`;
  - se conserva la filosofia tipo Azure: mismo portal, nuevo recurso activo, menu adaptado al recurso.
- Validacion despues del contexto restaurante/marca:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste de navegacion anidada:
  - se agrego un rail lateral interno para el contexto `/tenant/restaurantes/{id}`;
  - el patron visual queda:
    - sidebar principal: nivel/portal actual;
    - rail anidado: recurso abierto y menu especifico del recurso;
    - contenido: administracion o informacion del recurso.
  - la tabla de restaurantes ahora muestra una accion explicita `Abrir contexto`.
- Correccion de flujo:
  - `/tenant/restaurantes` representa la coleccion de restaurantes/marcas del tenant;
  - la coleccion no debe mostrar menu anidado;
  - el menu anidado aparece solamente al abrir un restaurante/marca especifico en `/tenant/restaurantes/{id}`;
  - flujo correcto:

```text
Tenant
  -> Restaurantes / Marcas  (coleccion, sin rail anidado)
      -> Abrir contexto
          -> Restaurante / Marca especifico  (con rail anidado)
```
- Validacion despues de navegacion anidada:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste de visibilidad del patron tipo Azure:
  - la navegacion anidada del recurso debe verse junto a la navegacion principal del tenant;
  - no reemplaza la barra principal;
  - se bajo el breakpoint del rail anidado de `2xl` a `xl` para que aparezca en desktop normal;
  - el patron queda: sidebar principal NORIX/tenant + rail del recurso activo + contenido.
- Validacion despues del ajuste de breakpoint:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Limpieza visual en `/tenant/restaurantes`:
  - se quitaron los subpaneles `Contexto actual` y `Directorio tenant`;
  - la vista queda enfocada en sidebar principal tenant + tabla de coleccion;
  - la tabla gana espacio horizontal y se reduce ruido visual.
- Validacion despues de limpieza visual:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.

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

## Diseno pendiente de NORIX Portal

- Pendiente de implementacion. Esta seccion documenta direccion de producto para aterrizar interfaces antes de construirlas.
- NORIX sera un portal unico basado en contexto, no tres aplicaciones separadas.
- La filosofia principal es similar a Azure Portal / Entra: el usuario nunca sale del portal, solo cambia el recurso o contexto de trabajo.
- El menu lateral cambia segun el recurso activo.
- El concepto principal de UI sera `Contexto de trabajo`, no `Cambiar de nivel`.

Principio base:

```text
NORIX Portal
  -> contexto tenant
  -> contexto restaurante / marca
  -> contexto unidad operativa / sucursal
```

El usuario siempre debe poder ver:

- tenant actual;
- restaurante/marca actual, cuando aplique;
- unidad operativa/sucursal actual, cuando aplique;
- ruta/breadcrumb del contexto;
- recurso activo;
- opciones rapidas para cambiar de contexto.

Cadena de contexto recomendada:

```text
Tenant: Grupo Gourmet
  -> Restaurante / Marca: La Parrilla Grill
      -> Unidad operativa / Sucursal: Centro
```

Cada elemento de la cadena debe ser clicable:

- Click en tenant: vuelve al contexto tenant.
- Click en restaurante/marca: abre el contexto de restaurante.
- Click en unidad operativa/sucursal: abre el contexto operativo.

### Recursos y contexto

- Todo objeto administrable importante se tratara como recurso.
- La jerarquia principal de recursos sera:

```text
Tenant
  -> Restaurante / Marca
      -> Unidad Operativa / Sucursal
          -> Cocina
          -> Caja
          -> Mesas
          -> Impresoras
          -> Empleados
          -> Inventario
```

- `Usuarios` no es un nivel jerarquico.
- Usuarios debe tratarse como modulo de acceso, resultado de busqueda o acceso rapido, no como cuarto nivel.
- El termino `recurso` se usara para arquitectura y navegacion; en operacion diaria se mantendran nombres humanos como mesas, comandas, caja, cocina y turnos.

### Navigator

- Se evaluara un `Navigator` fijo o colapsable arriba del sidebar.
- El Navigator mostrara la estructura navegable del tenant, similar a un explorador:

```text
Grupo Gourmet
  La Parrilla Grill
    Centro
    Norte
    Sur
  Cafe del Lago
    Centro
    Plaza
  Pizza Factory
    Centro
    Norte
```

- Al hacer click en un tenant, restaurante o unidad operativa, cambia el contexto activo y el sidebar se adapta.
- En vistas administrativas puede estar visible por defecto.
- En operacion diaria puede estar colapsado o reducido para no estorbar flujos rapidos.

### Buscador / launcher

- La busqueda global debe funcionar como launcher, no solo como filtro.
- Atajo propuesto: `Ctrl + K`.
- Debe permitir saltar directamente a recursos permitidos por autorizacion:
  - restaurantes;
  - unidades operativas;
  - usuarios;
  - roles;
  - productos;
  - mesas;
  - comandas;
  - impresoras;
  - cajas;
  - empleados.
- Los resultados deben filtrarse por permisos y contexto disponible.

### Contexto tenant

- El contexto tenant funcionara como centro de administracion corporativa del inquilino.
- No representa operacion diaria del restaurante; representa gobierno, estructura y configuracion global.
- Debe sentirse sobrio, corporativo y orientado a gestion:
  - tablas;
  - filtros;
  - navegacion lateral;
  - acciones claras;
  - vistas densas pero legibles.
- Puede mostrar unidades operativas, pero solo desde una vista administrativa global.
- No debe mezclar flujos operativos como comandas, caja, cocina, turnos o impresion diaria.

Roles tentativos de inquilino:

- `OWNER`: acceso total al inquilino.
- `ADMIN_TENANT`: administracion amplia sin necesariamente tocar propiedad o configuraciones criticas futuras.
- `GESTOR_RESTAURANTES`: administra restaurantes, entidades fiscales, direcciones y unidades operativas.
- `GESTOR_USUARIOS`: administra invitaciones, usuarios y asignaciones de roles.
- `LECTOR_TENANT`: solo lectura global.

Permisos tentativos de inquilino:

- `inquilinos.ver`
- `inquilinos.configurar`
- `usuarios.ver`
- `usuarios.invitar`
- `usuarios.desactivar`
- `usuarios.asignar_roles`
- `roles_inquilino.ver`
- `roles_inquilino.crear`
- `roles_inquilino.editar`
- `roles_inquilino.eliminar`
- `roles_inquilino.asignar_permisos`
- `restaurantes.ver`
- `restaurantes.crear`
- `restaurantes.editar`
- `restaurantes.desactivar`
- `entidades_fiscales.ver`
- `entidades_fiscales.crear`
- `entidades_fiscales.editar`
- `entidades_fiscales.desactivar`
- `direcciones.ver`
- `direcciones.crear`
- `direcciones.editar`
- `direcciones.desactivar`
- `unidades_operativas.ver`
- `unidades_operativas.crear`
- `unidades_operativas.editar`
- `unidades_operativas.desactivar`
- `auditoria.ver`
- `configuracion_global.ver`
- `configuracion_global.editar`

Separacion de menu:

- `Directorio` responde: que estructura existe.
- `Acceso` responde: quien puede hacer que.
- No mezclar directorio con permisos/asignaciones.

Menu tentativo del contexto tenant:

```text
Inicio
Directorio
  Restaurantes / Marcas
  Unidades operativas
  Entidades fiscales
  Direcciones
Acceso
  Usuarios
  Roles
  Permisos
  Asignaciones
Actividad
  Auditoria
  Sesiones
Configuracion
  General
  Seguridad
  Integraciones
```

Pendiente de implementacion en frontend:

- Alinear el sidebar principal del contexto tenant exactamente con este menu.
- El contexto tenant debe limitarse a administracion corporativa/global del inquilino.
- El contexto tenant no debe mostrar flujos operativos diarios.
- Elementos que no pertenecen al menu tenant:
  - Comandas;
  - Mesas;
  - Cocina;
  - Caja;
  - Pagos;
  - Cortes;
  - Inventario;
  - Impresoras;
  - Agentes locales;
  - Activos tecnologicos;
  - Empleados operativos.
- Separacion semantica:
  - `Directorio`: que estructura existe;
  - `Acceso`: quien puede hacer que;
  - `Actividad`: que paso;
  - `Configuracion`: como se comporta el inquilino.
- Avance implementado:
  - el sidebar de `/contexto` ya fue alineado con este menu tenant;
  - el sidebar principal de `/tenant/restaurantes` ya fue alineado con este menu tenant;
  - el sidebar principal que permanece visible dentro de `/tenant/restaurantes/{id}` ya fue alineado con este menu tenant;
  - queda pendiente conectar rutas reales para cada opcion que aun no tiene CRUD.
- Validacion despues de alinear menu tenant:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Homologacion de barra de comandos:
  - se creo el componente comun `CommandBar`;
  - el orden fijo queda:
    - `Agregar`;
    - `Administrar`;
    - `Actualizar`;
    - `Exportar`.
  - la barra mantiene mismo estilo, altura, iconos, separacion y posicion en:
    - `/contexto`;
    - `/tenant/restaurantes`;
    - `/tenant/restaurantes/{id}`.
  - el significado interno de `Agregar` depende del recurso actual, pero el control visual no cambia.
- Validacion despues de homologar comandos:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Sidebar tenant colapsable:
  - se creo el componente comun `TenantSidebar`;
  - el menu tenant se muestra colapsado para ahorrar espacio;
  - al pasar el mouse sobre el sidebar, se despliega temporalmente;
  - se agrego accion para fijar/desfijar el menu;
  - el estado fijado se persiste en `localStorage` con la llave `norix.tenantSidebarPinned`;
  - se reemplazaron sidebars duplicados por `TenantSidebar` en:
    - `/contexto`;
    - `/tenant/restaurantes`;
    - `/tenant/restaurantes/{id}`.
- Validacion despues del sidebar colapsable:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Correccion visual del sidebar colapsable:
  - se elimino el encimado del boton de menu/pin con el logo al contraerse;
  - en modo colapsado el logo queda centrado y el boton de fijar aparece al expandirse;
  - se estabilizo el icono del contexto tenant para que no brinque al expandir;
  - los textos usan transicion de `max-width` y opacidad para evitar movimientos bruscos;
  - los iconos del menu tienen ancho fijo.
- Validacion despues de corregir movimiento del sidebar:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Sucursales reales en contexto Restaurante / Marca:
  - se elimino el mock estatico de sucursales en `/tenant/restaurantes/{id}`;
  - se agrego endpoint `GET /api/tenant/restaurantes/{id}/sucursales`;
  - el endpoint lee `unidades_operativas` filtrando por `ICurrentContext.TenantId` e `id_restaurante`;
  - el frontend consulta las sucursales con TanStack Query;
  - el overview de marca ahora calcula total, activas e inactivas desde la BD.
- Validacion despues de conectar sucursales:
  - `dotnet build RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --output D:\tmp\norix-api-build-check` exitoso.
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.

Menu tentativo del contexto restaurante / marca:

```text
Inicio
Informacion general
Sucursales
Catalogo
Acceso
Actividad
Configuracion
```

Definicion acordada para contexto Restaurante / Marca:

- La pantalla principal sera `Informacion general`.
- `Informacion general` funcionara como overview de marca/restaurante.
- Debe mostrar:
  - resumen de sucursales/unidades operativas de esa marca;
  - usuarios/asignaciones de restaurante;
  - ventas y ordenes agregadas de la marca cuando exista operacion;
  - estado general;
  - actividad reciente;
  - accesos rapidos a sucursales, catalogo, productos, precios y roles.
- Pestañas del recurso Restaurante / Marca:
  - `Informacion general`;
  - `Sucursales`;
  - `Catalogo`;
  - `Acceso`;
  - `Actividad`;
  - `Configuracion`.
- Contenido por pestaña:
  - `Informacion general`: resumen, KPIs agregados, actividad reciente, sucursales principales y alertas globales de marca.
  - `Sucursales`: unidades operativas de la marca, crear sucursal, estado, region, direccion y entidad fiscal asociada.
  - `Catalogo`: menus, categorias, productos, areas de preparacion y precios por sucursal cuando aplique.
  - `Acceso`: usuarios con acceso a la marca, roles restaurante, permisos restaurante y asignaciones restaurante.
  - `Actividad`: auditoria de cambios de la marca, eventos administrativos, cambios de catalogo y cambios de acceso.
  - `Configuracion`: datos generales de la marca, logo, parametros comerciales, configuracion de impresion por areas y configuracion fiscal/comercial aplicable a la marca.
- Elementos que no pertenecen al contexto Restaurante / Marca:
  - Mesas;
  - Comandas;
  - Cocina;
  - Caja;
  - Pagos;
  - Cortes.
- Esos elementos pertenecen al contexto Unidad Operativa / Sucursal.
- `Sucursales` sera la puerta para abrir el siguiente contexto:

```text
Restaurante / Marca
  -> Unidad Operativa / Sucursal
```

Menu tentativo del contexto unidad operativa / sucursal:

```text
Inicio
Operacion
  Mesas
  Comandas
  Cocina
  Caja
  Pagos
  Cortes
Personal
  Empleados
  Roles operativos
  Asignaciones operativas
Dispositivos
  Impresoras
  Agentes locales
  Activos tecnologicos
Actividad
  Eventos
  Errores de impresion
Configuracion
  General
  Areas locales
```

Elementos que quedan como futuros o no prioritarios:

- Facturacion SaaS.
- Etiquetas.
- Portal raiz/superadmin para administrar multiples inquilinos.

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
- Conectar el header `X-Tenant-Id` del frontend al contexto activo en Zustand; actualmente `/tenant/restaurantes` usa el tenant del seed para avanzar el slice.
- Alinear seed/permisos finales para validar `restaurantes.ver`, `restaurantes.crear`, `restaurantes.editar` y `restaurantes.desactivar` desde backend.
- Ejecutar:

```powershell
dotnet ef database update --project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --startup-project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --no-build
```

- Probar runtime con PostgreSQL y Redis reales levantados.
- Crear seed minimo de usuario/asignaciones/permisos para validar login extremo a extremo.
- Agregar interceptor para preparar variables de RLS en PostgreSQL.
