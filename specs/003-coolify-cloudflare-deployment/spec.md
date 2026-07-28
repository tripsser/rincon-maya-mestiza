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

## Dominios

- `coolify.norix.fit`: panel Coolify.
- `app.norix.fit`: aplicacion NORIX.
- `ssh.norix.fit`: acceso SSH al host mediante Cloudflare Access.

## Principios

- Frontend y backend van en contenedores separados.
- PostgreSQL y Redis pueden vivir en el mismo compose para esta etapa.
- El Cloudflare Tunnel debe vivir en el host y apuntar a `https://localhost:443`.
- Coolify proxy enruta por dominio al recurso correcto.
- No se deben usar IPs dinamicas de contenedor como origen del tunnel.

## Criterios De Aceptacion

- [x] Coolify levanta el recurso Docker Compose.
- [x] App levanta con `web`, `api`, `postgres`, `redis`.
- [x] Compose de NORIX no incluye `cloudflared`.
- [x] Tunnel del host puede entrar por `https://localhost:443` con `No TLS Verify`.
- [x] SSH al host funciona con `ssh norix-host`.
- [ ] Documentar variables exactas requeridas.
- [ ] Documentar troubleshooting de realtime Coolify.
- [ ] Validar migraciones y seed en despliegue limpio.
