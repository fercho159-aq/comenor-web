# DECISIONES — ADR ligero

Cada decisión técnica no obvia: **qué**, **por qué**, **alternativa descartada**. Tres líneas. Se agrega al final; no se reescribe el historial.

---

## ADR-001 — Next.js 16 (no Next.js 15)

- **Qué:** el proyecto corre sobre Next.js 16 (App Router) con React 19, aunque `PLAN.md` §1.2 dice "Next.js 15".
- **Por qué:** es la versión que instala `create-next-app` hoy; fijar la 15 significaría arrancar con una versión ya vieja y migrar a mitad del proyecto.
- **Alternativa descartada:** anclar Next 15 al pie de la letra del plan — deuda técnica inmediata sin ninguna ganancia.

## ADR-002 — El diseño se deriva del PPT institucional del cliente

- **Qué:** la identidad visual del sitio sale de `COMENOR_Institucional 2026.pptx` (destilado en `docs/BRAND.md` + `design-source/`), no de las tres propuestas del showcase.
- **Por qué:** el cliente pidió explícitamente que el sitio siga su presentación institucional; esa es la marca que ya usa y aprobó.
- **Alternativa descartada:** una de las 3 propuestas del repo showcase — bonitas, pero ninguna es la marca real del cliente.

## ADR-003 — Drizzle como ORM (no Prisma)

- **Qué:** Drizzle ORM + drizzle-kit para el esquema y las migraciones versionadas contra Supabase Postgres.
- **Por qué:** SQL-first y tipado de punta a punta, migraciones legibles en git, sin engine binario ni paso de generación — encaja mejor con serverless en Vercel.
- **Alternativa descartada:** Prisma — más ergonómico al inicio, pero cold starts más pesados y RLS de Postgres menos natural de expresar.

## ADR-004 — Tailwind v4 con `@theme` en CSS (no `tailwind.config.js`)

- **Qué:** los design tokens de `docs/BRAND.md` viven en un bloque `@theme` dentro de `src/app/globals.css`; no existe `tailwind.config.js`.
- **Por qué:** es el modelo CSS-first de Tailwind v4 (lo que genera `create-next-app`); un solo lugar para color/tipografía/espaciado, sin duplicar tokens entre JS y CSS.
- **Alternativa descartada:** `tailwind.config.js` como dice `PLAN.md` §2 punto 14 — sigue soportado, pero obliga a mantener dos fuentes de tokens.

## ADR-005 — Vitest + jsdom para tests unitarios

- **Qué:** Vitest con entorno jsdom y Testing Library; el alias `@/*` se replica en `vitest.config.ts`.
- **Por qué:** comparte pipeline con Vite/esbuild (arranque rápido, TS sin configurar), y es lo que `PLAN.md` §1.2 fija como gate de CI.
- **Alternativa descartada:** Jest — necesita transformer y config de ESM extra para React 19 y el alias, sin ventaja a cambio.

## ADR-006 — Se suelta Supabase: auth + storage + PDF en infra propia

- **Qué:** se elimina Supabase por completo. Auth pasa a **better-auth** dentro
  del Next (usuarios y sesiones en la misma Neon Postgres, adaptador Drizzle, 3
  roles: consejo | asociados | admin). Storage pasa a **MinIO** (S3-compatible)
  en el VPS MAW Soluciones, con URLs firmadas de vida corta vía SDK S3. La
  conversión Word/Excel → PDF del visor pasa a **Gotenberg**, también en el VPS.
  Todo detrás de Caddy con TLS automático (`storage.comenor.org.mx`,
  `docs.comenor.org.mx`). La app sigue en Vercel; el VPS solo aloja MinIO +
  Gotenberg. La DB Neon ya existía y se conserva.
- **Por qué:** consolidar en infraestructura propia ya pagada (el VPS del
  cliente), quitar una dependencia externa y su capa de facturación, y eliminar
  la deuda de mantener políticas RLS de Supabase — el control de acceso ahora
  vive en el código (middleware de roles + `@/lib/auth`) con una sola fuente de
  verdad. Las firmas públicas de `@/lib/auth` y `@/lib/storage` se mantuvieron
  para no tocar a los ~40 consumidores.
- **Alternativa descartada:** self-host de Supabase entero (Postgres + GoTrue +
  Storage + PostgREST + Studio en el VPS) — demasiado peso operativo (media
  docena de servicios, upgrades acoplados) para lo que en realidad usamos:
  auth, storage y conversión, que se cubren con piezas más chicas y aisladas.
