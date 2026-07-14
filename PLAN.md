# PLAN DE DESARROLLO — COMENOR
## Plan maestro para que Claude (Opus) desarrolle el sitio completo

**Fuente:** ROADMAP_COMENOR.md + Cotización Mayo 2026 + alcance adicional (Mercado Pago, eventos QR, aniversario, memorias).
**Uso:** copiar este documento al repositorio de desarrollo como `PLAN.md` (y un extracto en `CLAUDE.md`) al iniciar. Cada agente trabaja contra este plan y deja evidencia auditable.

---

# 1. ARQUITECTURA E INFRAESTRUCTURA

## 1.1 Decisión Vercel vs VPS

**Veredicto: Vercel como hosting principal (CDN, preview deploys, serverless) + el VPS autoadministrado de MAW Soluciones — ya disponible, sin costo extra — para las funciones que serverless no cubre.**

| Función | ¿Vercel lo resuelve? | Cómo |
|---|---|---|
| Sitio público (rediseño + aniversario + memorias) | ✅ | Next.js en Vercel |
| Micrositio auth 2 perfiles | ✅ | Next.js + Supabase Auth |
| Base de datos (registros, documentos, eventos) | ✅ | Supabase Postgres (externo, no en Vercel) |
| Almacenamiento de documentos y fotos | ✅ | Supabase Storage (buckets privados con URLs firmadas) |
| Visor PDF sin descarga + marca de agua | ✅ | pdf.js en cliente + pdf-lib en serverless para estampar marca de agua |
| Webhooks Mercado Pago | ✅ | Route handlers serverless |
| Generación de QR | ✅ | Librería `qrcode` en serverless |
| Correos transaccionales (confirmaciones, notificaciones) | ✅ | Resend (o SES) vía API — nunca SMTP propio |
| Export Excel (.xlsx) | ✅ | `exceljs` en serverless (< 250 MB y < 10 s: sobra) |
| Compresión de fotos de memorias | ✅ | `sharp` en serverless al subir |
| Tareas programadas (recordatorios de evento) | ✅ | Vercel Cron |
| **Conversión Word/Excel → PDF para el visor** | ⚠️ NO | → **VPS MAW** con Gotenberg |
| **Edición en línea de archivos Office reales** | ⚠️ NO | → **VPS MAW** con OnlyOffice (si se requiere) |

### Reparto de funciones con el VPS de MAW Soluciones

El VPS autoadministrado de MAW ya está pagado y disponible — desaparece la restricción de costo. Aun así, **el sitio y la webapp se quedan en Vercel** (CDN global, previews por PR, cero mantenimiento de SO para el tráfico principal); el VPS toma solo los servicios que necesitan Docker persistente:

1. **Conversión Word/Excel → PDF (visor sin descarga):** **Gotenberg** en Docker sobre el VPS MAW. El panel admin acepta Word/Excel, el backend los manda a Gotenberg al subirlos y el visor siempre muestra PDF con marca de agua. Sin APIs externas de pago.
2. **Edición en tiempo real de documentos del Consejo:**
   - **Plan A (recomendado):** editor de texto enriquecido nativo (**Tiptap** + guardado automático + versiones en Postgres). Cumple lo cotizado y es mejor experiencia.
   - **Plan B (ya viable sin costo extra):** si el cliente exige editar .docx reales → **OnlyOffice Document Server** en el mismo VPS MAW.
3. **Servicios de apoyo (opcionales):** respaldos secundarios de Supabase (pg_dump nocturno al VPS), utilidades internas de MAW (n8n, monitoreo uptime).

### Configuración del VPS MAW Soluciones
- Docker Compose versionado en el repo (`infra/vps/docker-compose.yml`): Gotenberg + OnlyOffice (si aplica) + Caddy (TLS automático).
- Subdominio `docs.comenor.org.mx` → VPS; el resto del tráfico jamás lo toca.
- Hardening: firewall (solo 80/443/SSH con llave), fail2ban, actualizaciones de seguridad automáticas, acceso Gotenberg/OnlyOffice solo con token secreto (no expuestos públicos sin auth).
- El VPS es reemplazable: el estado real vive en Supabase; si muere, se re-levanta con el compose en minutos.

