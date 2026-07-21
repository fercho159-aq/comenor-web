import Image from "next/image";
import Link from "next/link";
import { Revelar, RevelarGrupo } from "@/components/anim";

/**
 * HeroTesis — sección #1 (id: hero) de la propuesta.
 *
 * Dirección "Norma": hero tipográfico, cero imagen, alineado a la izquierda
 * sobre la retícula del documento. El swoosh de slide se sustituye por "la
 * escala": una regla de marcas de medición al pie que evoca medir/evaluar la
 * conformidad — el trabajo real de COMENOR.
 *
 * Server Component: solo importa las primitivas de animación (client) como
 * envoltorios; no necesita estado propio.
 *
 * Copy: design-source/text/presentacion.txt
 *   L1-7  nombre + tesis; L96 "desde 1996" / "NOM ·NMX/ EMX"; L301 "490+ NMX";
 *   L111-113 "Armonización con ISO · IEC · CODEX" / "Catálogo Nacional… Estándares".
 */

/** Cabecera de especificación: etiqueta (source-grounded) + valor tabular. */
const METADATOS: ReadonlyArray<{ etiqueta: string; valor: string }> = [
  { etiqueta: "DESDE", valor: "1996" },
  { etiqueta: "CATÁLOGO", valor: "490+ NMX" },
  { etiqueta: "ARMONIZACIÓN", valor: "ISO · IEC · CODEX" },
  { etiqueta: "ESTÁNDARES", valor: "NOM · NMX / EMX" },
];

/** Líneas de la tesis; se revelan en secuencia al cargar. Todo va en 700. */
const TESIS: ReadonlyArray<string> = [
  "La confianza técnica",
  "que estandariza y evalúa",
  "lo Hecho en México.",
];

/** "La escala": 49 marcas, cada 5.ª más alta. Decoración estructural (aria-hidden). */
const TICKS = Array.from({ length: 49 }, (_, i) => i);

export default function HeroTesis() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-humo py-20 lg:flex lg:min-h-[85vh] lg:flex-col lg:justify-center lg:py-32"
    >
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        {/* Wordmark */}
        <Revelar as="div" y={12} duracion={0.5}>
          <Image
            src="/logo-comenor.svg"
            width={200}
            height={78}
            priority
            unoptimized
            alt="COMENOR"
            className="h-auto w-[9rem] sm:w-[11rem]"
          />
        </Revelar>

        {/* Eyebrow + subhead */}
        <Revelar as="div" delay={0.1}>
          <p className="mt-12 text-[0.75rem] font-normal uppercase tracking-[0.18em] text-tinta-suave">
            Consejo Mexicano · A.C.
          </p>
          <p className="mt-6 max-w-[40ch] text-[0.9375rem] font-bold leading-snug text-verde sm:text-base">
            Consejo Mexicano de Normalización y Evaluación de la Conformidad
          </p>
        </Revelar>

        {/* Tesis — H1, líneas en secuencia */}
        <RevelarGrupo
          as="h1"
          stagger={0.12}
          delay={0.2}
          className="mt-4 max-w-[16ch] font-bold tracking-[-0.02em] text-verde text-[clamp(2.75rem,1.5rem+5vw,5.5rem)] leading-[1.02]"
        >
          {TESIS.map((linea) => (
            <span key={linea} className="block text-pretty">
              {linea}
            </span>
          ))}
        </RevelarGrupo>

        {/* Cabecera de especificación: tira de metadatos */}
        <Revelar as="div" delay={0.35}>
          <dl className="mt-10 grid max-w-[34rem] grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:max-w-none sm:flex-wrap sm:items-start sm:gap-x-8 sm:gap-y-3">
            {METADATOS.map((m, i) => (
              <div
                key={m.etiqueta}
                className="relative sm:pl-8 sm:first:pl-0"
              >
                {/* Divisor: punto vino de 4px entre ítems (solo en fila sm+) */}
                {i > 0 && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 hidden h-1 w-1 rounded-full bg-vino sm:block"
                  />
                )}
                <dt className="text-[0.6875rem] font-normal uppercase tracking-[0.18em] text-tinta-suave">
                  {m.etiqueta}
                </dt>
                <dd className="mt-1 text-lg font-bold tabular-nums text-verde">
                  {m.valor}
                </dd>
              </div>
            ))}
          </dl>
        </Revelar>

        {/* CTAs — esquinas rectas (instrumento de precisión, anti-pill decorativa) */}
        <Revelar as="div" delay={0.45}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/nosotros"
              className="inline-flex items-center justify-center bg-verde px-7 py-3.5 text-sm font-bold tracking-wide text-blanco transition-colors duration-150 hover:bg-verde-700"
            >
              Conoce COMENOR
            </Link>
            <a
              href="#ecosistema"
              className="inline-flex items-center justify-center border-2 border-verde px-7 py-3 text-sm font-bold tracking-wide text-verde transition-colors duration-150 hover:bg-verde hover:text-blanco"
            >
              Nuestro ecosistema
            </a>
          </div>
        </Revelar>

        {/* "La escala" — regla de marcas de medición. Decoración estructural. */}
        <Revelar as="div" delay={0.6} y={12}>
          <div
            aria-hidden
            className="mt-16 flex w-full items-end justify-between border-b border-salvia pb-0 lg:mt-24"
          >
            {TICKS.map((t) => (
              <span
                key={t}
                className="w-px bg-salvia"
                style={{ height: t % 5 === 0 ? "20px" : "10px" }}
              />
            ))}
          </div>
        </Revelar>
      </div>
    </section>
  );
}
