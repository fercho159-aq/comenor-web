import type { Metadata } from "next";
import { Contenedor, Eyebrow, Titulo, cn } from "@/components/ui";
import { Revelar, RevelarGrupo } from "@/components/anim";

export const metadata: Metadata = {
  title: "Código de Ética",
  description:
    "Los diez principios del Código de Ética y Conducta Profesional de COMENOR: los principios que garantizan la imparcialidad que el mercado internacional exige.",
};

type Principio = {
  /** Numeral romano tal como aparece en la slide 07. */
  numeral: string;
  nombre: string;
};

/** Los 10 principios, con el texto exacto del copy del cliente (slide 07). */
const PRINCIPIOS: readonly Principio[] = [
  { numeral: "I", nombre: "Legalidad" },
  { numeral: "II", nombre: "Integridad y honestidad profesional" },
  { numeral: "III", nombre: "Independencia técnica y de criterio" },
  { numeral: "IV", nombre: "Imparcialidad y objetividad" },
  { numeral: "V", nombre: "Transparencia y rendición de cuentas" },
  { numeral: "VI", nombre: "Responsabilidad institucional" },
  { numeral: "VII", nombre: "Confidencialidad" },
  { numeral: "VIII", nombre: "Respeto y colaboración técnica" },
  { numeral: "IX", nombre: "Prevención de conflictos de interés" },
  { numeral: "X", nombre: "Protección del interés público y colectivo" },
];

/**
 * Tarjeta de principio: bloque numeral a la izquierda + nombre a la derecha.
 * `destacada` = la tarjeta vino de la slide (I — Legalidad), con numeral vino-900.
 */
function TarjetaPrincipio({
  numeral,
  nombre,
  destacada = false,
}: Principio & { destacada?: boolean }) {
  return (
    <li
      className={cn(
        "flex min-h-[5.5rem] items-stretch",
        destacada ? "tema-oscuro bg-vino" : "bg-blanco",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex w-16 shrink-0 items-center justify-center text-base font-bold sm:w-20",
          destacada ? "bg-vino-900 text-blanco" : "bg-verde text-blanco",
        )}
      >
        {numeral}
      </span>
      <h3
        className={cn(
          "flex items-center px-4 py-4 text-cuerpo text-pretty sm:px-6",
          destacada ? "text-blanco" : "text-tinta",
        )}
      >
        <span className="sr-only">{`Principio ${numeral}: `}</span>
        {nombre}
      </h3>
    </li>
  );
}

export default function CodigoEticaPage() {
  return (
    <Contenedor as="section" className="py-16 lg:py-24">
      <Eyebrow>Nuestro ecosistema</Eyebrow>
      <Titulo as="h1" className="mt-3 max-w-4xl">
        Los principios que garantizan la imparcialidad que el mercado
        internacional exige
      </Titulo>

      <div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[2fr_1fr] lg:gap-8">
        <RevelarGrupo as="ol" className="grid gap-4 sm:grid-cols-2">
          {PRINCIPIOS.map((principio) => (
            <TarjetaPrincipio
              key={principio.numeral}
              numeral={principio.numeral}
              nombre={principio.nombre}
              destacada={principio.numeral === "I"}
            />
          ))}
        </RevelarGrupo>

        <Revelar
          as="aside"
          className="tema-oscuro flex flex-col items-center justify-between gap-8 bg-verde px-6 py-10 text-center sm:px-8"
        >
          <h2 className="text-titulo text-balance text-blanco">
            Código de Ética y Conducta Profesional
          </h2>

          <span
            aria-hidden="true"
            className="h-20 w-1 shrink-0 bg-vino lg:h-24"
          />

          <div className="space-y-6">
            <p className="text-cuerpo text-pretty italic text-salvia">
              Vinculante · Obligatorio para todos los Asociados y Miembros
            </p>
            <p className="text-sm text-pretty text-salvia">
              Art. 2 — Código de Ética COMENOR, 2025
            </p>
          </div>
        </Revelar>
      </div>
    </Contenedor>
  );
}
