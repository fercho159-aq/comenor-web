import {
  Handshake,
  Landmark,
  Network,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección "Visión 2026 — Prioridades para COMENOR" (id: vision2026).
 *
 * Segunda ancla oscura (banda verde full-bleed, `.tema-oscuro`). Ritmo
 * variado: cabecera horizontal (eyebrow + H2 a la izquierda, etiqueta de
 * alcance a la derecha en lg) y las cuatro prioridades en cuadrícula 2×2 a
 * todo el ancho con divisores hairline salvia/15. Sin lomo numerado.
 *
 * Uso quirúrgico del vino en esta banda: SOLO la micro-etiqueta "OBSTÁCULO
 * ESTRUCTURAL" de la Prioridad 01. Énfasis = bold del mismo color.
 *
 * Copy literal de design-source/text/presentacion.txt (L290-322). Cero texto
 * inventado. La entrada 03 resuelve el artefacto de OCR de la fuente
 * ("Posicionamientos técnicos:; COMENOR…") a su lectura evidente.
 */

interface Prioridad {
  indice: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
  critico?: boolean;
}

const PRIORIDADES: readonly Prioridad[] = [
  {
    indice: "01",
    icono: ScrollText,
    titulo: "Reglamento de la LIC — el obstáculo estructural",
    // Reducción editorial: se omite la cláusula final de la fuente.
    descripcion:
      "Pendiente desde agosto 2021. Sin él, la transición ONN→ONE está bloqueada y 490+ NMX de seis organismos miembros permanecen represadas.",
    critico: true,
  },
  {
    indice: "02",
    icono: Handshake,
    titulo: "T-MEC Capítulo 11 — posicionamiento soberano",
    descripcion:
      "México requiere posicionamientos técnicos propios en barreras no arancelarias y convergencia normativa trilateral.",
  },
  {
    indice: "03",
    icono: Landmark,
    titulo: "Mesas institucionales",
    descripcion:
      "Posicionamientos técnicos de COMENOR, con agenda estructurada ante Autoridades.",
  },
  {
    indice: "04",
    icono: Network,
    titulo: "Fortalecimiento del ecosistema — visión 2026",
    descripcion:
      "Formación avanzada, expansión de membresía e integración en foros regionales e internacionales.",
  },
];

export default function Prioridades2026() {
  return (
    <section
      id="vision2026"
      className="tema-oscuro bg-verde py-24 text-blanco lg:py-36"
    >
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        {/* Cabecera horizontal */}
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia">
              <span aria-hidden className="block h-0.5 w-6 bg-vino" />
              Visión 2026
            </p>
            <Revelar
              as="h2"
              className="mt-5 max-w-[16ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-blanco text-balance"
            >
              Prioridades para COMENOR
            </Revelar>
          </div>
          <p className="mt-6 shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.18em] tabular-nums text-salvia/80 lg:mt-0 lg:pb-2">
            Cuatro frentes · 2026
          </p>
        </div>

        {/* Cuadrícula 2×2 con divisores hairline salvia/15 */}
        <RevelarGrupo className="mt-12 grid grid-cols-1 border-l border-t border-salvia/15 sm:grid-cols-2 lg:mt-16">
          {PRIORIDADES.map((prioridad) => (
            <article
              key={prioridad.indice}
              className="border-b border-r border-salvia/15 p-8 lg:p-10"
            >
              <span className="flex items-start justify-between gap-4">
                <span className="block font-light tabular-nums text-[2rem] leading-none text-salvia">
                  {prioridad.indice}
                </span>
                <prioridad.icono
                  aria-hidden
                  className="size-6 text-salvia"
                  strokeWidth={1.5}
                />
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
    </section>
  );
}
