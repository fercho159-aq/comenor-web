# ROADMAP — Proyecto COMENOR
## Rediseño Web Público + Micrositio de Membresías + Módulo de Eventos y Pagos

**Base:** Cotización Mayo 2026 (combo $28,000 MXN, 50% inicio / 50% cierre) **+ alcance adicional solicitado por el cliente** (Mercado Pago, eventos con QR, aniversario, memorias fotográficas — ver Fase 3B; ⚠️ no incluido en la cotización original, requiere addendum).
**Duración estimada total:** 8 semanas desde el anticipo y entrega de contenido
**Estado actual:** Fase 0 completada — propuestas de diseño listas y publicadas

---

## Vista general

| Fase | Nombre | Semanas | Estado |
|---|---|---|---|
| 0 | Propuestas de diseño | — | ✅ Completada |
| — | **HITO: Venta / anticipo 50% + addendum firmado** | — | ⏳ Pendiente |
| 1 | Descubrimiento y definición de alcance | Sem 1 | Pendiente |
| 2 | Rediseño del sitio público (incluye pág. aniversario) | Sem 1–3 | Pendiente |
| 3 | Micrositio de membresías | Sem 2–5 | Pendiente |
| 3B | **Módulo de eventos, pagos (Mercado Pago) y memorias** | Sem 4–6 | Pendiente |
| 4 | Correo corporativo (Google Workspace) | Sem 3–4 | Pendiente |
| 5 | QA, capacitación y lanzamiento | Sem 7–8 | Pendiente |
| — | **HITO: Entrega / pago final 50%** | Fin sem 8 | Pendiente |
| 6 | Post-lanzamiento y garantía | Sem 9+ | Pendiente |

```
Semana:        1    2    3    4    5    6    7    8
Descubrimiento ███
Sitio público  ████████████
Micrositio          ████████████████████
Eventos+Pagos                 ████████████████
Workspace                ████████
QA + Launch                              ██████████
```

---

## Fase 0 — Propuestas de diseño ✅ COMPLETADA

- [x] Análisis de los 6 sitios de referencia del cliente (ANSI, CANACINTRA, CANAME, CANIETI, GIZ, UL) → 3 tipos de diseño identificados con brandbooks.
- [x] 3 propuestas de homepage generadas y pulidas a nivel profesional:
  1. Institucional Clásico (verde/vino, Oswald+Lato)
  2. Tech Corporativo (verde noche + neón, Poppins)
  3. Minimalismo Editorial (acento vino único, Noto Sans)
- [x] Showcase publicado (GitHub `fercho159-aq/comenor` → Vercel) con vistas desktop/móvil y comparador individual.

**Siguiente acción:** presentar showcase → elegir propuesta → firmar cotización **+ addendum del módulo de eventos** → cobrar anticipo.

---

## Fase 1 — Descubrimiento y definición de alcance (Semana 1)

> La cotización condiciona el alcance final a esta sesión ("sujeto a definición de alcances").

**Sesión inicial con cliente:**
- [ ] Elección de la propuesta de diseño ganadora (o dirección híbrida).
- [ ] Definir mapa de secciones/páginas del sitio público — incluir ya la **página de aniversario** y la sección **Memorias**.
- [ ] Definir subconjunto de documentos visibles para Asociados vs Consejo.
- [ ] Confirmar si se activa marca de agua dinámica (opcional en cotización).
- [ ] Definir textos/beneficios de cada membresía (contenido editorial lo provee COMENOR).
- [ ] **Eventos:** definir tipos de evento (gratuitos vs de pago, presenciales vs en línea), precios, cupos y política de reembolso.
- [ ] **Cerrar y firmar addendum** del módulo de eventos/pagos/aniversario/memorias con su costo.

**Insumos a solicitar al cliente (bloqueantes):**
- [ ] Accesos: hosting actual, dominio/DNS, WordPress actual (respaldo).
- [ ] Branding: logo en vectores, manual si existe.
- [ ] Contenido: textos por sección, fotos propias (consejo directivo, eventos), documentos iniciales del repositorio.
- [ ] Lista de correos de usuarios a notificar (Consejo y Asociados).
- [ ] Decisión sobre Google Workspace (contrata COMENOR directo con Google).
- [ ] **Cuenta Mercado Pago de COMENOR** (alta con su razón social; credenciales de producción y datos fiscales).
- [ ] **Material del aniversario:** historia, línea de tiempo, fotos históricas.

