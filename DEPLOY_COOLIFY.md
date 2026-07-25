# Deploy NORIX en Coolify

## Arquitectura recomendada

El despliegue queda separado por servicio, pero orquestado desde un solo `docker-compose.coolify.yml`:

```text
web       React/Vite servido por Nginx
api       ASP.NET Core 9 Web API
postgres  PostgreSQL 16
redis     Redis 7
```

El dominio publico debe apuntar al servicio `web`. Nginx sirve el frontend y reenvia `/api/*` al servicio interno `api:8080`, evitando CORS para este primer despliegue.

## Recurso en Coolify

Crear un recurso tipo **Docker Compose** usando:

```text
docker-compose.coolify.yml
```

En Coolify, asignar el dominio al servicio:

```text
web : 80
```

Ejemplo:

```text
https://app.tudominio.com -> web:80
```

El API queda interno para el frontend:

```text
https://app.tudominio.com/api
```

## Variables y secretos

El compose usa variables magicas de Coolify para generar secretos estables del recurso:

- `SERVICE_PASSWORD_POSTGRES`
- `SERVICE_PASSWORD_REDIS`
- `SERVICE_PASSWORD_64_JWT`

Por eso no es necesario capturar manualmente `POSTGRES_PASSWORD`, `REDIS_PASSWORD` ni `JWT_SIGNING_KEY` en Coolify para el primer deploy. Si ya se agregaron variables duplicadas en la UI, se pueden borrar para evitar confusion.

Valores fijos del primer despliegue:

```text
POSTGRES_DB=restaurante_saas
POSTGRES_USER=norix
JWT_ISSUER=Norix
JWT_AUDIENCE=Norix
JWT_EXPIRATION_MINUTES=15
SESSION_EXPIRATION_MINUTES=15
```

Si despues se quieren secretos administrados manualmente, se puede cambiar el compose, pero para Coolify conviene dejar que genere y persista estos valores.

## Red interna

Los servicios se comunican por nombre dentro de Docker:

```text
web -> api:8080
api -> postgres:5432
api -> redis:6379
```

PostgreSQL y Redis no necesitan dominio publico para esta etapa.

## DNS y acceso local

Si desde internet abre pero desde tu red local no, probablemente el modem/router no soporta NAT loopback/hairpin.

Soluciones:

- Probar desde datos moviles para validar acceso publico.
- Usar DNS local/Pi-hole/hosts apuntando el dominio a la IP privada si aplica.
- Entrar por IP privada local si el VPS esta en la misma red.
- Activar NAT loopback si el router lo permite.

## Base de datos

El compose levanta PostgreSQL vacio. Para este primer despliegue la API puede aplicar migraciones y seed al arrancar:

```text
DATABASE_APPLY_MIGRATIONS_ON_STARTUP=true
DATABASE_SEED_INITIAL_DATA_ON_STARTUP=true
```

Estos valores quedan `true` por defecto en `docker-compose.coolify.yml`.

El seed inicial se copia dentro de la imagen del API como:

```text
/app/seeds/initial_multitenant.sql
```

El seed es idempotente para el demo porque usa `ON CONFLICT`, pero en cuanto empieces a guardar datos reales conviene apagarlo:

```text
DATABASE_SEED_INITIAL_DATA_ON_STARTUP=false
```

Opciones:

- Mantener migraciones al arranque durante desarrollo/staging.
- Crear despues un job/servicio de migraciones.
- Crear un pipeline de migraciones controlado para staging/produccion.

Pendiente recomendado:

- Crear un job de migracion separado para Coolify.
- Crear seed de staging/produccion controlado, sin password demo.
- Definir backups automaticos de PostgreSQL antes de meter datos reales.

## Validacion rapida

1. Abrir `https://app.tudominio.com`.
2. Iniciar sesion.
3. Confirmar que `/api/auth/login` responde `200`.
4. Confirmar que la cookie `access_token` se guarda como `Secure`.
5. Refrescar rutas del frontend como `/tenant/restaurantes` y confirmar que Nginx devuelve `index.html`.
