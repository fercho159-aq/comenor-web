# RUNBOOK — operación de COMENOR

Guía operativa de la infraestructura. La **app** corre en Vercel; el **VPS MAW
Soluciones** hospeda solo MinIO (almacenamiento S3) + Gotenberg (conversión a
PDF), detrás de Caddy con TLS automático. La **base de datos** es Neon Postgres
(gestionada, fuera del VPS).

Topología: `docs/DECISIONES.md` (ADR-006). Contrato de variables: `.env.example`
(app) e `infra/vps/.env.vps.example` (VPS).

---

## 1. Desplegar el VPS por primera vez

### 1.1 Requisitos en el VPS

- Docker Engine + plugin `docker compose` v2.
- Puertos 80 y 443 abiertos en el firewall (los únicos públicos).
- Acceso SSH con usuario con permisos de Docker.

### 1.2 DNS

En el proveedor DNS de `comenor.org.mx`, crea dos registros **A** (o AAAA)
apuntando a la IP pública del VPS. Deben resolver ANTES de arrancar Caddy o el
proceso ACME falla:

```
storage.comenor.org.mx   A   <IP_DEL_VPS>
docs.comenor.org.mx      A   <IP_DEL_VPS>
```

Verifica la propagación:

```bash
dig +short storage.comenor.org.mx
dig +short docs.comenor.org.mx
```

### 1.3 Copiar la infra y configurar secretos

```bash
# En tu máquina: sube la carpeta infra/vps al VPS.
scp -r infra/vps usuario@<IP_DEL_VPS>:/opt/comenor

# En el VPS:
ssh usuario@<IP_DEL_VPS>
cd /opt/comenor
cp .env.vps.example .env.vps

# Genera secretos fuertes y edítalos en .env.vps:
openssl rand -hex 24      # MINIO_ROOT_USER   (o un nombre corto)
openssl rand -hex 24      # MINIO_ROOT_PASSWORD
openssl rand -base64 48   # GOTENBERG_TOKEN
```

Edita `.env.vps` con `nano`/`vim`: dominios, `ACME_EMAIL`, credenciales root de
MinIO y `GOTENBERG_TOKEN`.

### 1.4 Arrancar

```bash
docker compose --env-file .env.vps up -d
docker compose --env-file .env.vps ps          # los 3 servicios "healthy"
docker compose --env-file .env.vps logs -f caddy   # confirma emisión de TLS
```

### 1.5 Crear el bucket y la llave de servicio de la app (con `mc`)

MinIO no expone su consola públicamente. Todo se hace por `mc` dentro del
contenedor. La app **no** usa las credenciales root: se le crea una llave de
servicio acotada al bucket.

```bash
# Alias 'local' apuntando al MinIO interno con las credenciales root.
docker compose --env-file .env.vps exec minio \
  mc alias set local http://localhost:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

# Bucket físico único, privado (coincide con S3_BUCKET del .env.example).
docker compose --env-file .env.vps exec minio mc mb --ignore-existing local/comenor

# Confirma que NO tiene acceso anónimo (privado por defecto).
docker compose --env-file .env.vps exec minio mc anonymous get local/comenor

# Política acotada al bucket 'comenor' para la app.
docker compose --env-file .env.vps exec minio sh -c 'cat > /tmp/comenor-app.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject","s3:PutObject","s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::comenor/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::comenor"]
    }
  ]
}
JSON'
docker compose --env-file .env.vps exec minio mc admin policy create local comenor-app /tmp/comenor-app.json

# Usuario de servicio (estas dos cadenas van a Vercel como
# S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY). Genera un secret fuerte.
APP_KEY=comenor-app
APP_SECRET=$(openssl rand -base64 32)
docker compose --env-file .env.vps exec minio mc admin user add local "$APP_KEY" "$APP_SECRET"
docker compose --env-file .env.vps exec minio mc admin policy attach local comenor-app --user "$APP_KEY"
echo "S3_ACCESS_KEY_ID=$APP_KEY"
echo "S3_SECRET_ACCESS_KEY=$APP_SECRET"   # guárdalo YA; no se vuelve a mostrar
```

> Opcional: si el prefijo `eventos/` debe servirse como URL pública estable
> (portadas del calendario), configura una política de solo-lectura anónima
> únicamente para ese prefijo y define `S3_PUBLIC_URL` en la app. Documentos y
> memorias JAMÁS son públicos.

### 1.6 Configurar la app en Vercel

En el dashboard de Vercel, variables de entorno (producción):

```
DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_SITE_URL,
ADMIN_ALLOWED_EMAILS,
S3_ENDPOINT=https://storage.comenor.org.mx, S3_REGION=us-east-1,
S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET=comenor,
GOTENBERG_URL=https://docs.comenor.org.mx, GOTENBERG_TOKEN,
MP_ACCESS_TOKEN, MP_PUBLIC_KEY, MP_WEBHOOK_SECRET,
RESEND_API_KEY, EMAIL_FROM, QR_SIGNING_SECRET,
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, SENTRY_DSN
```

`GOTENBERG_TOKEN` en Vercel DEBE ser idéntico al del VPS (`.env.vps`), o Caddy
responde 401.

### 1.7 Verificación de humo

```bash
# S3 API responde TLS (403/AccessDenied SIN firma es lo esperado y correcto).
curl -I https://storage.comenor.org.mx/comenor/

# Gotenberg rechaza sin token…
curl -s -o /dev/null -w '%{http_code}\n' https://docs.comenor.org.mx/health   # 401
# …y responde con el token.
curl -s -H "Authorization: Bearer <GOTENBERG_TOKEN>" \
  https://docs.comenor.org.mx/health   # 200 / OK
```

