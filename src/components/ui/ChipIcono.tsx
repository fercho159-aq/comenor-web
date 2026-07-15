import type { LucideIcon } from "lucide-react";

import { cn } from "./cn";

type ChipIconoProps = {
  icon: LucideIcon;
  /** `md` para filas de características; `sm` para metadatos densos. */
  tamano?: "sm" | "md";
  className?: string;
};

/**
 * Ícono dentro de un chip CUADRADO (no redondo): el lenguaje visual de COMENOR
 * es rectangular —tarjetas y bloques de esquinas rectas de las slides—, así que
 * los íconos viven en cuadrados salvia con el trazo en verde. Decorativo:
 * siempre acompaña a un texto que ya nombra la cosa (aria-hidden).
 */
export default function ChipIcono({
  icon: Icon,
  tamano = "md",
  className,
}: ChipIconoProps) {
  const caja = tamano === "sm" ? "size-8" : "size-11";
  const trazo = tamano === "sm" ? "size-4" : "size-5";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-salvia/55 text-verde",
        caja,
        className,
      )}
    >
      <Icon className={trazo} strokeWidth={1.75} />
    </span>
  );
}