**🚦 Gate de decisión (semana 2):** preguntar al cliente si "editar documentos" significa .docx reales (→ activar OnlyOffice en el VPS) o contenido en la plataforma (→ Tiptap, Plan A).

## 1.2 Stack definitivo

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript estricto** | Un solo repo para sitio público + micrositio + admin + API |
| Estilos | **Tailwind CSS v4** + design tokens de la propuesta ganadora | Consistencia con los mockups aprobados |
| BD | **Supabase Postgres + RLS** | Auth, storage y bitácora en un solo servicio administrado |
| ORM | **Drizzle** (o Prisma) + migraciones versionadas en repo | Esquema auditable en git |
| Validación | **Zod** — esquemas COMPARTIDOS entre cliente y servidor | Requisito explícito: nada llega vacío al backend |
| Auth | Supabase Auth (email/password) + middleware de roles | 2 perfiles compartidos (consejo/asociados) + rol admin |
| Pagos | **SDK oficial Mercado Pago** (Checkout Pro) | Webhooks firmados, sandbox → producción |
| Email | **Resend + React Email** | Deliverability, plantillas versionadas en el repo |
| Documentos | pdf.js (visor), pdf-lib (marca de agua), Tiptap (edición) | Sin VPS |
| Excel | exceljs | Export server-side con UTF-8 correcto |
| QR | `qrcode` + payload firmado (HMAC, no UUID pelón) | No falsificable |
| Imágenes | sharp al subir + `next/image` | Memorias no degradan el sitio |
| Errores | **Sentry** | Visibilidad post-lanzamiento |
| Tests | **Vitest** (unit) + **Playwright** (e2e) | Gates de CI |
| CI/CD | **GitHub Actions** + Vercel preview deploys | Cada PR = URL de preview |
| DNS | El actual del cliente; solo cambian registros | Cotización: hosting/dominio actuales se mantienen |

**Nota WordPress/ASTM:** la tienda de normas ASTM vive en el WordPress actual. NO se migra en este alcance — el sitio nuevo enlaza a ella (subdominio `tienda.comenor.org.mx` apuntando al hosting viejo si hace falta). Migrarla es proyecto aparte.

## 1.6 Módulo Calendario público — eventos como productos 🆕

> El cliente tiene un calendario activo en el sitio actual (WordPress). Se REEMPLAZA por el módulo de eventos propio, administrable desde el panel.

**Flujo:** el admin crea el evento en el panel (nombre, fecha, sede, modalidad, precio, cupo, imagen, descripción) → al publicarlo aparece automáticamente en:
1. **Página "Calendario de eventos"** del sitio público: vista mensual/lista con filtros, alimentada por la BD.
2. **Tarjeta tipo producto** por evento: imagen, fecha, precio (o "Gratuito"), cupo restante y CTA "Registrarme" → formulario de registro → pago Mercado Pago (si es de pago) → QR por correo.
3. **Detalle de evento** con URL propia (`/eventos/{slug}`) — sirve como landing compartible y tiene JSON-LD de evento para SEO.

**Reglas:**
- Publicar/despublicar y cerrar registro sin borrar datos (histórico de eventos alimenta las Memorias).
- Cupo agotado → botón cambia a "Cupo lleno" automáticamente; opción de lista de espera (fase 2 si el cliente la pide).
- Redirect 301 de la URL del calendario viejo de WordPress a la nueva página.
- El evento de pago se comporta como producto pero NO pasa por WooCommerce: cobra directo con Mercado Pago del módulo de eventos (una sola fuente de verdad para registros, pagos y QR).

## 1.3 Entornos

