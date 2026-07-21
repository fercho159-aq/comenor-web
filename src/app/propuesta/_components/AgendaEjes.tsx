import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección 04 — AGENDA · "Agenda COMENOR"
 *
 * Dirección "Norma": la página se lee como especificación técnica.
 * Retícula con LOMO DE REFERENCIA (spine) en el margen izquierdo sobre lg
 * (índice "04" + etiqueta "AGENDA" + tick vino). Bajo lg el spine colapsa a
 * una fila-eyebrow horizontal encima del H2.
 *
 * Server Component. La interacción (reveal en scroll) se delega a los
 * componentes cliente <Revelar>/<RevelarGrupo> de @/components/anim.
 *
 * Copy: design-source/text/presentacion.txt L180-289. Cero texto inventado.
 * NOTA(copy): el PPT dice "buscar impulsar" (typo); se publica la corrección
 * "busca", como ya se hace en el home actual — pendiente confirmar con cliente.
 */

type Eje = {
  indice: string;
  titulo: string;
  objetivo: string;
  lineas: string[];
};

const EJES: Eje[] = [
  {
    indice: "1",
    titulo: "Incidencia de política pública y regulación",
    objetivo:
      "Que COMENOR esté en la mesa donde se decide, no en la sala de espera.",
    lineas: [
      "Seguimiento estructurado a iniciativas de ley, reglamentos, NOMs, acuerdos y políticas públicas que impactan la IC, así como tratados internacionales.",
      "Posicionamientos técnicos consensuados (no opiniones, criterios).",
      "Mesas de diálogo con dependencias clave (SE, COFEPRIS, SENER, STPS, CRT).",
      "Propuestas proactivas de mejora regulatoria.",
    ],
  },
  {
    indice: "2",
    titulo: "Representatividad y voz del ecosistema",
    objetivo: "Que los organismos vean a COMENOR como su casa política común.",
    lineas: [
      "Activación de comisiones temáticas (por sector o transversal).",
      "Consultas internas ágiles para construir postura colectiva.",
      "Informes semestrales de impacto normativo para asociados.",
      "Promoción de servicios de asociados y miembros.",
    ],
  },
  {
    indice: "3",
    titulo: "Infraestructura de la Calidad como motor económico",
    objetivo:
      "Pasar del discurso técnico al lenguaje de competitividad y negocio.",
    lineas: [
      "Narrativa clara de la Infraestructura de la Calidad como habilitador de comercio e inversión.",
      "Análisis sectoriales: costos de incumplimiento vs beneficios de la conformidad.",
      "Vinculación con cámaras, asociaciones y cadenas de valor.",
      "Posicionamiento de la evaluación de la conformidad como inversión, no gasto.",
    ],
  },
  {
    indice: "4",
    titulo:
      "Agenda regional & internacional y cooperación técnica",
    objetivo:
      "Que COMENOR juegue en liga regional/internacional, no solo local.",
    lineas: [
      "Fortalecer vínculos con organismos homólogos y foros regionales/internacionales.",
      "Participación activa en agendas bilaterales y multilaterales.",
      "Transferencia de buenas prácticas globales al contexto mexicano.",
      "Posicionamiento de México como referente regional en el sector.",
    ],
  },
];

export default function AgendaEjes() {
  return (
    <section
      id="agenda"
      aria-labelledby="agenda-titulo"
      className="bg-humo py-20 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)]">
          {/* LOMO DE REFERENCIA (spine) — solo desktop, alineado al inicio */}
          <div className="hidden lg:block lg:pr-6">
            <div className="flex flex-col items-start">
              <span className="font-light tabular-nums text-[1.5rem] leading-none text-verde">
                04
              </span>
              <span className="mt-3 text-[0.6875rem] font-medium uppercase leading-tight tracking-[0.18em] text-tinta-suave">
                Agenda
              </span>
              {/* tick vino — frontera de sección (uso quirúrgico del acento) */}
              <span
                aria-hidden="true"
                className="mt-4 block h-[2px] w-3 bg-vino"
              />
            </div>
          </div>

          {/* Columna de contenido — hairline vertical salvia = margen del documento */}
          <div className="lg:border-l lg:border-salvia lg:pl-10">
            {/* Spine colapsado a eyebrow horizontal — solo móvil/tablet */}
            <p className="mb-6 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave lg:hidden">
              <span className="font-light tabular-nums text-tinta">04</span>
              <span aria-hidden="true">·</span>
              <span>Agenda</span>
              <span
                aria-hidden="true"
                className="ml-1 inline-block h-3 w-[3px] bg-vino"
              />
            </p>

            <Revelar>
              <h2
                id="agenda-titulo"
                className="text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-verde"
              >
                Agenda COMENOR
              </h2>

              <p className="mt-6 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.65] text-tinta">
                COMENOR busca impulsar una Infraestructura de la Calidad
                moderna, confiable e incluyente, capaz de responder a los retos
                productivos, regulatorios y sociales del país.
              </p>

              {/* Tríada "no X, sino Y" — declaración distintiva */}
              <p className="mt-6 max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.65] text-tinta">
                Nuestra agenda no busca más reglas, sino{" "}
                <b className="font-bold text-verde">mejores decisiones</b>; no
                más trámites, sino{" "}
                <b className="font-bold text-verde">más confianza</b>; no más
                fragmentación, sino{" "}
                <b className="font-bold text-verde">visión de Estado</b>.
              </p>
            </Revelar>

            {/* Ejes temáticos — agenda editorial numerada */}
            <RevelarGrupo
              as="ol"
              stagger={0.1}
              className="mt-14 list-none"
            >
              {EJES.map((eje) => (
                <li
                  key={eje.indice}
                  className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 border-t border-salvia py-8"
                >
                  {/* Índice grande — Montserrat 300 tabular */}
                  <span
                    aria-hidden="true"
                    className="font-light tabular-nums text-[clamp(2.25rem,1.6rem+2vw,3rem)] leading-none text-verde"
                  >
                    {eje.indice}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-[1.125rem] font-bold uppercase leading-snug tracking-[0.01em] text-verde">
                      {eje.titulo}
                    </h3>

                    {/* Objetivo del eje, tratado como cita */}
                    <p className="mt-4 max-w-[62ch]">
                      <span className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                        Objetivo
                      </span>
                      <span className="block text-pretty text-[1.0625rem] leading-[1.55] text-tinta">
                        {eje.objetivo}
                      </span>
                    </p>

                    {/* Líneas de acción — la "escala": cada ítem marcado con un
                        tick salvia (el vocabulario de medición de la sección) */}
                    <div className="mt-5 max-w-[62ch]">
                      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                        Líneas de acción
                      </p>
                      <ul className="space-y-2">
                        {eje.lineas.map((linea) => (
                          <li
                            key={linea}
                            className="flex gap-3 text-[0.9375rem] leading-[1.5] text-tinta-suave"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-[0.6em] block h-px w-3 shrink-0 bg-salvia"
                            />
                            <span className="min-w-0 text-pretty">{linea}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              ))}
            </RevelarGrupo>
          </div>
        </div>
      </div>
    </section>
  );
}
