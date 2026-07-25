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

## Evaluacion de plantilla Studio Admin

Se reviso la plantilla externa `next-shadcn-admin-dashboard-main` como posible base visual para NORIX.

Hallazgos:

- Stack de la plantilla:
  - Next.js 16 App Router
  - React 19
  - Tailwind CSS 4
  - shadcn UI / Base UI
  - TanStack Table
  - Zustand
  - React Hook Form
  - Zod
  - Biome
- Licencia MIT, por lo que se puede adaptar codigo o patrones respetando atribucion cuando aplique.
- La plantilla trae un sistema UI mas completo que el prototipo actual de `Norix.App`: sidebar colapsable, header, buscador, controles de layout, tema claro/oscuro, tablas avanzadas, filtros, paginacion, formularios, drawers/sheets, tabs y pantallas de auth.
- La arquitectura del template esta basada en colocation por rutas de Next; no coincide directamente con `Norix.App`, que esta en Vite + React Router.
- La plantilla es un admin kit generico; no representa por si sola la jerarquia de NORIX: inquilino, restaurante/marca y unidad operativa/sucursal.

Decision:

- No migrar NORIX completo a Next.js solo por la plantilla en esta iteracion.
- No copiar la plantilla completa dentro de `Norix.App`, para evitar mezclar demos, rutas irrelevantes y dependencia de App Router.
- Adaptar por piezas los patrones que si aportan:
  - sistema de componentes base tipo shadcn
  - layout shell mas maduro
  - tablas con TanStack Table
  - filtros compactos
  - drawers/sheets para edicion rapida
  - toolbar y acciones homogeneas
  - preferencias de layout/tema
  - formularios con React Hook Form + Zod
- Mantener la arquitectura funcional de NORIX:
  - Vite separado
  - React Router
  - Zustand para sesion/contexto UI
  - TanStack Query para datos remotos
  - jerarquia visual tipo recurso/contexto inspirada en Azure

Pendiente:

- Definir si se agrega `shadcn` formalmente a `Norix.App` o si se portan solo componentes especificos.
- Si se copian componentes MIT de la plantilla, agregar nota de atribucion en documentacion/licencia del frontend.
- Revisar visualmente que los componentes adaptados conserven identidad NORIX: oscuro profundo, vidrio sutil, verde/azul/violeta de marca y layout por contexto.

### Tema visual Norix

- Se separo el tema visual en dos conceptos:
  - `themeMode`: oscuro/claro.
  - `themePreset`: preset visual.
- El tema actual queda guardado como `norix-original`.
- Se agrego una copia de trabajo llamada `norix-lab`.
- El boton de tema ahora permite:
  - alternar entre `Base` y `Lab`;
  - alternar entre oscuro y claro.
- Regla de trabajo: los cambios visuales inspirados en Studio Admin se haran sobre `:root[data-theme-preset='norix-lab']` para conservar intacto el tema Norix base.
- Pendiente de consistencia:
  - el tema claro existe, pero requiere maduracion visual porque aun se percibe inconsistente;
  - no se eliminara el cambio claro/oscuro;
  - los arreglos del tema claro deberan hacerse desde tokens y componentes, no escondiendo el modo claro.

### Maduracion UX pendiente

La UX de NORIX se madurara paso por paso tomando como referencia Studio Admin, pero conservando el acomodo general ya aprobado: portal unico, rail principal, header de recurso estilo Azure, commandbar, tabs y contexto jerarquico.

Checklist priorizado:

- Sistema visual base:
  - conservar `norix-original` como base estable;
  - trabajar experimentos en `norix-lab`;
  - homogeneizar radios, sombras, bordes, hover, focus, inputs, botones y estados;
  - reducir estilos hechos a mano cuando exista un componente reutilizable.
- Shell principal:
  - mantener un solo portal NORIX;
  - pulir sidebar colapsable/pineable;
  - definir topbar definitivo con launcher, acciones globales, usuario, tema y notificaciones;
  - mejorar breadcrumbs como navegacion real de jerarquia.
- Navegacion por contexto:
  - tenant con menu administrativo global;
  - restaurante/marca con menu de recurso marca;
  - unidad operativa/sucursal con menu operativo;
  - el cambio de recurso debe cambiar el menu sin sentirse como otra aplicacion;
  - resolver vista para usuarios con scope parcial: solo restaurante o solo sucursal.
- Colecciones:
  - tablas limpias tipo Azure/shadcn;
  - busqueda, filtros, ordenamiento y paginacion;
  - acciones homogeneas: agregar, editar, desactivar, exportar, actualizar;
  - estados vacios, loading, 401, 403 y 500;
  - seleccion multiple y acciones masivas cuando aplique.
- Vista de recurso:
  - header de recurso reusable con breadcrumb, titulo, tipo, id, commandbar y tabs;
  - vista `Informacion general` estilo Azure;
  - edicion con lapiz/panel lateral;
  - tabs solo si aportan trabajo real al recurso.
- Formularios:
  - validacion por campo;
  - errores visuales consistentes;
  - confirmaciones de guardado;
  - dirty state para cambios sin guardar;
  - crear/editar con mismo lenguaje visual.
- Autorizacion visible:
  - ocultar o deshabilitar acciones segun permisos;
  - mensajes claros por falta de permiso;
  - diferenciar bien alcance tenant, restaurante y sucursal.
- Feedback de sistema:
  - toasts;
  - skeletons;
  - spinners pequenos;
  - sesion expirada;
  - reintentos ante fallos de API.
- Responsive:
  - sidebar mobile;
  - tablas en pantallas chicas;
  - drawers adaptados a movil;
  - layout estable en laptop chica.
