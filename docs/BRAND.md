# BRAND COMENOR — extraído de `COMENOR_Institucional 2026.pptx`

Fuente de verdad visual. El cliente pidió que el sitio siga esta presentación.
Assets crudos en `design-source/` (15 slides renderizadas a 150dpi en `pages/`, SVG vectorial en `svg/`, imágenes deduplicadas en `unique/`, texto en `text/`).

## Paleta (muestreada de los renders, no inventada)

| Token | Hex | Uso en la presentación |
|---|---|---|
| `verde` (primario) | `#004F4A` | Titulares, tarjetas sólidas, panel diagonal del hero, fondo de slide de cierre |
| `verde-900` (oscuro) | `#1E3535` | Tarjetas alternas, pills negras-verdosas, contraste con `verde` en grids |
| `verde-700` | `#0C5753` | Variante de tarjeta ligeramente más clara |
| `vino` (acento) | `#B62438` | Barra inferior full-width en TODAS las slides, swoosh inferior del logo, tarjeta "Legalidad" |
| `vino-900` | `#7A1526` | Bloque numeral izquierdo de la tarjeta roja |
| `humo` (fondo) | `#E6E6E6` | Fondo de todas las slides (NO blanco puro) |
| `salvia` (decorativo) | `#CAD6D6` | Swoosh curvo de fondo, esquina superior derecha |
| `tinta` (texto) | `#1E3535` | Cuerpo de texto |
| `tinta-suave` | `#5A6A6A` | Eyebrow / labels en versalitas |
| `blanco` | `#FFFFFF` | Texto sobre verde/vino, tarjetas de principios |

## Tipografía

**Montserrat** — única familia. Pesos embebidos en el PDF: Light 300, Regular 400, Bold 700, Italic, BoldItalic.
(Raleway y Calibri aparecen solo en logos de terceros / notas — no son de marca.)

- **H1 slide:** Montserrat Bold, ~48–56px, `verde`. Ej: "¿Quiénes somos?", "Consejo Directivo", "Contacto".
- **H1 largo a 2 líneas:** Bold, tracking normal, line-height ~1.15.
- **Eyebrow:** Montserrat Regular, ~14px, MAYÚSCULAS, tracking amplio (~0.08em), `tinta-suave`. Ej: "NUESTRA INSTITUCIÓN", "NUESTRO ECOSISTEMA", "EJE TEMÁTICO 3".
- **Cuerpo:** Montserrat Regular, ~16–18px, line-height 1.6, **justificado** en la presentación (en web: `text-pretty`, sin justificar, para no romper el ritmo en móvil).
- **Énfasis en cuerpo:** Bold en el mismo color, nunca otro color.

## Formas y sistema visual

1. **Swoosh de fondo** (la "textura"): dos curvas orgánicas `salvia` sobre `humo`, ancladas en la esquina superior derecha, barriendo hacia abajo-izquierda. Aparece en las 15 slides. Vectorial — reconstruir como SVG de fondo, NO como JPG. Referencia: `design-source/svg/page-2.svg`.
2. **Barra vino inferior:** franja `#B62438` de ~8px al 100% del ancho, al pie de cada slide. En web: pie de página / borde superior del footer.
3. **Sidebar vertical:** `comenor.org.mx | direccioncomenor@comenor.org.mx` rotado 90°, alineado al borde derecho, `tinta-suave`, ~12px. Detalle firmante de la marca — replicarlo en desktop.
4. **Fotos:** esquinas muy redondeadas (radius ~24px), sin borde, sin sombra dura. Retratos del Consejo: círculos perfectos.
5. **Tarjetas:** rectángulo sólido `verde` o `verde-900` alternado en grid, sin radius (esquinas rectas), título Bold blanco centrado + descripción Regular. Contraste alto.
6. **Pills:** rectángulo `verde-900` con radius completo (`rounded-full`), texto blanco Bold. Ej: "Objetivo", "Organismos de Certificación".
7. **Panel diagonal del hero:** polígono `verde` recortado en diagonal, con mapa de México punteado en blanco encima, sobre un collage de fotos industriales en escala de grises separadas por diagonales blancas.

## Logo

Wordmark `COMENOR` en negro con tracking amplio (~0.35em), entre dos swooshes:
- swoosh superior `verde`, cóncavo, sobre las letras
- swoosh inferior `vino`, convexo, bajo las letras

Versión sobre fondo verde (slide 14): mismos swooshes, wordmark blanco.
Es vectorial en el PDF → extraer/reconstruir como SVG, dos variantes (`logo-color.svg`, `logo-blanco.svg`). NUNCA usar el PNG rasterizado del WordPress viejo.

## Inventario de contenido de las 15 slides

1. Portada — hero con panel diagonal, mapa de México, collage industrial
2. ¿Quiénes somos? — texto + foto grupal del Consejo
3. Consejo Directivo — organigrama con retratos circulares (10 personas, nombres y cargos reales en `text/presentacion.txt`)
4. Nuestros asociados y miembros — 4 columnas con pills + logos de asociados
5–7. Ecosistema, arquitectura técnica (grid de 6 tarjetas), código de ética (10 principios)
8. Agenda COMENOR — texto + foto
9–13. Ejes temáticos (pill "Objetivo" + grid "Líneas de acción")
14. Redes Sociales — fondo `verde`, lista con iconos, foto circular
15. Contacto — dos tarjetas (mail / teléfono)

Estas slides son el mapa de contenido del sitio: quiénes somos, consejo directivo, asociados, ecosistema, código de ética, agenda, ejes temáticos, contacto. El copy real está en `design-source/text/presentacion.txt` — usarlo, cero lorem ipsum.
