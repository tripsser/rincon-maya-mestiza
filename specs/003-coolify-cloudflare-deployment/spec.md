# Spec: Coolify Cloudflare Deployment

## Estado

Implementada parcialmente

## Objetivo

Desplegar NORIX en Coolify con servicios separados y acceso estable mediante Cloudflare Tunnel.

## Servicios

- `web`: frontend Vite servido con Nginx.
- `api`: ASP.NET Core Web API.
- `postgres`: base de datos PostgreSQL.
- `redis`: sesiones distribuidas.
- `cloudflared`: tunnel de aplicacion hacia Cloudflare.

## Dominios

- `coolify.norix.fit`: panel Coolify.
- `app.norix.fit`: aplicacion NORIX.
- `ssh.norix.fit`: acceso SSH al host mediante Cloudflare Access.

## Principios

- Frontend y backend van en contenedores separados.
- PostgreSQL y Redis pueden vivir en el mismo compose para esta etapa.
- El tunnel de app debe apuntar al nombre del servicio Docker, no a IP dinamica.
- El host puede tener tunnel propio para Coolify y SSH.

## Criterios De Aceptacion

- [x] Coolify levanta el recurso Docker Compose.
- [x] App levanta con `web`, `api`, `postgres`, `redis`.
- [x] Tunnel de app usa variable `CLOUDFLARE_TUNNEL_TOKEN`.
- [x] SSH al host funciona con `ssh norix-host`.
- [ ] Documentar variables exactas requeridas.
- [ ] Documentar troubleshooting de realtime Coolify.
- [ ] Validar migraciones y seed en despliegue limpio.