- Componentizacion objetivo:
  - `AppShell`;
  - `ResourceHeader`;
  - `CommandBar`;
  - `DataTable`;
  - `SideDrawer`;
  - `StatusBadge`;
  - `ContextBreadcrumb`;
  - `ContextSwitcher`;
  - `EmptyState`.

### Arquitectura frontend por features

Se redirigira `Norix.App` a una arquitectura feature-first. La unidad principal de organizacion sera el modulo funcional, no el tipo tecnico de archivo. Esto evita que el proyecto termine con carpetas enormes de `components`, `services` o `pages` desconectadas del dominio.

Estructura objetivo:

```text
src/
  app/
    App.tsx
    AppProviders.tsx
    router/
      AppRoutes.tsx
    query/
      queryClient.ts

  shared/
    api/
      apiClient.ts
    lib/
      theme.ts
    ui/
      CommandBar.tsx
      CollectionToolbar.tsx
      DataTable.tsx
      NorixMark.tsx
      ResourceHeader.tsx
      SideDrawer.tsx
      StatusBadge.tsx
      TenantSidebar.tsx
      ThemeToggle.tsx

  features/
    auth/
      api/
        authApi.ts
      model/
        authStore.ts
      pages/
        LoginPage.tsx
    context/
      pages/
        ContextPage.tsx
    tenant/
      restaurants/
        api/
          restaurantsApi.ts
        pages/
          RestaurantsPage.tsx
          RestaurantContextPage.tsx
        components/
```

Reglas:

- `app` solo arranca la aplicacion, providers globales y rutas.
- `features` agrupa cada modulo de negocio por dominio y es el lugar principal donde vive el codigo.
- `shared` no conoce reglas de negocio; solo UI, helpers, API client y utilidades reutilizables por varios features.
- Las paginas importan componentes compartidos desde `shared/ui`.
- Las llamadas HTTP especificas viven dentro del feature correspondiente.
- El estado propio de un feature vive dentro del feature, por ejemplo `features/auth/model/authStore.ts`.
- Los componentes que solo usa un feature viven en `features/<feature>/components`.
- Un componente solo sube a `shared/ui` cuando ya se usa o claramente se usara en varios features.
- Se permitira refactor incremental: primero mover estructura y rutas, luego separar componentes internos por feature.
- Se evitaran componentes gigantes; cuando una pagina supere una responsabilidad clara, se extraeran componentes locales del feature.
- Avance aplicado:
  - se creo `src/app/App.tsx`;
  - se creo `src/app/AppProviders.tsx`;
  - se creo `src/app/router/AppRoutes.tsx`;
  - se creo `src/app/query/queryClient.ts`;
  - `main.tsx` quedo como bootstrap minimo;
  - `auth` se separo en `api`, `model` y `pages`;
  - `context` se separo en `pages`;
  - `tenant/restaurants` se separo en `api` y `pages`;
  - componentes reutilizables se movieron a `shared/ui`;
  - `apiClient` se movio a `shared/api`;
  - `theme` se movio a `shared/lib`;
  - validacion: `npm.cmd run build` exitoso.
- Avance inicial de maduracion:
  - se creo `Norix.App/src/components/ResourceHeader.tsx`;
  - `ResourceHeader` encapsula breadcrumb, titulo, badge, id, commandbar y tabs;
  - se aplico en `/tenant/restaurantes`;
  - se aplico en `/tenant/restaurantes/:id`;
  - se conservaron el acomodo y jerarquia visual aprobados;
  - en `norix-lab` se ajustaron tokens y estilos del header/commandbar para acercarlos a Studio Admin sin afectar `norix-original`;
  - validacion: `npm.cmd run build` exitoso.
- Avance de colecciones CRUD:
  - se creo `Norix.App/src/components/CollectionToolbar.tsx`;
  - se creo `Norix.App/src/components/StatusBadge.tsx`;
  - se creo `Norix.App/src/components/SideDrawer.tsx`;
  - `/tenant/restaurantes` usa toolbar reusable para busqueda y filtros segmentados;
  - `/tenant/restaurantes` usa badges de estado reutilizables;
  - el panel lateral de crear/editar restaurantes usa `SideDrawer`;
  - se agregaron ajustes visuales en `norix-lab` para toolbar, tabla y drawer inspirados en Studio Admin;
  - validacion: `npm.cmd run build` exitoso.
- Avance de tablas:
  - se creo `Norix.App/src/components/DataTable.tsx`;
  - `DataTable` define shell, header, body, row, cell, message row y footer visual;
  - `/tenant/restaurantes` dejo de usar tabla HTML inline y ahora usa `DataTable`;
  - se ajustaron acciones para sentirse mas cercanas al panel: boton contextual compacto + icon buttons;
  - `norix-lab` agrega estilos especificos para tabla: header suave, filas limpias, hover discreto, footer y paginacion visual;
  - se mantiene preparada la ruta para incorporar TanStack Table despues, cuando se requiera paginacion/ordenamiento real;
  - validacion: `npm.cmd run build` exitoso.
- Correccion de direccion visual de tablas:
  - la referencia real aprobada es el patron tipo tasks del panel: toolbar dentro del contenedor, filtros compactos, columna de seleccion, filas densas, acciones discretas con tres puntos y footer con rows/page + paginacion;
  - `DataTableShell` ahora acepta `toolbar` y `footer`;
  - se agregaron `DataTableFilterButton` y `DataTableCheckbox`;
  - `/tenant/restaurantes` ahora muestra filtros dentro de la tabla, columna de seleccion, accion de mas opciones y footer estilo panel;
  - el filtro `Status` se mantiene funcional ciclando `Todos`, `Activos` e `Inactivos`;
  - validacion: `npm.cmd run build` exitoso.
