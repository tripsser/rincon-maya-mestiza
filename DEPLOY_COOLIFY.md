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

## Variables requeridas

Configurar en Coolify:

```env
POSTGRES_DB=restaurante_saas
POSTGRES_USER=norix
POSTGRES_PASSWORD=CAMBIAR_PASSWORD
REDIS_PASSWORD=CAMBIAR_PASSWORD_REDIS
JWT_ISSUER=Norix
JWT_AUDIENCE=Norix
JWT_SIGNING_KEY=CAMBIAR_POR_UN_SECRETO_LARGO_DE_MINIMO_32_CARACTERES
JWT_EXPIRATION_MINUTES=15
SESSION_EXPIRATION_MINUTES=15
```

`JWT_SIGNING_KEY` debe ser largo y secreto. No usar valores de desarrollo.

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

El compose levanta PostgreSQL vacio. Despues del primer deploy hay que aplicar migraciones y seed.

Opciones:

- Ejecutar migraciones desde tu maquina apuntando al Postgres por tunel/VPN.
- Agregar despues un job/servicio de migraciones.
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
