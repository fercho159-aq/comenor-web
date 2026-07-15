import type { Metadata } from "next";

import { ArrowUpRight, Target } from "lucide-react";

import { Revelar, RevelarGrupo } from "@/components/anim";
import { Contenedor, Eyebrow, Foto, Pill, TarjetaSolida, Titulo } from "@/components/ui";

export const metadata: Metadata = {
  title: "Ejes temáticos",
  description:
    "La Agenda COMENOR y sus cuatro ejes temáticos: incidencia de política pública y regulación, representatividad y voz del ecosistema, infraestructura de la calidad como motor económico, y agenda regional e internacional.",
};

type Eje = {
  /** Ancla de la navegación interna. */
  id: string;
  /** Número tal como aparece en el eyebrow de la slide ("EJE TEMÁTICO 1"). */
  numero: number;
  /** Título de la slide, en mayúsculas. */
  titulo: string;
  /** Nombre corto para la navegación por anclas (no es copy de slide, es el título abreviado). */
  navegacion: string;
  objetivo: string;
  lineasDeAccion: string[];
};

/** Copy literal de las slides 09–12 de la presentación institucional 2026. */
const EJES: Eje[] = [
  {
    id: "eje-1",
    numero: 1,
    titulo: "INCIDENCIA DE POLÍTICA PÚBLICA Y REGULACIÓN",
    navegacion: "Política pública y regulación",
    objetivo: "Que COMENOR esté en la mesa donde se decide, no en la sala de espera.",
    lineasDeAccion: [
      "Seguimiento estructurado a iniciativas de ley, reglamentos, NOMs, acuerdos y políticas públicas que impactan la IC, así como tratados internacionales.",
      "Posicionamientos técnicos consensuados (no opiniones, criterios).",
      "Mesas de diálogo con dependencias clave (SE, COFEPRIS, SENER, STPS, CRT).",
      "Propuestas proactivas de mejora regulatoria.",
    ],
  },
  {
    id: "eje-2",
    numero: 2,
    titulo: "REPRESENTATIVIDAD Y VOZ DEL ECOSISTEMA",
    navegacion: "Representatividad y voz",
    objetivo: "Que los organismos vean a COMENOR como su casa política común.",
    lineasDeAccion: [
      "Activación de comisiones temáticas (por sector o transversal).",
      "Consultas internas ágiles para construir postura colectiva.",
      "Informes semestrales de impacto normativo para asociados.",
      "Promoción de servicios de asociados y miembros.",
    ],
  },
  {
    id: "eje-3",
    numero: 3,
    titulo: "INFRAESTRUCTURA DE LA CALIDAD COMO MOTOR ECONÓMICO",
    navegacion: "Motor económico",
    objetivo: "Pasar del discurso técnico al lenguaje de competitividad y negocio.",
    lineasDeAccion: [
      "Narrativa clara de la Infraestructura de la calidad como habilitador de comercio e inversión.",
      "Análisis sectoriales: costos de incumplimiento vs beneficios de la conformidad.",
      "Vinculación con cámaras, asociaciones y cadenas de valor.",
      "Posicionamiento de la evaluación de la conformidad como inversión, no gasto.",
    ],
  },
  {
    id: "eje-4",
    numero: 4,
    titulo: "AGENDA REGIONAL & INTERNACIONAL Y COOPERACIÓN TÉCNICA",
    navegacion: "Agenda internacional",
    objetivo: "Que COMENOR juegue en liga regional/internacional, no solo local.",
    lineasDeAccion: [
      "Fortalecer vínculos con organismos homólogos y foros regionales/internacionales.",
      "Participación activa en agendas bilaterales y multilaterales.",
      "Transferencia de buenas prácticas globales al contexto mexicano.",
      "Posicionamiento de México como referente regional en el sector.",
    ],
  },
];

/** Copy literal de la slide 13 ("Prioridades para COMENOR"). */
const PRIORIDADES = [
  {
    numero: "01",
    titulo: "Reglamento de la LIC — el obstáculo estructural",
    texto:
      "Pendiente desde agosto 2021. Sin él, la transición ONN→ONE está bloqueada y 490+ NMX de seis organismos miembros permanecen represadas — erosionando 30 años de propiedad intelectual normativa mexicana.",
  },
  {
    numero: "02",
    titulo: "T-MEC Capítulo 11 — posicionamiento soberano",
    texto:
      "México requiere posicionamientos técnicos propios en barreras no arancelarias y convergencia normativa trilateral. COMENOR debe ser la voz del ecosistema en esta mesa.",
  },
  {
    numero: "03",
    titulo: "Mesas institucionales",
    texto:
      "Posicionamientos técnicos: COMENOR, con agenda estructurada ante Autoridades. La incidencia no puede ser episódica — debe ser institucionalizada.",
  },
  {
    numero: "04",
    titulo: "Fortalecimiento del ecosistema — visión 2026",
    texto:
      "Formación avanzada, expansión de membresía e integración en foros regionales e internacionales.",
  },
];

/**
 * Las tarjetas de "Líneas de acción" de las slides llevan una sola frase en peso
 * regular, no un titular Bold: se ajusta el <h3> de TarjetaSolida desde fuera,
 * sin tocar el componente compartido.
 */
const CLASE_LINEA = "[&>h3]:text-cuerpo [&>h3]:font-normal [&>h3]:text-balance";