- Avance de animaciones:
  - se agrego un sistema CSS de animaciones NORIX con entradas `fade-up`, `slide-left`, `slide-right`, overlay y transiciones suaves;
  - el portal, headers de recurso, paneles, cards, tabla, filas y chips tienen entrada/transicion sutil;
  - `SideDrawer` ahora usa `side-drawer-backdrop` y `side-drawer` para animar overlay y entrada lateral;
  - el rail anidado de restaurante/marca usa `resource-rail` para entrar desde la izquierda;
  - se agrego soporte para `prefers-reduced-motion`;
  - la intencion visual es enterprise/NORIX: movimiento corto, suave y acorde a la paleta, sin exagerar;
  - validacion: `npm.cmd run build` exitoso.
- Correccion de animaciones:
  - se retiraron animaciones globales del portal, headers, paneles, cards y filas porque generaban sensacion de parpadeo al cambiar rutas;
  - el nivel tenant debe sentirse estable cuando no cambia el contexto;
  - el movimiento queda concentrado en elementos que realmente aparecen o se abren: drawer y rail anidado;
  - el rail anidado de restaurante/marca ahora usa un reveal lateral con `clip-path`, sombra lateral y contenido escalonado;
  - objetivo: navegacion fluida tipo panel anidado, no reanimacion completa de pantalla.
- Correccion adicional del rail anidado:
  - se detecto que el cambio seguia sintiendose brusco porque el rail empujaba el layout de golpe;
  - el rail de restaurante/marca ahora anima su ancho/flex-basis desde `0` hasta `14rem`;
  - el contenido interno entra despues con una opacidad corta y desplazamiento minimo;
  - se quito el doble slide interno de los hijos para evitar movimiento exagerado;
  - objetivo: que se perciba como panel anidado que se abre dentro del contexto tenant, no como parpadeo de pantalla.
- Avance de tercer nivel Unidad Operativa / Sucursal:
  - se creo un componente reusable `ResourceRail` para rails anidados;
  - cada rail puede estar fijo o contraido y se despliega al pasar el mouse;
  - cuando se abre un rail hijo, el rail padre puede forzarse a modo compacto para ahorrar espacio, pero sigue pudiendo expandirse con hover;
  - se agrego la ruta `/tenant/restaurantes/:id/sucursales/:branchId`;
  - desde la tabla de sucursales del restaurante/marca, la accion `Abrir` entra al contexto de sucursal;
  - la pantalla de sucursal mantiene el portal NORIX, el sidebar tenant, el rail de restaurante/marca compacto y un nuevo rail operativo de sucursal;
  - el menu tentativo de sucursal incluye: informacion general, mesas, comandas, cocina, caja, pagos, empleados, impresoras, activos, roles operativos, actividad y configuracion;
  - de momento la sucursal usa la coleccion ya cargada desde `/api/tenant/restaurantes/{id}/sucursales`; despues se refinara con endpoint propio de unidad operativa si hace falta mas detalle.
- Correccion de scroll del portal:
  - se detecto que los menus se cortaban al desplazarse porque el documento completo hacia scroll mientras los rails usaban `overflow-hidden`;
  - el shell principal ahora usa altura de viewport (`h-screen`) y oculta overflow global;
  - el contenido principal de cada vista hace scroll interno con `overflow-y-auto`;
  - `TenantSidebar` mantiene altura completa de viewport;
  - `ResourceRail` ahora usa altura completa, estructura vertical y `nav` con scroll interno;
  - objetivo: que los menus tenant, restaurante y sucursal permanezcan completos y utilizables aunque el contenido de la vista sea largo.
- Ajuste visual de scrollbars:
  - se redujo el ancho de scrollbars globales para que no ensucien el glassmorphism;
  - se agrego clase `subtle-scrollbar` para rails, sidebar y contenido principal;
  - en los menus anidados el thumb queda casi invisible por defecto y aparece de forma sutil al hover;
  - se mantiene accesibilidad basica de scroll en navegadores con soporte de `scrollbar-width`.
- Correccion de consistencia de scrolls en rails:
  - se normalizo el comportamiento visual entre `TenantSidebar` y `ResourceRail`;
  - el contenedor que scrollea ya no carga padding lateral diferente; el padding vive en un wrapper interno;
  - los scrollbars internos quedan invisibles en reposo;
  - al hover se muestran como una linea de 2px, sin thumb ancho ni track visible.
- Experimento `norix-lab` de timeline contextual:
  - se creo `ContextTimelineBar` como barra superior de jerarquia visible solo en el preset `norix-lab`;
  - la barra vive debajo del topbar y encima de los rails/contenido;
  - reemplaza visualmente el breadcrumb pequeno por una lectura mas robusta tipo timeline;
  - cada nivel usa color de marca:
    - tenant: azul NORIX;
    - restaurante/marca: verde NORIX;
    - sucursal/unidad operativa: violeta NORIX;
  - los conectores ya no son solo `>`; se representan como lineas con punta, degradando del color del nivel padre al color del nivel hijo;
  - el ultimo segmento ocupa el resto del navbar para que la jerarquia se sienta como estructura de trabajo y no como breadcrumb corto;
  - en sucursal, el segmento de restaurante puede mostrarse compacto para coincidir con el rail padre contraido.
- Correccion del timeline contextual `norix-lab`:
  - el primer intento se percibio demasiado pesado y como pieza agregada;
  - el timeline ahora es una barra fija de ancho completo del portal, no solo del area de contenido;
  - queda arriba del menu tenant, rail restaurante, rail sucursal y contenido;
  - se redujo el lenguaje visual a lineas finas, puntos discretos y texto sobrio;
  - se oculto el breadcrumb pequeno dentro de `ResourceHeader` en `norix-lab` para evitar duplicidad de contexto;
  - el preset base `norix-original` conserva el breadcrumb tradicional.