**Entregable:** minuta de alcance firmada + addendum + calendario detallado.

---

## Fase 2 — Rediseño del sitio público (Semanas 1–3)

**Semana 1–2 · Diseño y estructura:**
- [ ] Arquitectura de información nueva (reorganización de contenidos cotizada).
- [ ] Extender la propuesta ganadora del homepage a todas las plantillas internas: Normatividad, Calendario de eventos, Asociados, Normas ASTM (tienda), Contacto.
- [ ] **Página de Aniversario:** página conmemorativa dentro del sitio (historia, línea de tiempo, cifras, galería destacada, invitación al evento de aniversario con registro/pago si aplica).
- [ ] **Sección pública "Memorias":** galerías fotográficas por evento/año (el contenido se administra desde el panel admin — ver Fase 3B).
- [ ] Sistema de componentes reutilizable (design tokens ya definidos en la propuesta).

**Semana 2–3 · Implementación:**
- [ ] Maquetación responsive (escritorio / tablet / móvil).
- [ ] Migración de contenido real del sitio actual.
- [ ] Optimización de rendimiento: imágenes WebP, lazy loading, limpieza de código/plugins.
- [ ] SEO on-page: meta tags, descripciones, jerarquía semántica H1–H3, enlazado interno, sitemap.xml, robots.txt.
- [ ] Validación cross-browser: Chrome, Safari, Firefox, Edge.
- [ ] Integración/verificación de la tienda de normas ASTM existente (carrito).

**Entregable:** sitio público rediseñado en staging (con aniversario y memorias), listo para revisión.

---

## Fase 3 — Micrositio privado de membresías (Semanas 2–5)

> Entrega cotizada: 4–5 semanas desde primer pago + contenido. Corre en paralelo al sitio público.

**Semana 2 · Fundación técnica:**
- [ ] Decisión de stack (recomendado: webapp en subdominio `miembros.comenor.org.mx` — p. ej. Next.js + Supabase/Postgres para auth, storage y bitácora — sin tocar el hosting actual, como pide la cotización). **La misma base de datos y panel servirán al módulo de eventos (Fase 3B): decidir aquí pensando en ambos.**
- [ ] Modelo de datos: perfiles (Consejo/Asociados), documentos, meses, niveles de acceso, bitácora.
- [ ] Login con 2 credenciales compartidas (una por perfil) con contraseñas cifradas y sesiones seguras.

**Semana 3 · Núcleo documental:**
- [ ] Página interna por membresía (beneficios, actualizaciones) con diseño editorial editable.
- [ ] Repositorio documental organizado por mes: PDF, Word, Excel, imágenes.
- [ ] Niveles de acceso por archivo: Consejo = todo; Asociados = subconjunto definido.
- [ ] Visor web embebido SIN descarga ni impresión + protecciones anti-extracción; marca de agua dinámica si se aprobó.

**Semana 4 · Funciones avanzadas:**
- [ ] Edición en línea de documentos del Consejo con guardado automático y control de versiones básico.
- [ ] Notificaciones automáticas por correo al subir documento nuevo (solo a usuarios con acceso). ⚠️ Depende de Fase 4 (SPF/DKIM/DMARC).
- [ ] Panel de administración documental: carga/organización/eliminación por mes, nivel de acceso por archivo.

**Semana 5 · Seguridad y cierre:**
- [ ] HTTPS forzado, registro de accesos, bitácora básica.
- [ ] Pruebas de permisos cruzados (que un Asociado jamás vea documento restringido).
- [ ] Carga de documentos iniciales provistos por COMENOR.

**Entregable:** micrositio funcional en staging con datos reales.

---

## Fase 3B — Módulo de eventos, pagos y memorias (Semanas 4–6) 🆕

