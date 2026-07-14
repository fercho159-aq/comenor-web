import type { ReactNode } from "react";
import { cn } from "./cn";

type TituloProps = {
  children: ReactNode;
  /** Nivel semántico. El tamaño lo controla `tamano`, no el nivel. */
  as?: "h1" | "h2" | "h3" | "p";
  /** `display` = H1 de slide (clamp 36–56px). `titulo` = H2 (clamp 24–36px). */
  tamano?: "display" | "titulo";
  /** `sobre-oscuro` = blanco, para fondos verde/vino (slide 14). */
  variante?: "normal" | "sobre-oscuro";
  className?: string;
};

/**
 * Titular Montserrat Bold en verde, calcado de los H1 de las slides
 * ("¿Quiénes somos?", "Nuestros asociados y miembros", "Contacto").
 */
export default function Titulo({
  children,
  as: Etiqueta = "h2",
  tamano = "display",
  variante = "normal",
  className,
}: TituloProps) {
  return (
    <Etiqueta
      className={cn(
        tamano === "display" ? "text-display" : "text-titulo",
        "text-balance",
        variante === "sobre-oscuro" ? "text-blanco" : "text-verde",
        className,
      )}
    >
      {children}
    </Etiqueta>
  );
}