- Correccion de solapamiento del timeline `norix-lab`:
  - el menu tenant seguia iniciando desde el alto completo del viewport y se encimaba con la barra contextual;
  - en vistas con `ContextTimelineBar`, el `TenantSidebar` baja por debajo de `topbar + timeline`;
  - se ajusta su altura a `calc(100vh - 6.25rem)`;
  - el workspace tambien baja bajo la barra contextual para mantener alineados los tres niveles.
- Sincronizacion del timeline con rails `norix-lab`:
  - `TenantSidebar` y `ResourceRail` ahora exponen `data-expanded` y `data-resource-level`;
  - el timeline usa esos estados para ajustar el ancho de sus segmentos;
  - si el menu tenant se expande, el segmento tenant y su conector tambien se expanden;
  - si el rail restaurante o sucursal se expanden, su segmento y la linea de union se ajustan al mismo ancho;
  - el texto de segmentos compactos permanece oculto hasta que el rail correspondiente se despliega;
  - se corrigio el segmento intermedio para que el link/chip use todo el ancho disponible y no quede cortado.
- Correccion de topbar `norix-lab`:
  - el topbar se acortaba al expandir el sidebar porque vivia dentro del area de contenido;
  - en vistas con timeline, el topbar ahora es una barra global fija de ancho completo;
  - el workspace baja `6.25rem` para respetar `topbar + timeline`;
  - el comportamiento del preset base queda sin cambios.
- Marca en topbar `norix-lab`:
  - se agrego `TopbarBrand` para mostrar logo y nombre NORIX en la barra superior;
  - en vistas con timeline, la marca se muestra en el topbar y se oculta la cabecera de marca del sidebar;
  - el sidebar queda dedicado a navegacion/contexto, no a identidad de marca;
  - se ajusto el ancho del buscador para que no compita con el bloque NORIX;
  - fuera del experimento con timeline, el comportamiento visual se mantiene como antes.
- Alineacion visual de tres rails `norix-lab`:
  - el sidebar tenant ahora usa las mismas medidas que los rails de restaurante y sucursal en vistas con timeline;
  - ancho compacto: `4.25rem`;
  - ancho expandido: `14rem`;
  - se agrego un control superior de navegacion/pin para tenant, equivalente al de `ResourceRail`;
  - se oculta el bloque redundante de contexto del tenant porque el timeline ya muestra la jerarquia;
  - se ajustaron paddings, ritmo de grupos y footer para que los tres rails se perciban como parte del mismo sistema.
- Correccion de centrado de rails compactos:
  - se elimino el `gap` residual entre icono y texto oculto en estado compacto;
  - los iconos de tenant, restaurante y sucursal quedan centrados realmente en el ancho de `4.25rem`;
  - el footer del tenant tambien centra su avatar en modo compacto;
  - los paddings compactos de tenant y `ResourceRail` quedan homologados.
- Correccion del panel de contexto tenant:
  - se restauro el panel/chip que indica el contexto tenant dentro del sidebar;
  - el timeline no reemplaza ese panel, solo muestra jerarquia global;
  - el chip tenant se mantiene alineado con los chips de restaurante y sucursal;
  - el control de navegacion/pin queda debajo del chip para conservar consistencia visual entre rails.
- Alineacion de altura de chips de contexto `norix-lab`:
  - los chips superiores de tenant, restaurante y sucursal ahora comparten altura minima;
  - en modo expandido usan `4.25rem`;
  - en modo compacto usan `3.25rem`;
  - se oculto el label externo `Contexto actual` en Lab para que el chip tenant empiece a la misma altura que los rails anidados;
  - se homologaron padding e icon size del chip tenant con `ResourceRail`.
- Correccion exacta de chips compactos `norix-lab`:
  - los tres chips superiores ya no usan solo `min-height`;
- en estado compacto usan altura fija moderada de `5.75rem`;
- el icono interno usa caja fija de `3.75rem`;
- tenant, restaurante y sucursal quedan con la misma tarjeta superior, mismo alto y mismo centro visual;
- se descarto la tarjeta vertical alta porque generaba hueco visual y se percibia ridicula.
- Restauracion visual de chips compactos:
  - se eliminaron hacks de posicionamiento absoluto que deterioraban el look original;
  - los chips compactos vuelven a ser tarjetas pequenas con tile interno centrado;
  - el wrapper interno de `ResourceRail` se alinea con grid para no desplazar el icono.
- Tonalidad por nivel `norix-lab`:
  - tenant mantiene tonada azul NORIX;
  - restaurante/marca usa tonada verde NORIX;
  - sucursal/unidad operativa usa tonada violeta NORIX;
  - el rail de sucursal ahora usa `accent="violet"`;
  - el estado activo dentro del rail de sucursal tambien cambia a violeta para mantener consistencia con el nivel.
- Consistencia del sidebar tenant `norix-lab`:
  - se detecto que el sidebar tenant regresaba al estilo original cuando no habia rails de restaurante/sucursal;
  - `/contexto` ahora tambien monta `ContextTimelineBar` con el nivel tenant;
  - esto activa las mismas reglas visuales de Lab para el sidebar tenant aunque sea el unico rail visible;
  - el sidebar tenant ya no cambia de personalidad entre la vista tenant pura y las vistas con rails anidados.
- Limpieza del experimento `norix-lab`:
  - se retiro `ContextTimelineBar` de las vistas tenant, restaurante y sucursal;
  - se elimino `TopbarBrand` y la reubicacion de marca hacia el topbar;
  - se quitaron los atributos/props usados solo para sincronizar timeline y rails (`data-resource-level`, `resourceLevel`, `context-workspace`);
  - se elimino el control duplicado `tenant-sidebar-control`;
  - se limpiaron los overrides CSS de `norix-lab` para que el preset vuelva a heredar el tema base;
  - se conservan los rails anidados funcionales y el acento violeta de sucursal, porque forman parte de la navegacion por contexto aprobada.