> Alcance adicional solicitado por el cliente — **fuera de la cotización de Mayo 2026; cotizar como addendum antes de iniciar.** Comparte base de datos y panel admin con el micrositio.

**Semana 4 · Registro de eventos:**
- [ ] Modelo de datos de eventos: evento (nombre, fecha, sede, modalidad, costo, cupo) y registro de asistente.
- [ ] Formulario público de registro por evento con campos: **nombre, cargo, correo, celular, organismo / quién lo solicita** — todos obligatorios.
- [ ] **Validación doble:** frontend (required, formatos de correo/celular) **y backend** — el servidor rechaza cualquier payload con campos vacíos o inválidos aunque se brinque el navegador. Sanitización de entradas + honeypot/rate-limit anti-spam.
- [ ] Cada registro se guarda en base de datos con fecha/hora y evento asociado.

**Semana 5 · Pagos con Mercado Pago + QR:**
- [ ] Integración **Mercado Pago** (Checkout Pro o API): creación de preferencia de pago por registro para eventos presenciales de pago.
- [ ] **Webhooks de confirmación:** actualización automática del estado del registro (aprobado / pendiente / rechazado); manejo de reintentos e idempotencia.
- [ ] Al confirmarse el pago: **generación de QR único por asistente** (identificador firmado, no falsificable).
- [ ] **Correo de confirmación automático** con QR adjunto, comprobante y datos del evento (usa la infraestructura de correo de Fase 4).
- [ ] Flujo para eventos gratuitos: registro → QR + confirmación directa sin pasar por pago.
- [ ] Vista de **check-in** para staff: escanear QR el día del evento y marcar asistencia (detecta QR ya usado o inválido).
- [ ] Ambiente sandbox de Mercado Pago para pruebas; cambio a credenciales productivas hasta QA.

**Semana 6 · Panel admin ampliado + memorias:**
- [ ] **Panel admin unificado** (mismo login de administración del micrositio) con módulos:
  - CRUD de eventos (crear, editar, cerrar registro, cupo).
  - Tabla de registros por evento con estado de pago y asistencia.
  - **Exportación a Excel (.xlsx)** de los registros por evento (todos los campos + estado de pago + check-in).
  - **Memorias fotográficas:** subir fotos por evento/año (carga múltiple, compresión automática, orden, portada), publicar/despublicar galerías hacia la sección pública "Memorias".
  - Gestión de contenido de la página de aniversario.
  - Gestión documental del micrositio (ya cubierta en Fase 3).
- [ ] Conciliación básica: reporte de pagos Mercado Pago vs registros.

**Entregable:** módulo de eventos completo en staging — registro validado, pago sandbox, QR por correo, check-in, export Excel y memorias administrables.

---

## Fase 4 — Correo corporativo Google Workspace (Semanas 3–4)

> Cortesía incluida en cotización; COMENOR contrata directo con Google (~USD $7.20/usuario/mes).

- [ ] COMENOR contrata Business Starter bajo su razón social (acompañamiento).
- [ ] Alta y verificación del dominio @comenor.org.mx.
- [ ] Configuración de registros MX, SPF, DKIM y DMARC.
- [ ] Migración de hasta 5 buzones existentes.
- [ ] Prueba de deliverability: notificaciones del micrositio **y correos de confirmación de eventos con QR** (Gmail/Outlook, no-spam).

**Entregable:** correo corporativo operando + envíos transaccionales verificados.

---

## Fase 5 — QA, capacitación y lanzamiento (Semanas 7–8)

- [ ] Revisión final del cliente sobre staging (una ronda de ajustes consolidada).
- [ ] QA integral: responsive, cross-browser, formularios, tienda ASTM, flujos de login, visor, notificaciones.
- [ ] **QA del flujo de eventos end-to-end en sandbox:** registro con campos incompletos rechazado en backend, pago aprobado/rechazado/pendiente, QR recibido por correo, check-in, export Excel con acentos correctos (UTF-8).
- [ ] **Prueba con pago real de $1 en producción** de Mercado Pago antes del lanzamiento.
- [ ] Sesión de capacitación al equipo administrador (panel documental, eventos, export Excel, memorias, check-in QR) — grabar la sesión.
- [ ] Publicación: sitio público sobre el dominio actual + micrositio/webapp en subdominio.
- [ ] Verificación DNS, SSL, redirecciones 301 de URLs viejas (proteger SEO existente).
- [ ] Entrega de accesos y documentación breve de administración.

