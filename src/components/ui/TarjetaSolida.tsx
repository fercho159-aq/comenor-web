import type { ReactNode } from "react";
import { cn } from "./cn";

type TarjetaSolidaProps = {
  /** Título Bold blanco. */
  titulo: ReactNode;
  /** Descripción Regular. Opcional: en algunas rejillas la tarjeta es solo título. */
  descripcion?: ReactNode;
  /**
   * Color de fondo. En los grids alternados de las slides la tarjeta «clara» es
   * `verde-700` (#0C5753) y la «oscura» es `verde-900`; `verde` (#004F4A) es el
   * primario de bloques y paneles.
   */
  variante?: "verde" | "verde-700" | "verde-900" | "vino";
  /** Medallón opcional sobre el título (slide 15: sobre blanco, icono en verde). */
  icono?: ReactNode;
  /** `centro` como en las slides; `izquierda` para listas densas. */
  alineacion?: "centro" | "izquierda";
  className?: string;
  children?: ReactNode;
};

const FONDOS: Record<NonNullable<TarjetaSolidaProps["variante"]>, string> = {
  verde: "bg-verde",
  "verde-700": "bg-verde-700",
  "verde-900": "bg-verde-900",
  vino: "bg-vino",
};

/**
 * Rectángulo sólido SIN radius (esquinas rectas), título Bold blanco +
 * descripción. Es la tarjeta de los grids alternados de las slides 06 y 11,
 * y de las dos tarjetas de contacto de la slide 15.
 *
 * Lleva `tema-oscuro` para que el anillo de foco de cualquier enlace interno
 * pase a blanco (ver globals.css).
 */
export default function TarjetaSolida({
  titulo,
  descripcion,
  variante = "verde",
  icono,
  alineacion = "centro",
  className,
  children,
}: TarjetaSolidaProps) {
  return (
    <div
      className={cn(
        "tema-oscuro flex h-full flex-col gap-4 p-6 sm:p-8",
        FONDOS[variante],
        alineacion === "centro" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {icono ? (
        <span className="flex size-16 items-center justify-center rounded-full bg-blanco text-verde">
          {icono}
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-blanco sm:text-xl">{titulo}</h3>
      {descripcion ? (
        <p className="text-cuerpo text-salvia text-pretty">{descripcion}</p>
      ) : null}
      {children}
    </div>
  );
}