- Correccion de chips de contexto en rails:
  - se detecto que el chip tenant y los chips de `ResourceRail` no eran el mismo componente ni compartian medidas;
  - se creo `ContextRailChip` en `shared/ui`;
  - `TenantSidebar` y `ResourceRail` ahora renderizan el mismo chip para contexto actual;
  - se homologaron altura, padding, tile de icono, copy y transiciones mediante clases `rail-context-chip`;
  - el sidebar tenant usa las mismas medidas compacta/expandida que los rails anidados para evitar desalineacion visual.
- Correccion fina de alineacion de chips:
  - el chip tenant seguia viendose distinto porque en compacto su wrapper usaba `px-3` y el `ResourceRail` usaba `px-2`;
  - se homologaron los paddings compactos para que ambos chips tengan el mismo ancho real;
  - se retiro el label visible `Contexto actual` sobre el chip tenant porque empujaba solo ese nivel;
  - se agrego `resource-rail-top-spacer` para que los chips de restaurante/sucursal arranquen a la misma altura vertical que el chip tenant bajo la marca.
- Ajuste visual de chips anidados:
  - se mantuvo fijo el chip tenant;
  - se redujo `resource-rail-top-spacer` de `4.25rem` a `1.2rem` para subir los chips de restaurante/sucursal.
- Restauracion de efecto visual en chips de rails:
  - `ContextRailChip` ahora acepta `className` y expone `data-accent`;
  - `ResourceRail` aplica `rail-context-chip-resource` a los chips anidados;
  - se agrego glow radial suave, borde interno y hover con color del nivel (`green`, `violet`, `blue`);
  - despues se aplico el mismo efecto al chip tenant con acento azul, sin modificar medidas ni posicion.
- Switcher desde chips de rails:
  - los chips de `ResourceRail` ahora pueden abrir un selector de recurso debajo del chip;
  - el chip tenant no participa en este comportamiento;
  - el rail restaurante/marca carga restaurantes activos y permite cambiar de marca desde el chip;
  - el rail sucursal/unidad operativa lista las sucursales cargadas del restaurante y permite cambiar de unidad operativa;
  - el selector conserva el color del nivel mediante `data-accent`.
- Correccion del switcher en nivel restaurante:
  - el chip de restaurante/marca ahora siempre tiene selector, aun antes de terminar de cargar la lista de marcas;
  - si la query aun no trae datos, se muestra como minimo el restaurante/marca actual;
  - se agrego `switcherLabel` para diferenciar claramente `Cambiar restaurante / marca` y `Cambiar unidad operativa`.
- Ajuste de interaccion del switcher:
  - el indicador del chip cambia de `+/-` a chevron arriba/abajo;
  - el selector ya no empuja el menu lateral;
  - la lista ahora flota sobre el nav del rail como popover con blur, borde y sombra;
  - la apertura usa desplazamiento vertical sutil para sentirse como capa superpuesta.
- Jerarquia visual del rail tenant:
  - el sidebar tenant queda ligeramente mas robusto que los rails anidados;
  - ancho compacto tenant: `5rem`;
  - ancho expandido tenant: `17rem`;
  - los rails restaurante/sucursal conservan sus medidas compactas para sentirse subordinados al tenant.
- Experimento `norix-lab` glassmorphism:
  - se reactivo el preset `norix-lab` como modo de prueba visual;
  - el tema base `norix-original` queda sin tocar;
  - `norix-lab` aumenta transparencias, blur, saturacion, bordes luminosos, brillos internos y sombras;
  - se aplico vidrio fuerte a sidebar, topbar, headers, paneles, cards, botones, tablas, chips y switcher flotante;
  - objetivo: probar una direccion mas glassmorphism sin comprometer el tema estable.
- Limpieza de basura frontend:
  - se elimino `CollectionToolbar.tsx` porque quedo sin uso despues de migrar la coleccion a `DataTable`;
  - se quitaron estilos muertos: `glass-toolbar`, `breadcrumb-glass`, `scope-glass`;
  - se quitaron clases/keyframes sin consumidor: `animate-norix-*`, `norix-fade-up`, `norix-slide-right`, `norix-border-pulse`;
  - se verifico que no queden referencias a `ContextTimelineBar`, `TopbarBrand`, `context-timeline`, `tenant-sidebar-control` ni `resourceLevel`;
  - se verifico que no exista `dist`, `.build-check` ni `.data-protection-keys` dentro de `Norix.App`;
  - validacion: `npm.cmd run build` y `npm.cmd run lint` exitosos.
- Restauracion visual de login:
  - el login vuelve a usar su composicion visual propia con `brand-grid`, `brand-ribbon` y glows;
  - se retiro el uso de `norix-portal` en la pantalla de login para no mezclarla con el shell interno;
  - se eliminaron las clases temporales `login-card`, `login-brand-pill` y `login-session-panel`;
  - el portal autenticado conserva su fondo y glass actuales sin afectar la pantalla de acceso.

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
- Revision de pestanas en `Restaurantes / Marcas`:
  - la ruta `/tenant/restaurantes` es una coleccion administrativa del tenant;
  - no debe llevar pestanas porque todavia no se esta administrando un recurso especifico;
  - se quitaron las pestanas de la coleccion para dejar la tabla mas limpia;
  - las pestanas se conservan solamente al abrir una marca especifica en `/tenant/restaurantes/{id}`;
  - las pestanas utiles del contexto `Restaurante / Marca` quedan alineadas a:
    - `Informacion general`;
    - `Sucursales`;
    - `Catalogo`;
    - `Acceso`;
    - `Actividad`;
    - `Configuracion`.
