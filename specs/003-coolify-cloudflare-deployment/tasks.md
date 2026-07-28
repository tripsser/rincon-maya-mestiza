# Tasks: Coolify Cloudflare Deployment

## Hecho

- [x] Crear `docker-compose.coolify.yml`.
- [x] Separar servicios `web` y `api`.
- [x] Agregar PostgreSQL y Redis.
- [x] Quitar `cloudflared` del compose de NORIX.
- [x] Preparar variables Coolify para passwords y JWT.
- [x] Configurar SSH local con `cloudflared access ssh`.
- [x] Confirmar acceso SSH al host.
- [x] Confirmar patron de tunnel host hacia `https://localhost:443`.

## Pendiente

- [ ] Crear guia corta de variables Coolify.
- [ ] Crear guia corta de Cloudflare Tunnel host/app.
- [ ] Revisar warning realtime de Coolify.
- [ ] Definir backups PostgreSQL.
- [ ] Definir estrategia de migraciones en produccion.