---

## 2. Acceder a la consola de MinIO (túnel SSH)

La consola (puerto 9001) no se publica. Se alcanza por túnel:

```bash
ssh -L 9001:localhost:9001 usuario@<IP_DEL_VPS>
# En el VPS, reenvía el puerto del contenedor al host mientras dure la sesión:
#   docker compose --env-file .env.vps exec no aplica; usa el mapeo interno.
```

Alternativa sin publicar puertos: opera todo por `mc` (sección 1.5). Es la vía
recomendada.

---

## 3. Rotar secretos

Rota ante sospecha de fuga o de forma periódica (cada 6–12 meses).

### 3.1 `GOTENBERG_TOKEN`

1. Genera uno nuevo: `openssl rand -base64 48`.
2. Actualízalo en `.env.vps` del VPS y en Vercel **a la vez** (ventana breve de
   401 entre ambos cambios; hazlo en horario de bajo tráfico).
3. Recarga Caddy: `docker compose --env-file .env.vps up -d caddy`.
4. Redeploy de la app en Vercel para tomar la nueva variable.

### 3.2 Llave de servicio S3 de la app

```bash
# Crea una NUEVA llave, actualiza Vercel, verifica, y hasta entonces borra la vieja.
NEW_SECRET=$(openssl rand -base64 32)
docker compose --env-file .env.vps exec minio mc admin user add local comenor-app-v2 "$NEW_SECRET"
docker compose --env-file .env.vps exec minio mc admin policy attach local comenor-app --user comenor-app-v2
# → actualiza S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY en Vercel, redeploy, prueba subida.
docker compose --env-file .env.vps exec minio mc admin user remove local comenor-app   # vieja
```

### 3.3 `BETTER_AUTH_SECRET`

Rotarlo **invalida todas las sesiones** (los usuarios deben volver a iniciar
sesión). Cambia la variable en Vercel y haz redeploy. No requiere tocar el VPS.

### 3.4 Credenciales root de MinIO

Cámbialas en `.env.vps` y reinicia MinIO
(`docker compose --env-file .env.vps up -d minio`). NO afecta a la app (usa la
llave de servicio). Re-crea el alias `mc` con las nuevas credenciales.

---

## 4. Respaldos

### 4.1 Base de datos (Neon)

Neon tiene branching y point-in-time restore propios, pero conserva además un
dump lógico fuera de Neon:

```bash
# Requiere pg_dump (misma major version que Neon). DATABASE_URL de solo lectura
# si existe; si no, la normal.
pg_dump "$DATABASE_URL" --no-owner --no-privileges -Fc \
  -f comenor-$(date +%Y%m%d).dump

# Verifica que el dump es restaurable listando su contenido:
pg_restore --list comenor-$(date +%Y%m%d).dump | head
```

Guarda el `.dump` cifrado fuera del VPS (p. ej. otro bucket o almacenamiento
frío). Programa un cron diario en una máquina de confianza.

### 4.2 Volumen de MinIO

Dos opciones; usa las dos si el dato es crítico.

**A) Snapshot del volumen Docker (consistente, requiere breve parada):**

```bash
docker compose --env-file .env.vps stop minio
docker run --rm \
  -v comenor_minio-data:/data:ro \
  -v "$PWD":/backup alpine \
  tar czf /backup/minio-$(date +%Y%m%d).tar.gz -C /data .
docker compose --env-file .env.vps start minio
```

**B) Réplica lógica con `mc mirror` (sin parar el servicio):**

```bash
# Espeja el bucket a un destino externo (otro MinIO/S3). No requiere downtime.
docker compose --env-file .env.vps exec minio \
  mc mirror --overwrite --remove local/comenor destino/comenor-backup
```

Sube el `.tar.gz` cifrado fuera del VPS. Programa cron semanal (A) + diario (B).

---

## 5. Restaurar

### 5.1 Base de datos

```bash
# Sobre una base VACÍA (branch nuevo de Neon recomendado para no pisar prod).
pg_restore --no-owner --no-privileges --clean --if-exists \
  -d "$DATABASE_URL_DESTINO" comenor-YYYYMMDD.dump
```

Tras restaurar, corre las migraciones pendientes desde el repo:
`npm run db:migrate` (drizzle-kit) para alinear el esquema.

### 5.2 Volumen de MinIO

Desde snapshot (opción A):

```bash
docker compose --env-file .env.vps stop minio
docker run --rm \
  -v comenor_minio-data:/data \
  -v "$PWD":/backup alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/minio-YYYYMMDD.tar.gz -C /data"
docker compose --env-file .env.vps start minio
```

Desde réplica (opción B): `mc mirror destino/comenor-backup local/comenor`.

Tras cualquier restore de storage, verifica que un documento conocido abre en el
visor (URL firmada) y que las portadas de eventos cargan.

---

## 6. Operación diaria

```bash
# Estado y salud.
docker compose --env-file .env.vps ps
docker compose --env-file .env.vps logs -f --tail=100 caddy

# Actualizar imágenes (revisa el changelog de MinIO/Gotenberg antes).
docker compose --env-file .env.vps pull
docker compose --env-file .env.vps up -d

# Reinicio limpio de un servicio.
docker compose --env-file .env.vps restart gotenberg
```

Los certificados TLS los renueva Caddy solo; no requiere intervención mientras
el DNS siga apuntando al VPS y el puerto 443 esté abierto.
