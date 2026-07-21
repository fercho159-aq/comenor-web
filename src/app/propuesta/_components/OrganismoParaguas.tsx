import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * Sección #3 · id="paraguas" — "Organismo Paraguas".
 *
 * Primera ancla oscura de la página (banda verde full-bleed, `.tema-oscuro`
 * para el anillo de foco blanco). No es una tarjeta-diapositiva: es una
 * declaración manifiesto alineada a la izquierda sobre la retícula del
 * "documento normativo", con el lomo de referencia (spine) en el margen.
 *
 * Copy: transcripción institucional del cliente
 * (design-source/text/presentacion.txt, L93-104 y L109-115). Cero texto inventado.
 *
 * Server Component: sin estado ni handlers. La animación de entrada la aportan
 * los islands cliente <Revelar>/<RevelarGrupo> (SSR-safe, respetan
 * prefers-reduced-motion).
 */

const DIMENSIONES = [
  { nombre: "Normalización", detalle: "NOM · NMX · EMX" },
  { nombre: "Certificación", detalle: "Organismos de Certificación" },
  { nombre: "Laboratorios", detalle: "Ensayo y calibración" },
  { nombre: "Inspección", detalle: "Unidades de inspección" },
] as const;

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
      <div className="mx-auto w-full max-w-[75rem] px-6 py-24 sm:px-8 lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10 lg:px-12 lg:py-40">
        {/* Lomo de referencia (spine) — solo desktop */}
        <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-3">
          <span className="text-[1.5rem] font-light leading-none tabular-nums text-salvia">
            03
          </span>
          <span className="text-[0.6875rem] font-medium uppercase leading-tight tracking-[0.18em] text-salvia/80">
            Organismo
            <br />
            Paraguas
          </span>
          <span aria-hidden className="mt-1 block h-0.5 w-3 bg-vino" />
        </div>

        {/* Columna de contenido — hairline continua del "documento" */}
        <div className="lg:border-l lg:border-salvia/20 lg:pl-10">
          {/* Spine colapsado a eyebrow horizontal en <lg */}
          <p className="mb-6 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia/80 lg:hidden">
            <span className="tabular-nums text-salvia">03</span>
            <span aria-hidden>·</span>
            <span>Organismo Paraguas</span>
            <span aria-hidden className="ml-1 h-0.5 w-3 bg-vino" />
          </p>

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

          {/* Las cuatro dimensiones como taxonomía inline (no tarjetas sólidas) */}
          <RevelarGrupo
            as="dl"
            className="mt-14 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4"
          >
            {DIMENSIONES.map((d) => (
              <div
                key={d.nombre}
                className="border-t border-salvia/20 pt-5 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0"
              >
                <dt className="text-[1.125rem] font-bold leading-snug text-blanco">
                  {d.nombre}
                </dt>
                <dd className="mt-1 text-[0.9375rem] leading-snug text-salvia">
                  {d.detalle}
                </dd>
              </div>
            ))}
          </RevelarGrupo>

          {/* Mandato Estatutario — fila de referencia pequeña */}
          <div className="mt-16 border-t border-salvia/20 pt-10">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-salvia">
              Mandato Estatutario — Estatutos COMENOR, reformados julio 2024
            </p>
            <RevelarGrupo
              as="ul"
              className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2"
            >
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
      </div>
    </section>
  );
}
