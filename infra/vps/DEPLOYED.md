# Despliegue REAL en el VPS MAW (`31.220.109.7`, `maw-vps`)

> Este archivo describe lo que está **efectivamente corriendo** en el VPS.
> El `docker-compose.yml` / `Caddyfile` de esta carpeta describían un despliegue
> con Caddy autónomo que **NO aplica** aquí: el VPS es un servidor compartido
> donde **nginx** ya ocupa 80/443 y ya existe un MinIO (`fiscal-minio`). Se
> integró con lo existente en vez de duplicarlo.

## Topología

| Servicio | Cómo | Host público |
|---|---|---|
| Storage (S3) | Se **reutiliza `fiscal-minio`** con un bucket y una llave propios de COMENOR | `https://comenor-storage.appsoluciones.duckdns.org` |
| Conversión Office→PDF | Contenedor `comenor-gotenberg` (`gotenberg/gotenberg:8`) en `127.0.0.1:3502` | `https://comenor-docs.appsoluciones.duckdns.org` (token Bearer) |
| Gateway MinIO→host | `comenor-minio-gw` (`alpine/socat`) publica `fiscal-minio:9000` en `127.0.0.1:9002` para que nginx lo alcance | — |
| Proxy + TLS | nginx (vhosts `comenor-storage` / `comenor-docs`) + certbot (Let's Encrypt) | — |
| DNS | DuckDNS wildcard: `*.appsoluciones.duckdns.org` → `31.220.109.7` | — |

## MinIO — bucket y credenciales

- Bucket físico único: **`comenor`** (privado).
- Usuario de servicio **`comenorapp`** con política `comenor-rw` (S3:* SOLO sobre el bucket `comenor`).
- Política anónima de **solo-descarga en el prefijo `eventos/`** (imágenes públicas de eventos).
  `documentos/` y `memorias/` quedan **privados** (verificado: 403 sin credenciales).
- La llave (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`) y el `GOTENBERG_TOKEN`
  están respaldados en el VPS en `/root/comenor-s3.txt` (chmod 600).

## Reproducir / reinstalar (por SSH como root)

```bash
# 1) Bucket + usuario scoped (usa las creds root de fiscal-minio, no las expone)
RU=$(docker inspect fiscal-minio -f '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^MINIO_ROOT_USER=//p')
RP=$(docker inspect fiscal-minio -f '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^MINIO_ROOT_PASSWORD=//p')
SECRET=$(openssl rand -hex 24)
printf '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*"],"Resource":["arn:aws:s3:::comenor","arn:aws:s3:::comenor/*"]}]}' > /tmp/comenor-rw.json
docker run --rm --network container:fiscal-minio -e MC_HOST_fm="http://$RU:$RP@localhost:9000" -e NEW_SECRET="$SECRET" -v /tmp/comenor-rw.json:/tmp/comenor-rw.json:ro --entrypoint sh minio/mc -c '
  mc mb -p fm/comenor; mc admin user add fm comenorapp "$NEW_SECRET";
  mc admin policy create fm comenor-rw /tmp/comenor-rw.json;
  mc admin policy attach fm comenor-rw --user comenorapp;
  mc anonymous set download fm/comenor/eventos'

# 2) Gotenberg + gateway MinIO
docker run -d --name comenor-gotenberg --restart unless-stopped -p 127.0.0.1:3502:3000 gotenberg/gotenberg:8
docker run -d --name comenor-minio-gw --restart unless-stopped --network fiscal-webapp_fiscal -p 127.0.0.1:9002:9000 alpine/socat tcp-listen:9000,fork,reuseaddr tcp-connect:fiscal-minio:9000

# 3) nginx: vhosts comenor-storage (→127.0.0.1:9002, client_max_body_size 512M)
#    y comenor-docs (→127.0.0.1:3502, exige Authorization: Bearer $GOTENBERG_TOKEN)
#    luego:  certbot --nginx -d comenor-storage.appsoluciones.duckdns.org -d comenor-docs.appsoluciones.duckdns.org
```

## Rollback

```bash
docker rm -f comenor-gotenberg comenor-minio-gw
rm /etc/nginx/sites-enabled/comenor-storage /etc/nginx/sites-enabled/comenor-docs
nginx -t && systemctl reload nginx
# El bucket comenor y el usuario comenorapp pueden quedarse (aislados) o borrarse con mc.
```

## Variables para Vercel (contrato en `.env.example`)

```
S3_ENDPOINT=https://comenor-storage.appsoluciones.duckdns.org
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=comenorapp
S3_SECRET_ACCESS_KEY=<en /root/comenor-s3.txt>
S3_BUCKET=comenor
S3_PUBLIC_URL=https://comenor-storage.appsoluciones.duckdns.org/comenor
GOTENBERG_URL=https://comenor-docs.appsoluciones.duckdns.org
GOTENBERG_TOKEN=<en /root/comenor-s3.txt>
```
