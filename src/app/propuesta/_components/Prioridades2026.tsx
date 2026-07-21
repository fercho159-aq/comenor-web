import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección 05 · VISIÓN 2026 — "Prioridades para COMENOR"
 *
 * Dirección de diseño "Norma": SEGUNDA ancla oscura de la página. Banda verde
 * #004F4A full-bleed con .tema-oscuro (para que el anillo de foco sea blanco).
 * Server Component; el movimiento vive en <Revelar>/<RevelarGrupo> (client)
 * importados, sin convertir este archivo en cliente.
 *
 * Layout:
 * - lg: retícula grid-cols-[7rem_1fr] gap-10. La primera celda es el spine
 *   (índice tabular '05' en salvia, etiqueta 'VISIÓN 2026', tick vino). La
 *   columna de contenido lleva la hairline vertical salvia/15 (border-l) que
 *   continúa el margen del "documento".
 * - <lg: el spine colapsa a un eyebrow horizontal encima del H2.
 * - Las 4 prioridades en cuadrícula 2×2 (lg:grid-cols-2) con divisores hairline
 *   salvia/15; en móvil se apilan en una sola columna.
 *
 * Uso quirúrgico del vino en esta banda: SOLO la micro-etiqueta "OBSTÁCULO
 * ESTRUCTURAL" de la Prioridad 01 (marca el bloqueo crítico real). El resto es
 * verde/salvia/blanco. Énfasis = bold del mismo color, jamás vino en texto.
 *
 * Copy literal de design-source/text/presentacion.txt (L290-322). Cero texto
 * inventado. La entrada del catálogo 03 resuelve el artefacto de OCR de la
 * fuente ("Posicionamientos técnicos:; COMENOR…") a su lectura evidente.
 */

interface Prioridad {
  indice: string;
  titulo: string;
  descripcion: string;
  critico?: boolean;
}

const PRIORIDADES: readonly Prioridad[] = [
  {
    indice: "01",
    titulo: "Reglamento de la LIC — el obstáculo estructural",
    descripcion:
      "Pendiente desde agosto 2021. Sin él, la transición ONN→ONE está bloqueada y 490+ NMX de seis organismos miembros permanecen represadas — erosionando 30 años de propiedad intelectual normativa mexicana.",
    critico: true,
  },
  {
    indice: "02",
    titulo: "T-MEC Capítulo 11 — posicionamiento soberano",
    descripcion:
      "México requiere posicionamientos técnicos propios en barreras no arancelarias y convergencia normativa trilateral. COMENOR debe ser la voz del ecosistema en esta mesa.",
  },
  {
    indice: "03",
    titulo: "Mesas institucionales",
    descripcion:
      "Posicionamientos técnicos de COMENOR, con agenda estructurada ante Autoridades. La incidencia no puede ser episódica — debe ser institucionalizada.",
  },
  {
    indice: "04",
    titulo: "Fortalecimiento del ecosistema — visión 2026",
    descripcion:
      "Formación avanzada, expansión de membresía e integración en foros regionales e internacionales.",
  },
];

export default function Prioridades2026() {
  return (
    <section
      id="vision2026"
      className="tema-oscuro bg-verde py-24 text-blanco lg:py-40"
    >
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10">
          {/* Spine (lomo de referencia) — solo desktop */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:pt-2">
            <span className="font-light tabular-nums text-[1.5rem] leading-none text-salvia">
              05
            </span>
            <span className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia">
              Visión 2026
            </span>
            <span aria-hidden className="mt-4 block h-[2px] w-3 bg-vino" />
          </div>

          {/* Columna de contenido con la hairline salvia como margen del documento */}
          <div className="lg:border-l lg:border-salvia/15 lg:pl-10">
            {/* Spine colapsado a eyebrow inline — solo móvil/tablet */}
            <p className="mb-6 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia lg:hidden">
              <span className="tabular-nums">05</span>
              <span aria-hidden>·</span>
              <span>Visión 2026</span>
              <span
                aria-hidden
                className="ml-1 inline-block h-[11px] w-[3px] bg-vino"
              />
            </p>

            <Revelar
              as="h2"
              className="max-w-[16ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-blanco text-balance"
            >
              Prioridades para COMENOR
            </Revelar>

            {/* Cuadrícula 2×2 de prioridades con divisores hairline salvia/15 */}
            <RevelarGrupo className="mt-12 grid grid-cols-1 border-t border-l border-salvia/15 sm:grid-cols-2">
              {PRIORIDADES.map((prioridad) => (
                <article
                  key={prioridad.indice}
                  className="border-b border-r border-salvia/15 p-8 lg:p-10"
                >
                  <span className="block font-light tabular-nums text-[2rem] leading-none text-salvia">
                    {prioridad.indice}
                  </span>

                  {prioridad.critico ? (
                    <p className="mt-4 inline-flex items-center gap-2 bg-vino px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-blanco">
                      <span aria-hidden className="block h-[2px] w-3 bg-blanco" />
                      Obstáculo estructural
                    </p>
                  ) : null}

                  <h3 className="mt-4 max-w-[28ch] text-[1.125rem] font-bold leading-[1.25] text-blanco text-balance">
                    {prioridad.titulo}
                  </h3>

                  <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-salvia text-pretty">
                    {prioridad.descripcion}
                  </p>
                </article>
              ))}
            </RevelarGrupo>
          </div>
        </div>
      </div>
    </section>
  );
}