- Validacion despues de revisar pestanas:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste de acomodo visual tipo Azure:
  - el header del recurso ahora prioriza breadcrumb, titulo, tipo de recurso, ID y barra de acciones;
  - se quito el bloque explicativo grande del contexto tenant para acercarlo al patron de Azure Portal;
  - `CommandBar` dejo de verse como card/botonera flotante y ahora se muestra como barra horizontal de acciones con separadores;
  - las tabs del recurso quedan pegadas al bloque superior, como navegacion secundaria del recurso;
  - el mismo acomodo se aplico a:
    - `/contexto`;
    - `/tenant/restaurantes`;
    - `/tenant/restaurantes/{id}`.
- Validacion despues del ajuste de acomodo:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste de topbar:
  - el buscador global quedo centrado en la barra superior;
  - los iconos de acciones globales permanecen alineados a la derecha;
  - se aplico en `/contexto`, `/tenant/restaurantes` y `/tenant/restaurantes/{id}`.
- Validacion despues de centrar buscador:
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

### Shells segun alcance de autorizacion

- La navegacion principal del portal dependera del alcance inicial autorizado del usuario.
- La misma vista de recurso puede mostrarse dentro de una jerarquia superior o como raiz del usuario, segun sus permisos.
- Un usuario con alcance global de tenant vera:

```text
TenantShell
  -> recurso Restaurante / Marca abierto como rail anidado
```

- Un usuario con alcance solamente de restaurante/marca vera:

```text
RestaurantShell
  -> Restaurante / Marca como contexto raiz
```

- En ese caso no vera el menu global del tenant, porque para ese usuario el tenant no es su espacio de trabajo administrable.
- Un usuario con alcance operativo vera:

```text
OperationalShell
  -> Unidad Operativa / Sucursal como contexto raiz
```

- Cada shell tendra su propio menu principal:
  - `TenantShell`: gobierno corporativo, directorio, acceso, actividad y configuracion global del inquilino.
  - `RestaurantShell`: informacion de marca, sucursales, catalogo, acceso de marca, actividad y configuracion de marca.
  - `OperationalShell`: operacion diaria, mesas, comandas, cocina, caja, pagos, personal, dispositivos y configuracion local.
- Los rails anidados se usaran cuando un usuario navegue hacia recursos hijos desde un shell superior.
- Si el usuario inicia directamente en un alcance inferior, ese rail se convierte conceptualmente en su sidebar principal.
- Esto evita duplicar pantallas:
  - la vista de `Restaurante / Marca` debe poder renderizarse dentro de `TenantShell` o como raiz de `RestaurantShell`;
  - la vista de `Unidad Operativa / Sucursal` debe poder renderizarse dentro de `RestaurantShell` o como raiz de `OperationalShell`.
- La autorizacion manda la navegacion visible:
  - no se mostraran niveles superiores que el usuario no pueda administrar;
  - si necesita contexto informativo superior, se mostrara como breadcrumb o etiqueta de solo lectura, no como menu administrable.

### Patron de edicion de recursos

- NORIX usara tres patrones de edicion segun el peso de la accion.
- Regla base:

```text
Edicion simple: panel lateral derecho
Edicion compleja: vista principal del recurso
Confirmacion corta: modal
```

- Panel lateral derecho:
  - sera el patron por defecto para CRUDs y cambios simples;
  - mantiene visible el contexto actual o la coleccion;
  - aplica para editar nombre, codigo, descripcion, logo, estado, datos basicos, asignaciones simples o propiedades cortas;
  - debe sentirse como una hoja lateral de recurso, no como modal flotante;
  - debe incluir titulo claro, descripcion breve, acciones principales y botones de guardar/cancelar.
- Vista principal del recurso:
  - se usara para configuraciones pesadas o flujos de varias secciones;
  - aplica para catalogos completos, permisos complejos, reglas de impresion, configuracion fiscal/comercial, onboarding de sucursal o flujos multi-paso;
  - reemplaza el contenido principal, pero conserva el shell y el contexto activo.
- Modal:
  - se usara solo para confirmaciones cortas o acciones delicadas;
  - aplica para desactivar, eliminar, revocar sesion, resetear password, cancelar cambios o confirmar acciones irreversibles;
  - no se usara para formularios grandes.
- Decision actual:
  - el CRUD de `Restaurantes / Marcas` mantiene panel lateral derecho para crear/editar;
  - mas adelante se pulira visualmente como hoja de recurso tipo Azure.
- Avance implementado del patron:
  - desde la coleccion `/tenant/restaurantes`, crear y editar se mantiene en panel lateral derecho;
  - dentro del recurso `/tenant/restaurantes/{id}`, no existe pestana `Editar`;
  - `Informacion basica` ahora tiene accion contextual `Editar`;
  - la accion abre un panel lateral derecho con los campos editables del restaurante/marca;
  - al guardar se actualiza el recurso por API y se refrescan el detalle y la coleccion;
  - se mantiene la regla: editar es accion de seccion, no pestana del recurso.
- Validacion despues de aplicar edicion contextual:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Limpieza del overview de recurso:
  - se quitaron los subpaneles laterales redundantes de `Informacion basica`;
  - el overview de `/tenant/restaurantes/{id}` queda enfocado en datos reales del recurso;
  - las acciones de sucursales/acceso se moveran a sus pestañas o secciones correspondientes cuando se implementen.
- Validacion despues de limpiar subpaneles:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Limpieza de metricas superiores en recurso:
  - se quitaron los cards grandes de `Sucursales`, `Activas`, `Inactivas` y `Ventas`;
  - esos datos no deben competir con la identidad del recurso en el overview;
  - el estado y conteo de sucursales ahora se muestran como metadata compacta/chips dentro de `Informacion basica`;
  - las metricas operativas se agregaran despues solamente cuando existan datos reales de operacion;
  - arriba del recurso se reservara espacio para alertas accionables, no para KPIs decorativos.
