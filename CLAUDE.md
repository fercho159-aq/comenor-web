@AGENTS.md

# COMENOR — reglas operativas

Sitio del **Consejo Mexicano de Normalización y Evaluación de la Conformidad, A.C.**
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · `src/` · alias `@/*`.

**Antes de escribir código, lee:** `PLAN.md` (plan maestro), `docs/BRAND.md` (fuente de verdad visual),
`docs/DECISIONES.md` (ADR). Este archivo es el extracto accionable de PLAN.md §2.

---

## 1. Contenido: cero texto inventado

- **Todo el copy sale de `design-source/text/presentacion.txt`** (transcripción de la presentación
  institucional del cliente). Cero lorem ipsum, cero texto placeholder, cero nombres o cifras inventados.
- Si el copy que necesitas no existe en ese archivo, **no lo inventes**: escala la duda, deja un `TODO(copy)`
  y no publiques la sección.
- Copy en **español de México**. Fechas y monedas siempre con `Intl` (`es-MX`, `MXN`) — nunca strings a mano.

## 2. Diseño: `docs/BRAND.md` manda

El sitio debe parecerse a las 15 slides en `design-source/pages/page-NN.png` (léelas con la herramienta Read).

**Paleta** (tokens en `@theme` de `src/app/globals.css`, un solo lugar):

| Token | Hex | Uso |
|---|---|---|
| `verde` | `#004F4A` | primario: titulares, tarjetas sólidas, hero |
| `verde-900` | `#1E3535` | tarjetas alternas, pills |
| `verde-700` | `#0C5753` | variante de tarjeta |
| `vino` | `#B62438` | acento: barra inferior full-width, swoosh del logo |
| `vino-900` | `#7A1526` | numeral de tarjeta roja |
| `humo` | `#E6E6E6` | **fondo (NO blanco puro)** |
| `salvia` | `#CAD6D6` | swoosh decorativo de fondo |
| `tinta` | `#1E3535` | cuerpo de texto |
| `tinta-suave` | `#5A6A6A` | eyebrow / labels |
| `blanco` | `#FFFFFF` | texto sobre verde/vino |

**Tipografía:** Montserrat, familia única (300/400/700 + itálicas).
H1 Bold ~48–56px en `verde` · eyebrow Regular ~14px MAYÚSCULAS tracking ~0.08em en `tinta-suave` ·
cuerpo Regular 16–18px, line-height 1.6, `text-pretty` (**no** justificar en web).
Énfasis = Bold del mismo color, nunca otro color.

**Formas:** swoosh `salvia` de fondo como **SVG** (`design-source/svg/page-2.svg`), nunca JPG ·
barra `vino` de ~8px al 100% del ancho al pie · sidebar vertical rotado 90° con el contacto (solo desktop) ·
fotos con radius ~24px, retratos en círculo · tarjetas **sin radius**, `verde`/`verde-900` alternados ·
pills `rounded-full` en `verde-900` · logo wordmark entre dos swooshes (`verde` arriba, `vino` abajo), como SVG.

## 3. Seguridad

- **Validación doble siempre:** esquema Zod compartido cliente/servidor; el route handler **re-valida**.
  Campo vacío = `400` con mensaje por campo. La BD además tiene `NOT NULL`.
- **RLS activado en todas las tablas** de Supabase. El anon key jamás alcanza datos privados.
- **Webhooks Mercado Pago:** validar firma `x-signature`, idempotencia por `mp_payment_id`, responder 200 rápido.
  Nunca confiar en el monto que manda el cliente — verificar contra la API de MP.
- **QR firmado:** `HMAC(registration_id + event_id, QR_SIGNING_SECRET)`. En BD solo el hash. Uso único.
- Rate limiting + honeypot en formularios públicos y login. Headers: CSP, HSTS, X-Frame-Options.
- URLs de Storage **firmadas y de vida corta (60 s)** para el visor; nunca URLs públicas de documentos.
- **Cero secretos en código.** `.env.example` versionado; los valores reales solo en los dashboards.

## 4. Calidad de código

- TypeScript `strict`. **Prohibido `any`** sin un comentario que lo justifique.
- **Server Components por defecto**; `'use client'` solo si hay estado, efectos o handlers de eventos.
- Migraciones de BD solo por archivos versionados (drizzle-kit). Prohibido tocar el esquema desde el dashboard.
- Conventional Commits · PRs pequeños por feature · `main` protegida, merge solo con CI verde.
- CI en cada PR: `lint` + `typecheck` + `test` + `build`. Todo debe pasar en local antes del PR.
- Cada decisión técnica no obvia se anota en `docs/DECISIONES.md` (3 líneas: qué, por qué, alternativa descartada).

## 5. UX, rendimiento y SEO

- **Accesibilidad AA:** `focus-visible` visible, contraste suficiente, labels en todos los campos,
  errores anunciados con `aria-live`, navegación completa por teclado.
- **Core Web Vitals:** LCP < 2.5 s, CLS < 0.1. Imágenes siempre con `next/image` y **tamaños explícitos**.
- **Responsive real:** 375 / 768 / 1440 px sin overflow horizontal.
- **SEO:** Metadata API de Next por página, `sitemap.xml`, `robots.txt`, redirects 301 desde el WordPress viejo,
  JSON-LD de organización y de eventos.

## 6. Propiedad de archivos (trabajo en paralelo)

Varios agentes trabajan en este repo a la vez. **Escribe solo en los archivos que tu tarea te asigna.**
Si necesitas algo de otro archivo, **léelo, no lo edites**. No reescribas `src/app/globals.css` salvo que sea
tu tarea explícita.

## 7. Comandos

```bash
npm run dev        # servidor de desarrollo
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build      # next build
```