| Entorno | Rama | URL | BD |
|---|---|---|---|
| Desarrollo | feature/* | localhost + Supabase local (CLI) | Local |
| Staging | `develop` | `staging-comenor.vercel.app` (protegido con password) | Proyecto Supabase staging |
| Producción | `main` | `comenor.org.mx` + `miembros.comenor.org.mx` | Proyecto Supabase prod (PITR activado) |

Mercado Pago: credenciales **sandbox en staging**, productivas SOLO en prod. Prueba real de $1 antes del lanzamiento.

## 1.4 Variables de entorno (contrato completo)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
# Mercado Pago
MP_ACCESS_TOKEN / MP_PUBLIC_KEY / MP_WEBHOOK_SECRET
# Email
RESEND_API_KEY / EMAIL_FROM=notificaciones@comenor.org.mx
# Seguridad
QR_SIGNING_SECRET / SESSION_SECRET / ADMIN_ALLOWED_EMAILS
# Observabilidad
SENTRY_DSN
# VPS MAW Soluciones (conversión de documentos)
GOTENBERG_URL / GOTENBERG_TOKEN
ONLYOFFICE_URL / ONLYOFFICE_JWT_SECRET   # solo si se activa edición de .docx reales
```
Regla: `.env.example` versionado, secretos reales SOLO en Vercel/Supabase dashboards. Jamás en git.

## 1.5 Modelo de datos (núcleo)

```
profiles        (id, tipo: consejo|asociados|admin)
documents       (id, titulo, mes, anio, nivel_acceso, tipo, storage_path, formato, creado_por, ts)
document_versions (id, document_id, contenido_richtext, version, editado_por, ts)
events          (id, nombre, slug, fecha, sede, modalidad, costo_centavos, cupo, estado,
                 descripcion, imagen_path, publicado, registro_abierto)  -- alimenta calendario público
registrations   (id, event_id, nombre, cargo, correo, celular, organismo, solicitante,
                 estado_pago: gratuito|pendiente|aprobado|rechazado,
                 mp_payment_id, qr_token_hash, checked_in_at, ts)
                 → TODOS los campos de contacto NOT NULL a nivel de columna
payments_log    (id, registration_id, mp_event, payload_json, ts)  -- idempotencia webhooks
galleries       (id, titulo, evento/anio, publicada, portada, orden)
gallery_photos  (id, gallery_id, storage_path, orden, ts)
audit_log       (id, actor, accion, entidad, entidad_id, ip, ts)   -- bitácora cotizada
email_recipients(id, correo, perfil, activo)                        -- notificaciones documentales
```

---

# 2. BUENAS PRÁCTICAS OBLIGATORIAS

## Seguridad
1. **Validación doble SIEMPRE:** cada formulario tiene esquema Zod compartido; el route handler re-valida. Campo vacío = 400 con mensaje por campo. La BD además tiene NOT NULL (tercera línea de defensa).
2. **RLS activado en TODAS las tablas** de Supabase; el anon key jamás alcanza datos privados. Tests automatizados de permisos cruzados (asociado intentando leer documento restringido = denegado).
3. **Webhooks Mercado Pago:** validar firma (`x-signature`), idempotencia por `mp_payment_id` (tabla payments_log), responder 200 rápido y procesar; nunca confiar en el monto del cliente — verificar contra la API de MP.
4. **QR firmado:** token = HMAC(registration_id + event_id, QR_SIGNING_SECRET). En BD solo el hash. Check-in marca uso único.
5. Rate limiting en formularios públicos y login (Upstash Redis o `@vercel/firewall`); honeypot en registro de eventos.
6. Headers: CSP, HSTS, X-Frame-Options (el visor de documentos SOLO se embebe a sí mismo).
7. URLs de Storage firmadas y de vida corta (60 s) para el visor; nunca URLs públicas de documentos.
8. Dependencias: `npm audit` en CI; Dependabot activado.

## Calidad de código
9. TypeScript `strict: true`; prohibido `any` sin comentario justificando.
10. Conventional Commits; PRs pequeños por feature; `main` protegida — solo merge con CI verde.
11. CI en cada PR: `lint` + `typecheck` + `vitest` + build. Playwright e2e en `develop` → antes de promover a `main`.
12. Migraciones de BD SOLO por archivos versionados (drizzle-kit); prohibido tocar el esquema desde el dashboard.
13. Un archivo `docs/DECISIONES.md` (ADR ligero): cada decisión técnica no obvia, 3 líneas — qué, por qué, alternativa descartada.

## UX / rendimiento / SEO
14. Design tokens de la propuesta ganadora en `tailwind.config` — un solo lugar para color/tipografía/espaciado.
15. Accesibilidad AA: focus-visible, contraste, formularios con labels y errores anunciados (aria-live), navegación por teclado en el panel admin.
16. Core Web Vitals presupuestados: LCP < 2.5 s, CLS < 0.1; imágenes siempre `next/image` con tamaños explícitos.
17. SEO: metadata API de Next por página, sitemap.xml, robots.txt, redirects 301 desde las URLs del WordPress viejo (mapa de redirecciones ANTES del switch de DNS), JSON-LD de organización y eventos.
18. Todo el copy en español; fechas y monedas con `Intl` (`es-MX`, MXN).
19. Emails transaccionales: plantillas React Email versionadas, probadas en Gmail + Outlook, con versión texto plano.

## Operación
20. Backups: Supabase PITR en prod; export semanal del esquema a repo.
21. Sentry con release tracking (sourcemaps subidos por CI).
22. `docs/RUNBOOK.md`: cómo rotar secretos, reenviar un correo de confirmación, reembolsar en MP, restaurar backup.

---

# 3. EQUIPO DE AGENTES — ROLES Y AUDITORÍA

> Orquestación: un agente **Arquitecto/Orquestador** (sesión principal) coordina; los demás son subagentes con entregables y checklist de auditoría. Ningún agente audita su propio trabajo.

## A0 — Arquitecto / Orquestador (sesión principal)
**Responsabilidad:** decisiones técnicas, orden de fases, integración, revisión de PRs de los demás agentes, gates de decisión (VPS sí/no, alcance).
**Entrega:** repo inicializado (estructura, CI, tokens, esquema BD, `.env.example`), `docs/DECISIONES.md` actualizado.
**Auditoría:** el esquema de BD cubre todas las entidades del plan; CI corre en verde en un PR de prueba; ningún secreto en git (`gitleaks` en CI).

## A1 — Frontend Sitio Público
**Responsabilidad:** homepage (propuesta ganadora) + Normatividad, Asociados, Contacto + **página de Aniversario** + sección pública **Memorias** + **Calendario de eventos (vista mensual/lista alimentada por BD, tarjetas de evento tipo producto con precio/cupo/CTA)** + detalle de evento (`/eventos/{slug}`) con formulario de registro.
**Insumos:** mockup aprobado, brandbook, contenido del cliente.
**Entrega:** páginas responsive, SEO metadata, redirects 301.
**Auditoría (por A4):** Lighthouse ≥ 90 en Performance/SEO/A11y en las 3 vistas principales; 375/768/1440 px sin overflow; textos reales (cero lorem); axe sin violaciones críticas.

## A2 — Backend / API
**Responsabilidad:** auth y roles, CRUD documental con niveles de acceso, visor (URLs firmadas + marca de agua), edición Tiptap + versiones, registro de eventos con validación Zod doble, integración Mercado Pago + webhooks idempotentes, generación QR firmado, correos transaccionales (Resend), export Excel, notificaciones documentales.
**Entrega:** route handlers + esquemas Zod compartidos + migraciones + tests unitarios de cada regla de negocio.
**Auditoría (por A4):** test de payload incompleto → 400 en TODOS los endpoints de escritura; test de permisos cruzados RLS; webhook duplicado no duplica confirmación; QR alterado = rechazado; export Excel abre en Excel real con acentos correctos.

## A3 — Panel Admin
**Responsabilidad:** panel unificado — gestión documental (carga por mes, nivel de acceso), **CRUD de eventos con publicación al calendario público (publicar/despublicar, abrir/cerrar registro, imagen, precio, cupo)**, tabla de registros con estados + export, check-in QR (vista de escaneo con cámara), carga de memorias con compresión, gestión de página de aniversario, gestión de destinatarios de notificaciones.
**Entrega:** rutas `/admin` protegidas por rol, UI consistente con design tokens.
**Auditoría (por A4):** flujo completo grabable: crear evento → registro público → pago sandbox → QR por correo → check-in → export Excel. Usuario no-admin recibe 403 en todas las rutas admin.

## A4 — QA / Auditor (adversarial)
**Responsabilidad:** NO escribe features. Ejecuta las auditorías de A1–A3 contra sus checklists, escribe los e2e de Playwright (flujo de pago sandbox incluido), intenta romper: XSS en formularios, IDOR en documentos, saltarse validación con curl, QR reutilizado, doble webhook.
**Entrega:** `docs/AUDITORIA.md` con hallazgos (severidad, repro, estado) + suite e2e en CI.
**Auditoría de cierre:** cero hallazgos críticos/altos abiertos antes de promover a producción.

## A5 — DevOps / Lanzamiento
**Responsabilidad:** GitHub Actions, entornos Vercel + Supabase (staging/prod), **VPS MAW Soluciones (Docker Compose de Gotenberg/OnlyOffice, Caddy TLS, hardening, subdominio `docs.comenor.org.mx`, respaldo pg_dump nocturno)**, Sentry, dominios y DNS, SPF/DKIM/DMARC con Google Workspace, mapa de redirects 301 (incluida la URL del calendario viejo), checklist de lanzamiento, prueba de $1 real en MP, RUNBOOK.
**Auditoría (por A0):** deploy de prod reproducible desde `main` sin pasos manuales; mail-tester ≥ 9/10 en correos transaccionales; rollback documentado y probado en staging.

## Reglas de coordinación
- Cada agente trabaja en rama propia y entrega por PR; A0 hace merge.
- Contratos primero: A0 publica esquema BD + esquemas Zod ANTES de que A1–A3 comiencen (son la interfaz entre agentes).
- A1, A2, A3 pueden correr en paralelo desde la semana 2; A4 audita conforme cada fase se declara "lista" (no al final).
- Toda "decisión de alcance" (¿esto es .docx real?, ¿el evento gratuito lleva QR?) sube a A0, y A0 al humano — los agentes no deciden alcance con el cliente.

---

# 4. SECUENCIA DE EJECUCIÓN (mapea al roadmap)

| Semana | A0 | A1 | A2 | A3 | A4 | A5 |
|---|---|---|---|---|---|---|
| 1 | Repo, esquema, tokens, contratos | Homepage | — | — | — | CI + entornos |
| 2 | Gate VPS/docs | Páginas internas + aniversario | Auth + documental | — | Audita homepage | SPF/DKIM (con Workspace) |
| 3 | Integración | Memorias públicas + evento público | Visor + edición + notificaciones | Panel documental | Audita micrositio núcleo | Sentry + staging |
| 4 | Integración | Ajustes revisión cliente | Registro eventos + validación doble | Panel eventos | e2e registro | — |
| 5 | Integración | — | Mercado Pago + QR + correos | Check-in + export Excel | e2e pago sandbox | Webhooks en staging |
| 6 | Revisión total | Contenido final | Hardening | Memorias admin + aniversario admin | Auditoría adversarial completa | Mapa 301 + checklist launch |
| 7 | Corrección hallazgos | ← | ← | ← | Re-test | Prueba $1 prod |
| 8 | **Lanzamiento** | — | — | — | Smoke prod | DNS switch + monitoreo |

## Definición de "terminado" (global)
1. CI verde (lint, types, unit, e2e).
2. Checklist de auditoría del agente correspondiente firmado en `docs/AUDITORIA.md`.
3. Deploy en staging verificado con datos reales del cliente.
4. Cero secretos en código; cero `any` sin justificar; cero texto placeholder.
5. El flujo de dinero (registro→pago→QR→correo→check-in→export) demostrado de punta a punta en video/GIF para el cliente.

---

# 5. CHECKLIST DE ARRANQUE (día 1 del desarrollo)

- [ ] Crear repo privado `comenor-web` (el repo actual `comenor` es solo el showcase de propuestas — NO desarrollar ahí).
- [ ] Copiar este plan como `PLAN.md` + generar `CLAUDE.md` con las reglas de la sección 2.
- [ ] Crear proyectos Supabase (staging + prod) y Vercel; conectar GitHub.
- [ ] Cargar `.env.example` y secretos en dashboards.
- [ ] Solicitar al cliente: credenciales MP (iniciar alta YA — tarda), acceso DNS, contenido, propuesta ganadora confirmada.
- [ ] Verificar acceso SSH al VPS autoadministrado de MAW Soluciones; instalar Docker y desplegar `infra/vps/docker-compose.yml` (Gotenberg + Caddy).
- [ ] Inventariar el calendario actual de WordPress: exportar eventos existentes/futuros para migrarlos al módulo nuevo y mapear su URL al redirect 301.
- [ ] A0 publica esquema BD + contratos Zod → arrancan A1/A2/A3.