**HITO: Entrega formal → facturación y pago final 50%.**

---

## Fase 6 — Post-lanzamiento (Semana 9+)

- [ ] Periodo de garantía/ajustes menores (definir ventana: sugerido 30 días).
- [ ] Monitoreo la primera semana: errores, deliverability, webhooks de Mercado Pago.
- [ ] Acompañamiento en el **primer evento real** (registro + cobro + check-in) — el mejor momento para detectar fricción.
- [ ] Propuesta de mantenimiento mensual (actualizaciones, carga documental, soporte, comisiones/conciliación de eventos).

---

## Dependencias críticas del cliente (ruta crítica)

| Dependencia | Bloquea | Fecha límite |
|---|---|---|
| Anticipo 50% + addendum firmado | Todo | Antes de sem 1 |
| Elección de propuesta de diseño | Fase 2 | Sesión inicial |
| Accesos hosting/dominio/DNS | Fases 2, 4, 5 | Semana 1 |
| Contenido editorial y fotos | Fase 2 | Semana 1–2 |
| Material de aniversario (historia, fotos) | Fase 2 | Semana 2 |
| Documentos iniciales del repositorio | Fase 3 | Semana 3 |
| Contratación Google Workspace | Fase 4 | Semana 3 |
| Lista de correos de usuarios | Fase 3 (notificaciones) | Semana 3 |
| **Alta de cuenta Mercado Pago (razón social COMENOR)** | Fase 3B (pagos) | Semana 4 |
| Precios/cupos/política de reembolso de eventos | Fase 3B | Semana 4 |
| Fotos de eventos pasados (memorias iniciales) | Fase 3B | Semana 6 |

## Riesgos y mitigación

- **Alcance nuevo sin cotizar (riesgo #1 ahora):** el módulo de eventos/pagos/aniversario/memorias NO está en la cotización de $28,000. Cotizarlo y firmarlo como addendum ANTES de desarrollar — si se regala, se vuelve el precedente de "todo cambio es gratis".
- **Contenido tardío del cliente:** el reloj corre desde pago + contenido; checklist de insumos el día 1.
- **Alcance abierto del sitio público:** cerrar número de páginas por escrito en Fase 1.
- **Alta de Mercado Pago lenta:** la verificación de cuenta empresarial puede tardar días/semanas; iniciarla en semana 1 aunque el desarrollo del módulo empiece en la 4.
- **Webhooks en producción:** sandbox no garantiza producción; por eso la prueba real de $1 antes de lanzar. Comisión de Mercado Pago (~3.5% + IVA por transacción) — informarla al cliente para que la considere en el precio de sus eventos.
- **Notificaciones/confirmaciones a spam:** no activar envíos antes de SPF/DKIM/DMARC (Fase 4).
- **"Visualización sin descarga":** disuasión razonable, no protección absoluta.
- **Credenciales compartidas por perfil:** la bitácora identifica perfil, no persona; explícito en capacitación.
- **Fotos de memorias pesadas:** compresión automática en el panel al subir; si no, el sitio se degrada con cada galería nueva.

## Resumen económico de hitos

| Hito | Momento | Monto |
|---|---|---|
| Anticipo 50% (combo cotizado) | Firma / inicio | $14,000 MXN |
| Pago final 50% (combo cotizado) | Entrega | $14,000 MXN |
| **Total combo cotizado** | | **$28,000 MXN** (+IVA si factura) |
| **Addendum módulo eventos + pagos + aniversario + memorias** | Por cotizar en Fase 1 | **Pendiente de definir** |
| Google Workspace | Mensual, directo a Google | ~$130 MXN/usuario/mes |
| Comisión Mercado Pago | Por transacción de evento | ~3.5% + IVA (la absorbe COMENOR) |
