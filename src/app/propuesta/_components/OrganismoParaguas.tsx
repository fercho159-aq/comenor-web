import {
  BadgeCheck,
  BookOpenCheck,
  FlaskConical,
  SearchCheck,
  type LucideIcon,
} from "lucide-react";
import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección "Organismo Paraguas" (id: paraguas).
 *
 * Primera ancla oscura de la página (banda verde full-bleed, `.tema-oscuro`).
 * Ritmo variado: split 3/2 en lg — manifiesto grande en peso ligero a la
 * izquierda, Mandato Estatutario como bloque de referencia a la derecha; las
 * cuatro dimensiones cierran en una fila full-width de 4 columnas. Sin lomo
 * numerado (leía como línea de tiempo).
 *
 * Copy: design-source/text/presentacion.txt L93-115. Cero texto inventado.
 * Server Component; el movimiento vive en <Revelar>/<RevelarGrupo> (client).
 */

const DIMENSIONES = [
  { nombre: "Normalización", detalle: "NOM · NMX · EMX", icono: BookOpenCheck },
  {
    nombre: "Certificación",
    detalle: "Organismos de Certificación",
    icono: BadgeCheck,
  },
  {
    nombre: "Laboratorios",
    detalle: "Ensayo y calibración",
    icono: FlaskConical,
  },
  {
    nombre: "Inspección",
    detalle: "Unidades de inspección",
    icono: SearchCheck,
  },
] as const satisfies ReadonlyArray<{
  nombre: string;
  detalle: string;
  icono: LucideIcon;
}>;

const MANDATO = [
  "Armonización con ISO · IEC · CODEX y organismos internacionales",
  "Acuerdos de reconocimiento mutuo bilateral y multilateral",
  "Interlocutor ante los tres Poderes del Estado Mexicano",
  "Catálogo Nacional de NMX, NOM y Estándares actualizado",
] as const;

export default function OrganismoParaguas() {
  return (
    <section
      id="paraguas"
      aria-labelledby="paraguas-titulo"
      className="tema-oscuro bg-verde text-blanco"
    >
      <div className="mx-auto w-full max-w-[75rem] px-6 py-24 sm:px-8 lg:px-12 lg:py-36">
        <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia/80">
          <span aria-hidden className="block h-0.5 w-6 bg-vino" />
          Organismo Paraguas
        </p>

        <div className="mt-10 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-x-16">
          {/* Declaración manifiesto (peso ligero grande = anti-slide) */}
          <Revelar
            as="h2"
            className="max-w-[30ch] text-balance text-[clamp(1.5rem,1rem+2vw,2.25rem)] font-light leading-[1.25] tracking-[-0.005em] text-blanco"
          >
            <span id="paraguas-titulo">
              Somos el <strong className="font-bold">organismo paraguas</strong>{" "}
              que representa y articula el ecosistema nacional de
              Infraestructura de la Calidad en México desde 1996. COMENOR actúa
              como{" "}
              <strong className="font-bold">
                interlocutor técnico e institucional
              </strong>{" "}
              ante el gobierno, el sector productivo y los foros internacionales
              — vinculando organismos de normalización, certificación,
              laboratorios y unidades de inspección acreditados.
            </span>
          </Revelar>

          {/* Mandato Estatutario — bloque de referencia lateral */}
          <div className="mt-14 lg:mt-0 lg:border-l lg:border-salvia/20 lg:pl-10">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia">
              Mandato Estatutario — Estatutos COMENOR, reformados julio 2024
            </p>
            <RevelarGrupo as="ul" className="mt-6 space-y-5">
              {MANDATO.map((punto) => (
                <li
                  key={punto}
                  className="flex gap-3 text-[0.9375rem] leading-relaxed text-salvia"
                >
                  <span
                    aria-hidden
                    className="mt-2.5 h-0.5 w-2 shrink-0 bg-vino"
                  />
                  <span className="text-pretty">{punto}</span>
                </li>
              ))}
            </RevelarGrupo>
          </div>
        </div>

        {/* Las cuatro dimensiones — fila full-width de cierre */}
        <RevelarGrupo
          as="dl"
          className="mt-16 grid grid-cols-1 gap-y-6 border-t border-salvia/20 pt-10 sm:grid-cols-2 sm:gap-x-8 lg:mt-20 lg:grid-cols-4"
        >
          {DIMENSIONES.map((d, i) => {
            const Icono = d.icono;
            return (
              <div
                key={d.nombre}
                className={
                  i > 0
                    ? "sm:border-l sm:border-salvia/20 sm:pl-6"
                    : undefined
                }
              >
                <Icono
                  aria-hidden
                  className="size-6 text-salvia"
                  strokeWidth={1.5}
                />
                <dt className="mt-3 text-[1.125rem] font-bold leading-snug text-blanco">
                  {d.nombre}
                </dt>
                <dd className="mt-1 text-[0.9375rem] leading-snug text-salvia">
                  {d.detalle}
                </dd>
              </div>
            );
          })}
        </RevelarGrupo>
      </div>
    </section>
  );
}
