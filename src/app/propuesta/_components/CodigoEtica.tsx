import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección 5 (id: principios) — "Código de Ética".
 *
 * Dirección "Norma": el catálogo de principios se renderiza como un CÓDIGO
 * ARTICULADO, no como un tablero de tarjetas de slide. Cada principio es un
 * artículo con su numeral romano sobre una retícula estricta de filas con
 * hairline salvia, alineado a la izquierda. El numerado aquí es legítimo: el
 * orden es contenido (Art. I … X del Código de Ética COMENOR).
 *
 * Copy: design-source/text/presentacion.txt (título de imparcialidad, los diez
 * principios I–X y la ficha "Vinculante · Obligatorio / Art. 2"). Cero texto
 * inventado.
 *
 * Server Component: sin estado propio; el movimiento vive en <Revelar> /
 * <RevelarGrupo> (client) que se componen desde aquí.
 */

/** Los diez principios, en el orden de la fuente (Art. I … X). */
const PRINCIPIOS: ReadonlyArray<{ numeral: string; texto: string }> = [
  { numeral: "I", texto: "Legalidad" },
  { numeral: "II", texto: "Integridad y honestidad profesional" },
  { numeral: "III", texto: "Independencia técnica y de criterio" },
  { numeral: "IV", texto: "Imparcialidad y objetividad" },
  { numeral: "V", texto: "Transparencia y rendición de cuentas" },
  { numeral: "VI", texto: "Responsabilidad institucional" },
  { numeral: "VII", texto: "Confidencialidad" },
  { numeral: "VIII", texto: "Respeto y colaboración técnica" },
  { numeral: "IX", texto: "Prevención de conflictos de interés" },
  { numeral: "X", texto: "Protección del interés público y colectivo" },
];

export default function CodigoEtica() {
  return (
    <section id="principios" className="bg-humo py-20 lg:py-32">
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10">
          {/* Lomo de referencia (spine) — solo desktop */}
          <Revelar
            as="div"
            className="hidden lg:flex lg:flex-col lg:items-start"
          >
            <span className="font-light tabular-nums text-[1.5rem] leading-none text-verde">
              03
            </span>
            <span className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              Principios
            </span>
            <span
              aria-hidden="true"
              className="mt-4 block h-0.5 w-3 bg-vino"
            />
          </Revelar>

          {/* Columna de contenido — margen continuo del documento (hairline) */}
          <div className="lg:border-l lg:border-salvia lg:pl-10">
            {/* Spine colapsado a eyebrow inline — solo <lg */}
            <p className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave lg:hidden">
              <span className="font-light tabular-nums text-[0.875rem] text-verde">
                03
              </span>
              <span aria-hidden="true">·</span>
              <span>Principios</span>
              <span
                aria-hidden="true"
                className="ml-1 block h-0.5 w-3 bg-vino"
              />
            </p>

            <Revelar
              as="h2"
              className="mt-4 max-w-[26ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-balance text-verde lg:mt-0"
            >
              Los principios que garantizan la imparcialidad que el mercado
              internacional exige
            </Revelar>

            {/* El código: diez artículos en dos columnas, retícula estricta */}
            <RevelarGrupo
              as="ol"
              stagger={0.05}
              className="mt-12 grid grid-cols-1 gap-x-12 gap-y-0 lg:mt-16 lg:grid-cols-2"
            >
              {PRINCIPIOS.map(({ numeral, texto }) => (
                <li
                  key={numeral}
                  className="grid grid-cols-[3rem_1fr] items-baseline gap-x-2 border-t border-salvia py-5"
                >
                  <span
                    aria-hidden="true"
                    className="font-light tabular-nums text-[1.5rem] leading-none text-verde"
                  >
                    {numeral}
                  </span>
                  <span className="text-[1.0625rem] font-normal leading-snug text-tinta text-pretty">
                    {texto}
                  </span>
                </li>
              ))}
            </RevelarGrupo>

            {/* Ficha de referencia: carácter vinculante + artículo de origen */}
            <Revelar
              as="div"
              className="mt-12 flex items-start gap-3 border-t border-salvia pt-8"
            >
              <span
                aria-hidden="true"
                className="mt-2 block h-0.5 w-3 shrink-0 bg-vino"
              />
              <div>
                <p className="text-[1.0625rem] leading-relaxed text-tinta text-pretty">
                  <span className="font-bold text-verde">
                    Vinculante · Obligatorio
                  </span>{" "}
                  para todos los Asociados y Miembros
                </p>
                <p className="mt-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                  Art. 2 — Código de Ética COMENOR, 2025
                </p>
              </div>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  );
}