- Validacion despues de quitar metricas superiores:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Tema claro NORIX:
  - se agrego soporte inicial de tema claro sin duplicar pantallas ni componentes;
  - el tema se guarda en `localStorage` con la llave `norix.theme`;
  - el tema se aplica en `document.documentElement.dataset.theme`;
  - se agrego `ThemeToggle` en el topbar global;
  - el icono cambia entre sol/luna y permite alternar tema oscuro/claro;
  - se agregaron overrides globales para superficies, sidebar, topbar, headers, botones, tablas, texto, bordes y fondos;
  - el tema claro usa estilo corporativo tipo Azure claro: fondo gris azulado, paneles blancos, texto grafito y acentos NORIX;
  - se separo la logica de tema en `src/lib/theme.ts` para evitar warnings de Fast Refresh.
- Validacion despues del tema claro:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste visual del tema claro:
  - el primer tema claro se percibia demasiado plano;
  - se aumento el efecto glass con superficies mas translucidas, blur mas fuerte, saturacion, brillos internos y sombras suaves;
  - se agregaron tintes sutiles azul/verde/violeta en paneles, sidebar, topbar, headers, botones y chips;
  - el tema claro debe mantener lectura corporativa clara, pero conservar la identidad glassmorphism de NORIX.
- Validacion despues de reforzar glass en tema claro:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Ajuste visual del tema oscuro:
  - se redujo el brillo blanco diagonal de paneles y cards porque se percibia como plantilla/neon;
  - se bajo la intensidad del fondo con menos glow y grid mas sutil;
  - se recupero el glassmorphism oscuro con mayor translucidez, blur y saturacion;
  - se reemplazo el brillo blanco plano por reflejos suaves, tintes NORIX y bordes luminosos discretos;
  - el sidebar y topbar quedaron mas corporativos, con sombras finas y menos translucidez excesiva;
  - los acentos activos se inclinan mas a azul NORIX con verde como apoyo;
  - el objetivo del dark queda: glass premium enterprise, no dashboard neon ni paneles solidos.
- Validacion despues de ajustar tema oscuro:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Convencion de bordes:
  - NORIX usara esquinas tecnicas y moderadas, no componentes excesivamente redondeados;
  - controles, inputs, tablas, tarjetas y chips de navegacion bajan a radios de 6-8px;
  - los radios grandes se reservan para elementos naturalmente circulares como avatares, iniciales y badges/status pequeños;
  - se redujeron `rounded-lg`/`rounded-2xl` en shell, CRUDs y login para acercar el producto a un lenguaje enterprise tipo Azure.
- Validacion despues de ajustar bordes:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Centralizacion de paleta NORIX:
  - se confirmo que la paleta oficial usada por el frontend es:
    - Azul profundo: `#080f19`;
    - Gris grafito: `#141a24`;
    - Azul NORIX: `#2563ff`;
    - Verde NORIX: `#22d3a6`;
    - Violeta: `#7c4dff`;
    - Gris claro: `#e2e6f0`.
  - se agregaron canales RGB oficiales para poder crear transparencias sin inventar colores:
    - `--norix-rgb-deep`;
    - `--norix-rgb-graphite`;
    - `--norix-rgb-blue`;
    - `--norix-rgb-green`;
    - `--norix-rgb-violet`;
    - `--norix-rgb-light`.
  - se crearon tokens semanticos de material:
    - `--surface-page`;
    - `--surface-glass`;
    - `--surface-sidebar`;
    - `--surface-topbar`;
    - `--surface-header`;
    - `--surface-button`;
    - `--surface-button-hover`;
    - `--surface-panel-sheen`;
    - `--surface-context`;
    - `--surface-breadcrumb`;
    - `--surface-map`;
    - `--line-soft`;
    - `--line-strong`;
    - `--shadow-glass`;
    - `--text-main`;
    - `--text-muted`.
  - los temas oscuro y claro redefinen esos tokens, pero no introducen una paleta nueva;
  - se elimino el color manual del login y se reemplazo por `bg-norix-graphite/88`;
  - se reemplazaron sombras y fondos arbitrarios por variables derivadas de la paleta;
  - regla: cualquier color visual fuerte debe salir de la paleta NORIX; los matices se logran con alfa/gradientes usando los canales RGB oficiales.
- Validacion despues de centralizar paleta:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
  - barrido de colores: solo quedan hex oficiales de la paleta en `index.css`.
- Ajuste de paneles glass:
  - se elimino el gradiente blanco/sheen diagonal de `glass-panel` y `glass-card`;
  - el glass debe apoyarse en translucidez, blur, borde y sombra, no en una mancha blanca encima;
  - `--surface-panel-sheen` queda reducido a una sombra vertical muy sutil para profundidad.
- Validacion despues de quitar sheen blanco:
  - `npm.cmd run build` exitoso.
  - `npm.cmd run lint` exitoso.
- Fondo para resaltar glass:
  - se agrego estructura visual sutil detras de los paneles para que el glass tenga profundidad;
  - el fondo usa bandas lineales finas, grid discreto y tintes suaves derivados de la paleta NORIX;
  - se evitan orbs/manchas decorativas pesadas;
  - la intencion es que el vidrio se lea por transparencia y blur contra un fondo con textura controlada.
- Validacion despues de agregar fondo:
  - `npm.cmd run lint` exitoso.
  - `npm.cmd run build` exitoso al ejecutarlo solo; una ejecucion paralela inicial de Vite fallo por emision de `index.html` con ruta absoluta y no se reprodujo.
- Preview externo recibido:
  - se reviso el archivo `norix-console.tsx` como prototipo enviado por un colega;
  - se monto temporalmente como preview para evaluarlo;
  - despues de la revision de limpieza se retiro del proyecto para no dejar codigo prototipo con `// @ts-nocheck`;
  - no forma parte del producto real de NORIX.
