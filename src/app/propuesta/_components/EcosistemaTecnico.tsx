import { Revelar, RevelarGrupo } from "@/components/anim";
import { Boton } from "@/components/ui";

/**
 * Sección 4 — «Ecosistema» (id: ecosistema).
 *
 * Dirección "Norma": el consejo como catálogo técnico vivo. Los seis
 * organismos no son un tablero de tarjetas-diapositiva (look rechazado por la
 * clienta) sino un DIRECTORIO / índice de catálogo: una lista full-width con
 * hairlines salvia, tipo entrada de referencia normativa.
 *
 * Server Component: el hover (tinte verde + tick vino que entra por la
 * izquierda) es CSS puro (group-hover), sin estado ni handlers. La entrada al
 * scroll reutiliza <Revelar>/<RevelarGrupo> ya existentes.
 *
 * Copy: design-source/text/presentacion.txt L116-138 (eyebrow "NUESTRO
 * ECOSISTEMA", título "arquitectura técnica… normalización/estandarización" y
 * los 6 organismos con sus sectores). Cero texto inventado; el numeral de la
 * derecha es un índice de catálogo estructural, no copy.
 */

type Organismo = {
  acronimo: string;
  sector: string;
};

const ORGANISMOS: readonly Organismo[] = [
  { acronimo: "ONNCCE", sector: "Construcción y obra civil" },
  { acronimo: "INNTEX", sector: "Textiles y equipo de protección personal" },
  { acronimo: "NYCE", sector: "Electrónica / TIC / Química" },
  { acronimo: "IMNC (IMEEC)", sector: "Multisector ISO / Sistemas de gestión" },
  { acronimo: "ULSE", sector: "Seguridad contra incendios" },
  { acronimo: "CANACERO", sector: "Siderurgia y acero" },
];

export default function EcosistemaTecnico() {
  return (
    <section id="ecosistema" className="py-20 lg:py-32">
      <div className="mx-auto w-full max-w-[75rem] px-6 sm:px-8 lg:px-12">
        <div className="lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-10">
          {/* LOMO DE REFERENCIA (spine) — solo desktop */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:pt-2">
            <span className="text-2xl font-light leading-none tabular-nums text-verde">
              02
            </span>
            <span className="mt-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              Ecosistema
            </span>
            <span aria-hidden className="mt-3 block h-0.5 w-3 bg-vino" />
          </div>

          {/* Columna de contenido: hairline vertical salvia = margen del documento */}
          <div className="lg:border-l lg:border-salvia lg:pl-10">
            {/* Spine colapsado a eyebrow horizontal — solo móvil/tablet */}
            <p className="mb-6 flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave lg:hidden">
              <span className="tabular-nums text-verde">02</span>
              <span aria-hidden>·</span>
              <span>Ecosistema</span>
              <span
                aria-hidden
                className="ml-1 inline-block h-3 w-[3px] bg-vino"
              />
            </p>

            <Revelar
              as="h2"
              className="max-w-[24ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-balance text-verde"
            >
              La arquitectura técnica que representa COMENOR en
              normalización/<wbr />
              estandarización
            </Revelar>

            {/* Directorio / índice de catálogo de los seis organismos */}
            <RevelarGrupo as="ul" className="mt-12" stagger={0.06}>
              {ORGANISMOS.map((org, i) => (
                <li
                  key={org.acronimo}
                  className="group relative border-t border-salvia transition-colors last:border-b hover:bg-verde/[0.04]"
                >
                  {/* Tick vino que entra desde la izquierda al hacer hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-1/2 h-[70%] w-[3px] -translate-x-2 -translate-y-1/2 bg-vino opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                  <div className="flex flex-col gap-2 py-5 pl-3 pr-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="text-xl font-bold leading-tight text-verde">
                        {org.acronimo}
                      </span>
                      <span className="text-base leading-snug text-tinta-suave">
                        {org.sector}
                      </span>
                    </div>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] tabular-nums text-tinta-suave">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </li>
              ))}
            </RevelarGrupo>

            <div className="mt-12">
              <Boton href="/asociados" variante="secundario">
                Ver todos los asociados y miembros
              </Boton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
