import { ShieldCheck } from "lucide-react";
import { Revelar, RevelarGrupo } from "@/components/anim";
import { ChipIcono } from "@/components/ui";

/**
 * Sección "Código de Ética" (id: principios).
 *
 * Ritmo variado: split 4/8 en lg — columna izquierda pegajosa (sticky) con
 * eyebrow, H2 y la ficha de carácter vinculante; columna derecha con los diez
 * principios como código articulado en dos columnas de filas hairline. La
 * numeración romana aquí es legítima: el orden es contenido (Art. I … X).
 * Sin lomo de sección numerado.
 *
 * Copy: design-source/text/presentacion.txt (título de imparcialidad, los
 * diez principios I–X, ficha "Vinculante · Obligatorio / Art. 2"). Cero texto
 * inventado.
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
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Columna editorial (sticky en lg) */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                <span aria-hidden className="block h-0.5 w-6 bg-vino" />
                Principios
              </p>

              <Revelar
                as="h2"
                className="mt-5 max-w-[18ch] text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-bold leading-[1.12] tracking-[-0.01em] text-balance text-verde"
              >
                Los principios que garantizan la imparcialidad que el mercado
                internacional exige
              </Revelar>

              {/* Ficha de referencia: carácter vinculante + artículo de origen */}
              <Revelar
                as="div"
                className="mt-10 flex items-start gap-4 border-t border-salvia pt-8"
              >
                <ChipIcono icon={ShieldCheck} />
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

          {/* El código: diez artículos en dos columnas de filas hairline */}
          <div className="mt-12 lg:col-span-8 lg:mt-0">
            <RevelarGrupo
              as="ol"
              stagger={0.05}
              className="grid grid-cols-1 gap-x-12 gap-y-0 sm:grid-cols-2"
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
          </div>
        </div>
      </div>
    </section>
  );
}
