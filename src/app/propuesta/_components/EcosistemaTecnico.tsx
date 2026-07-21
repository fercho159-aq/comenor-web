import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  CircuitBoard,
  Factory,
  Flame,
  Shirt,
  type LucideIcon,
} from "lucide-react";
import { Revelar, RevelarGrupo } from "@/components/anim";
import { Boton, ChipIcono } from "@/components/ui";

/**
 * Sección "Ecosistema" (id: ecosistema).
 *
 * Ritmo variado: cabecera horizontal (H2 a la izquierda, CTA alineado al pie
 * a la derecha en lg), los seis organismos como RETÍCULA de celdas con
 * hairlines salvia (3 columnas en lg) — cada celda con su ícono sectorial en
 * chip cuadrado — y, al pie, el muro de logotipos de asociados y miembros
 * (slides 04 y 06). Hover: tinte verde + tick vino, CSS puro.
 *
 * Copy: design-source/text/presentacion.txt L116-138. Cero texto inventado;
 * el numeral pequeño es índice de catálogo estructural, no copy. Los íconos
 * son decorativos (aria-hidden vía ChipIcono): el sector ya está nombrado.
 */

type Organismo = {
  acronimo: string;
  sector: string;
  icono: LucideIcon;
};

const ORGANISMOS: readonly Organismo[] = [
  { acronimo: "ONNCCE", sector: "Construcción y obra civil", icono: Building2 },
  {
    acronimo: "INNTEX",
    sector: "Textiles y equipo de protección personal",
    icono: Shirt,
  },
  {
    acronimo: "NYCE",
    sector: "Electrónica / TIC / Química",
    icono: CircuitBoard,
  },
  {
    acronimo: "IMNC (IMEEC)",
    sector: "Multisector ISO / Sistemas de gestión",
    icono: BadgeCheck,
  },
  { acronimo: "ULSE", sector: "Seguridad contra incendios", icono: Flame },
  { acronimo: "CANACERO", sector: "Siderurgia y acero", icono: Factory },
];

/**
 * Slides 04 y 06 — logotipos de asociados y miembros, reconstruidos del PPTX
 * y optimizados en public/media/inicio/logos/. `ancho`/`alto` son los píxeles
 * reales del archivo.
 */
const LOGOS_ASOCIADOS = [
  { archivo: "imeec", nombre: "IMEEC", ancho: 342, alto: 109 },
  { archivo: "onncce", nombre: "ONNCCE", ancho: 184, alto: 220 },
  { archivo: "nyce", nombre: "NYCE, a QIMA company", ancho: 440, alto: 173 },
  { archivo: "inntex", nombre: "INNTEX", ancho: 320, alto: 220 },
  { archivo: "canacero", nombre: "CANACERO", ancho: 431, alto: 190 },
  {
    archivo: "ul-standards",
    nombre: "UL Standards & Engagement",
    ancho: 440,
    alto: 169,
  },
  {
    archivo: "mexen",
    nombre: "Mexen, Mexicana de Evaluación y Normalización, S.A. de C.V.",
    ancho: 304,
    alto: 220,
  },
  { archivo: "isatel", nombre: "Isatel", ancho: 314, alto: 220 },
  { archivo: "intertek", nombre: "Intertek", ancho: 167, alto: 220 },
  { archivo: "sgs", nombre: "SGS", ancho: 440, alto: 210 },
  {
    archivo: "factual-services",
    nombre: "Factual Services S.C.",
    ancho: 440,
    alto: 214,
  },
  { archivo: "diadecor", nombre: "DIADECOR", ancho: 440, alto: 64 },
  { archivo: "tyssa", nombre: "TYSSA", ancho: 201, alto: 220 },
  { archivo: "canieti", nombre: "CANIETI", ancho: 440, alto: 161 },
  { archivo: "radson", nombre: "Laboratorios RADSON", ancho: 440, alto: 79 },
  { archivo: "ivestel", nombre: "IVESTEL", ancho: 415, alto: 120 },
  {
    archivo: "tecnom",
    nombre: "Laboratorio Tecnom de México",
    ancho: 419,
    alto: 220,
  },
  {
    archivo: "teso",
    nombre: "Laboratorio TESO de México, S.A. de C.V.",
    ancho: 440,
    alto: 199,
  },
  {
    archivo: "advance-wire",
    nombre: "Advance Wire & Wireless Laboratorios",
    ancho: 372,
    alto: 220,
  },
  { archivo: "ampliequipos", nombre: "Ampliequipos", ancho: 342, alto: 220 },
  {
    archivo: "conducca",
    nombre: "ConduCCA SA, Conductores CCA para tu casa",
    ancho: 440,
    alto: 182,
  },
] as const;

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
              <span className="flex items-start justify-between gap-4">
                <ChipIcono icon={org.icono} />
                <span className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] tabular-nums text-tinta-suave">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="mt-4 block text-xl font-bold leading-tight text-verde">
                {org.acronimo}
              </span>
              <span className="mt-1 block text-base leading-snug text-tinta-suave">
                {org.sector}
              </span>
            </li>
          ))}
        </RevelarGrupo>

        {/* Muro de logotipos — asociados y miembros (slides 04 y 06) */}
        <div className="mt-16 lg:mt-20">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-tinta-suave">
            Asociados y miembros
          </p>
          <RevelarGrupo
            as="ul"
            stagger={0.04}
            className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-12"
          >
            {LOGOS_ASOCIADOS.map((logo) => (
              <li
                key={logo.archivo}
                className="flex h-16 items-center justify-center sm:h-20"
              >
                <Image
                  src={`/media/inicio/logos/${logo.archivo}.png`}
                  alt={logo.nombre}
                  width={logo.ancho}
                  height={logo.alto}
                  sizes="(min-width: 1024px) 200px, (min-width: 640px) 25vw, 40vw"
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                />
              </li>
            ))}
          </RevelarGrupo>
        </div>
      </div>
    </section>
  );
}
