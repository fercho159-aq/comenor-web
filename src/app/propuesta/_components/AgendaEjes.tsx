import {
  Globe,
  Landmark,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Revelar, RevelarGrupo } from "@/components/anim";
import { Boton, ChipIcono, Foto } from "@/components/ui";

/**
 * Sección "Agenda COMENOR" (id: agenda).
 *
 * Ritmo variado: la introducción es un split horizontal (H2 a la izquierda,
 * párrafos a la derecha en lg) y los cuatro ejes van en una CUADRÍCULA 2×2 de
 * celdas con hairlines salvia — no una lista vertical numerada (leía como
 * línea de tiempo). El índice grande dentro de cada celda es contenido (Eje
 * 1–4 de la fuente).
 *
 * Copy: design-source/text/presentacion.txt L180-289. Cero texto inventado.
 * NOTA(copy): el PPT dice "buscar impulsar" (typo); se publica la corrección
 * "busca", como ya se hace en el home actual — pendiente confirmar con cliente.
 */

type Eje = {
  indice: string;
  titulo: string;
  objetivo: string;
  icono: LucideIcon;
};

const EJES: Eje[] = [
  {
    indice: "1",
    icono: Landmark,
    titulo: "Incidencia de política pública y regulación",
    objetivo:
      "Que COMENOR esté en la mesa donde se decide, no en la sala de espera.",
  },
  {
    indice: "2",
    icono: Users,
    titulo: "Representatividad y voz del ecosistema",
    objetivo: "Que los organismos vean a COMENOR como su casa política común.",
  },
  {
    indice: "3",
    icono: TrendingUp,
    titulo: "Infraestructura de la Calidad como motor económico",
    objetivo:
      "Pasar del discurso técnico al lenguaje de competitividad y negocio.",
  },
  {
    indice: "4",
    icono: Globe,
    titulo: "Agenda regional & internacional y cooperación técnica",
    objetivo:
      "Que COMENOR juegue en liga regional/internacional, no solo local.",
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
        {/* Introducción: split horizontal título ↔ postura */}
        <Revelar>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
            <div className="lg:col-span-5">
              <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                <span aria-hidden className="block h-0.5 w-6 bg-vino" />
                Nuestro trabajo
              </p>
              <h2
                id="agenda-titulo"
                className="mt-5 text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-verde"
              >
                Agenda COMENOR
              </h2>
            </div>

            {/* Reducción editorial: solo la tríada distintiva; el párrafo
                introductorio completo vive en /ejes. */}
            <div className="mt-6 lg:col-span-7 lg:mt-1">
              <p className="max-w-[60ch] text-pretty text-[1.0625rem] leading-[1.65] text-tinta">
                Nuestra agenda no busca más reglas, sino{" "}
                <b className="font-bold text-verde">mejores decisiones</b>; no
                más trámites, sino{" "}
                <b className="font-bold text-verde">más confianza</b>; no más
                fragmentación, sino{" "}
                <b className="font-bold text-verde">visión de Estado</b>.
              </p>
            </div>
          </div>
        </Revelar>

        {/* Banner fotográfico: la agenda en acción (foto real del cliente) */}
        <Revelar delay={0.1}>
          <Foto
            src="/media/ejes/agenda-comenor-calendario.jpg"
            alt="Sesión de trabajo de la agenda COMENOR."
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="mt-12 aspect-[16/9] w-full sm:aspect-[21/9] lg:mt-16"
          />
        </Revelar>

        {/* Ejes temáticos — cuadrícula 2×2 de celdas hairline */}
        <RevelarGrupo
          as="ol"
          stagger={0.1}
          className="mt-14 grid list-none grid-cols-1 border-t border-salvia sm:border-l lg:mt-20 lg:grid-cols-2"
        >
          {EJES.map((eje) => (
            <li
              key={eje.indice}
              className="border-b border-salvia p-7 sm:border-r lg:p-10"
            >
              {/* Índice del eje (contenido de la fuente) + ícono decorativo */}
              <span className="flex items-start justify-between gap-4">
                <span
                  aria-hidden="true"
                  className="block font-light tabular-nums text-[clamp(2.25rem,1.6rem+2vw,3rem)] leading-none text-verde"
                >
                  {eje.indice}
                </span>
                <ChipIcono icon={eje.icono} />
              </span>

              <h3 className="mt-4 text-[1.125rem] font-bold uppercase leading-snug tracking-[0.01em] text-verde">
                {eje.titulo}
              </h3>

              {/* Reducción editorial: solo el objetivo; las líneas de acción
                  de cada eje viven completas en /ejes. */}
              <p className="mt-4 max-w-[52ch]">
                <span className="mb-1 block text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
                  Objetivo
                </span>
                <span className="block text-pretty text-[1.0625rem] leading-[1.55] text-tinta">
                  {eje.objetivo}
                </span>
              </p>
            </li>
          ))}
        </RevelarGrupo>

        {/* El detalle (líneas de acción por eje) vive en /ejes */}
        <Revelar as="div" className="mt-12">
          <Boton href="/ejes" variante="secundario">
            Ver la agenda completa
          </Boton>
        </Revelar>
      </div>
    </section>
  );
}
