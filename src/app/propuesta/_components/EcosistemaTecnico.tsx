import { Revelar, RevelarGrupo } from "@/components/anim";
import { Boton } from "@/components/ui";

/**
 * Sección "Ecosistema" (id: ecosistema).
 *
 * Ritmo variado: cabecera horizontal (H2 a la izquierda, CTA alineado al pie
 * a la derecha en lg) y los seis organismos como RETÍCULA de celdas con
 * hairlines salvia (3 columnas en lg) — ni tablero de tarjetas sólidas de
 * slide ni lista vertical tipo línea de tiempo. Hover: tinte verde + tick
 * vino, CSS puro.
 *
 * Copy: design-source/text/presentacion.txt L116-138. Cero texto inventado;
 * el numeral pequeño es índice de catálogo estructural, no copy.
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
        {/* Cabecera horizontal: título ↔ CTA */}
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
              <span aria-hidden className="block h-0.5 w-6 bg-vino" />
              Nuestro ecosistema
            </p>
            <Revelar
              as="h2"
              className="mt-5 max-w-[24ch] text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.01em] text-balance text-verde"
            >
              La arquitectura técnica que representa COMENOR en
              normalización/<wbr />
              estandarización
            </Revelar>
          </div>

          <div className="mt-8 shrink-0 lg:mt-0 lg:pb-1">
            <Boton href="/asociados" variante="secundario">
              Ver todos los asociados y miembros
            </Boton>
          </div>
        </div>

        {/* Retícula de celdas del catálogo (no lista, no tarjetas sólidas) */}
        <RevelarGrupo
          as="ul"
          stagger={0.06}
          className="mt-12 grid grid-cols-1 border-t border-salvia sm:grid-cols-2 sm:border-l lg:mt-16 lg:grid-cols-3"
        >
          {ORGANISMOS.map((org, i) => (
            <li
              key={org.acronimo}
              className="group relative border-b border-salvia p-6 transition-colors hover:bg-verde/[0.04] sm:border-r lg:p-8"
            >
              {/* Tick vino que entra desde la izquierda al hacer hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-6 h-8 w-[3px] -translate-x-2 bg-vino opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 lg:top-8"
              />
              <span className="block text-[0.6875rem] font-medium uppercase tracking-[0.18em] tabular-nums text-tinta-suave">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 block text-xl font-bold leading-tight text-verde">
                {org.acronimo}
              </span>
              <span className="mt-1 block text-base leading-snug text-tinta-suave">
                {org.sector}
              </span>
            </li>
          ))}
        </RevelarGrupo>
      </div>
    </section>
  );
}