- Limpieza de proyecto:
  - se elimino `Norix.App/src/features/prototypes/NorixConsolePreview.tsx`;
  - se elimino la ruta temporal `/preview/norix-console`;
  - se elimino `NORIX_LOGIN_ESTILOS_RESPALDO.css` porque era un respaldo viejo de estilos;
  - se conservaron `node_modules`, `bin` y `obj` solo como artefactos locales ignorados por git.

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
- Overview de recurso estilo Azure:
  - en `/tenant/restaurantes/{id}` se agrego seccion `Informacion basica`;
  - muestra avatar/logo grande con inicial de la marca;
  - muestra propiedades del recurso en formato de filas:
    - Nombre;
    - Codigo;
    - Id del objeto;
    - Id del inquilino;
    - Estado;
    - Logo URL;
    - Sucursales totales;
    - Sucursales activas.
  - se agregaron cards laterales para estado de marca, sucursales y acceso;
  - de momento se muestran todos los datos disponibles y despues se afinara que se conserva.
- Validacion despues del overview estilo Azure:
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

## Arquitectura backend acordada

La API se organizara con una arquitectura por capas y modulos, manteniendo el codigo cerca del dominio sin volverlo innecesariamente abstracto en esta etapa.

Capas principales:

```text
Domain
  Entidades, value objects, enums y reglas puras del dominio.

Application
  Casos de uso, DTOs, validaciones, contratos e interfaces que necesita la aplicacion.

Infrastructure
  EF Core, PostgreSQL, Identity, Redis, JWT, implementaciones de servicios externos y persistencia.

Api
  Endpoints, middlewares, configuracion DI, autenticacion, autorizacion y respuestas HTTP.
```

Modulos principales previstos:

```text
Tenancy
Identity
Restaurants
OperationalUnits
Catalog
Printing
TechnologyAssets
```

Reglas de implementacion:

- Los endpoints no contienen logica de negocio; reciben request, validan entrada basica, llaman un caso de uso/servicio de aplicacion y devuelven response.
- Los casos de uso validan contexto, permisos y reglas del dominio antes de persistir cambios.
- La autorizacion se mantiene separada por nivel: inquilino, restaurante/marca y unidad operativa/sucursal.
- El frontend manda el contexto activo con headers; el backend no confia en el frontend y siempre valida contra la sesion Redis.
- El JWT se mantiene minimo (`sub`, `sid`, `exp`); los permisos y alcances viven en Redis para poder recalcularlos sin inflar claims.
- PostgreSQL RLS queda preparado porque el contexto activo esta centralizado en `ICurrentUser` e `ICurrentContext`.

Decision sobre repositorios y unidad de trabajo:

- No se agregara un patron Unit of Work propio de forma general, porque `DbContext` ya funciona como unidad de trabajo en EF Core: rastrea cambios y confirma todo junto con `SaveChangesAsync`.
- No se crearan repositorios genericos tipo `IRepository<T>` para todas las entidades. En este proyecto agregarian ceremonia sin dar mucho valor, esconderian capacidades utiles de EF Core y complicarian queries reales.
- Si un modulo necesita consultas complejas, reutilizables o muy expresivas, se crearan repositorios o query services especificos, por ejemplo `IRestaurantReadService`, `ITenantAccessRepository` o `IOperationalAssignmentRepository`.
- Para escritura simple de CRUDs se podra usar `AppDbContext` directamente desde servicios/casos de uso de aplicacion, cuidando que la logica de negocio no quede en endpoints.
- Si despues aparecen transacciones que crucen varios agregados o integraciones externas, se evaluara agregar un `IUnitOfWork` delgado que envuelva `SaveChangesAsync`, pero no como abstraccion inicial obligatoria.

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

## Despliegue Coolify

- Se decidio preparar el despliegue con contenedores separados por responsabilidad:
  - `web`: React/Vite compilado y servido por Nginx.
  - `api`: ASP.NET Core 9 como Web API pura.
  - `postgres`: PostgreSQL 16 con volumen persistente.
  - `redis`: Redis 7 con AOF y password.
- El dominio publico debe apuntar al servicio `web` en puerto interno `80`.
- El frontend consume la API por ruta relativa `/api`; Nginx reenvia esas peticiones al servicio interno `api:8080`.
- Esta decision evita CORS en la primera etapa y mantiene la cookie `httpOnly`, `Secure`, `SameSite=Strict` funcionando bajo el mismo origen publico.
- PostgreSQL y Redis quedan privados dentro de la red del compose; no se recomienda exponerlos publicamente.
- Se agregaron archivos de despliegue:
  - `docker-compose.coolify.yml`
  - `RestauranteSaaS.Api/Dockerfile`
  - `Norix.App/Dockerfile`
  - `Norix.App/nginx.conf`
  - `DEPLOY_COOLIFY.md`
- Pendiente para produccion real: job de migraciones, backups automaticos de PostgreSQL y seed controlado sin passwords demo.

## Pendientes

- Actualizar `ConnectionStrings:Postgres` con el password/usuario real de la BD local.
- Preparar job de migraciones para despliegue en Coolify.
- Conectar el header `X-Tenant-Id` del frontend al contexto activo en Zustand; actualmente `/tenant/restaurantes` usa el tenant del seed para avanzar el slice.
- Alinear seed/permisos finales para validar `restaurantes.ver`, `restaurantes.crear`, `restaurantes.editar` y `restaurantes.desactivar` desde backend.
- Ejecutar:

```powershell
dotnet ef database update --project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --startup-project RestauranteSaaS.Api\RestauranteSaaS.Api.csproj --no-build
```

- Probar runtime con PostgreSQL y Redis reales levantados.
- Crear seed minimo de usuario/asignaciones/permisos para validar login extremo a extremo.
- Agregar interceptor para preparar variables de RLS en PostgreSQL.
