import type { ReactNode } from "react";
import { cn } from "./cn";

type PillProps = {
  children: ReactNode;
  /** `oscura` (verde-900) es la de las slides. `verde` para jerarquía secundaria. */
  variante?: "oscura" | "verde";
  /** `md` = categorías de la slide 04. `lg` = pill "Objetivo" de los ejes temáticos. */
  tamano?: "md" | "lg";
  className?: string;
};

/**
 * Rectángulo con radius completo, texto blanco Bold.
 * Slide 04: "Organismos de Certificación", "Unidades de Inspección"…
 * Slide 11: "Objetivo".
 */
export default function Pill({
  children,
  variante = "oscura",
  tamano = "md",
  className,
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-center font-bold text-blanco",
        variante === "oscura" ? "bg-verde-900" : "bg-verde",
        tamano === "lg"
          ? "px-8 py-3 text-xl sm:text-2xl"
          : "px-5 py-2 text-sm sm:text-base",
        className,
      )}
    >
      {children}
    </span>
  );
}