export default function EjesPage() {
  return (
    <>
      {/* Slide 08 — Agenda COMENOR */}
      <section className="py-16 lg:py-24">
        <Contenedor>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>Nuestro trabajo</Eyebrow>
              <Titulo as="h1" className="mt-3">
                Agenda COMENOR
              </Titulo>
              {/* NOTA: el PPT dice "buscar impulsar" (typo); publicamos la corrección — pendiente de confirmar con el cliente. */}
              <p className="text-cuerpo mt-6 max-w-prose text-pretty">
                <strong className="font-bold">COMENOR</strong> busca impulsar una{" "}
                <strong className="font-bold">Infraestructura de la Calidad</strong> moderna,
                confiable e incluyente, capaz de responder a los retos productivos, regulatorios y
                sociales del país. Nuestra agenda no busca más reglas, sino{" "}
                <strong className="font-bold">mejores decisiones</strong>; no más trámites, sino{" "}
                <strong className="font-bold">más confianza</strong>; no más fragmentación, sino{" "}
                <strong className="font-bold">visión de Estado.</strong>
              </p>
            </div>
            <Foto
              src="/media/ejes/agenda-comenor-calendario.jpg"
              alt="Agenda de papel abierta sobre un escritorio de madera."
              width={2048}
              height={1371}
              priority
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="aspect-[4/3] w-full"
            />
          </div>
        </Contenedor>
      </section>

      {/* Navegación interna por anclas (solo desktop) */}
      <nav
        aria-label="Ejes temáticos"
        className="sticky top-20 z-10 hidden border-y border-salvia bg-humo/95 backdrop-blur lg:block"
      >
        <Contenedor>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4">
            {EJES.map((eje) => (
              <li key={eje.id}>
                <a
                  href={`#${eje.id}`}
                  className="text-eyebrow tracking-eyebrow text-tinta-suave uppercase transition-colors hover:text-verde focus-visible:text-verde"
                >
                  <span className="font-bold text-verde">0{eje.numero}</span>{" "}
                  {eje.navegacion}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#vision-2026"
                className="text-eyebrow tracking-eyebrow text-tinta-suave uppercase transition-colors hover:text-verde focus-visible:text-verde"
              >
                <span className="font-bold text-verde">Visión</span> 2026
              </a>
            </li>
          </ul>
        </Contenedor>
      </nav>

      {/* Slides 09–12 — Ejes temáticos */}
      {EJES.map((eje) => (
        <section
          key={eje.id}
          id={eje.id}
          aria-label={`Eje temático ${eje.numero}: ${eje.titulo}`}
          className="scroll-mt-24 py-14 lg:scroll-mt-40 lg:py-20"
        >
          <Contenedor>
            <Revelar>
              <Eyebrow>Eje temático {eje.numero}</Eyebrow>
              <Titulo as="h2" className="mt-3 uppercase">
                {eje.titulo}
              </Titulo>
            </Revelar>

            <Revelar
              as="div"
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8"
            >
              <Pill tamano="lg" className="self-start sm:self-auto">
                <span className="inline-flex items-center gap-2">
                  <Target className="size-5" strokeWidth={1.75} aria-hidden />
                  Objetivo
                </span>
              </Pill>
              <p className="text-titulo max-w-3xl text-pretty text-tinta">{eje.objetivo}</p>
            </Revelar>

            <Revelar as="h3" className="text-titulo mt-14 text-center text-verde">
              Líneas de acción
            </Revelar>
            <RevelarGrupo
              as="ul"
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {eje.lineasDeAccion.map((linea, indice) => (
                <li key={linea}>
                  <TarjetaSolida
                    titulo={linea}
                    variante={indice % 2 === 0 ? "verde-700" : "verde-900"}
                    glifo={<ArrowUpRight className="size-6" strokeWidth={1.75} />}
                    className={CLASE_LINEA}
                  />
                </li>
              ))}
            </RevelarGrupo>
          </Contenedor>
        </section>
      ))}

      {/* Slide 13 — Visión 2026 */}
      <section
        id="vision-2026"
        aria-label="Visión 2026: prioridades para COMENOR"
        className="tema-oscuro scroll-mt-24 bg-verde py-16 lg:scroll-mt-40 lg:py-24"
      >
        <Contenedor>
          <Revelar>
            <Eyebrow variante="sobre-oscuro">Visión 2026</Eyebrow>
            <Titulo as="h2" variante="sobre-oscuro" className="mt-3">
              Prioridades para COMENOR
            </Titulo>
          </Revelar>

          <RevelarGrupo as="ol" className="mt-12 flex flex-col">
            {PRIORIDADES.map((prioridad, indice) => (
              <li
                key={prioridad.numero}
                className={
                  indice > 0
                    ? "border-t border-dashed border-salvia/40 pt-8 mt-8"
                    : undefined
                }
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                  <span
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-full bg-verde-900 text-base font-bold text-blanco"
                  >
                    {prioridad.numero}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-blanco sm:text-xl">
                      {prioridad.titulo}
                    </h3>
                    <p className="text-cuerpo mt-2 max-w-4xl text-pretty text-salvia">
                      {prioridad.texto}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </RevelarGrupo>

          <Revelar
            as="p"
            className="text-titulo mt-14 text-balance font-bold italic text-blanco"
          >
            Que COMENOR esté en la mesa donde se decide — no en la sala de espera.
          </Revelar>
        </Contenedor>
      </section>
    </>
  );
}
