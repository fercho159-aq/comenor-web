import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

type ContenedorProps = {
  children: ReactNode;
  /** Elemento semántico contenedor. Por defecto `div`. */
  as?: ElementType;
  /**
   * `normal` = 1200px (rejilla de las slides).
   * `estrecho` = 800px, para bloques de lectura larga.
   * `ancho` = 1440px, para grids de logos y galerías.
   */
  ancho?: "normal" | "estrecho" | "ancho";
  className?: string;
};

const ANCHOS: Record<NonNullable<ContenedorProps["ancho"]>, string> = {
  estrecho: "max-w-[50rem]",
  normal: "max-w-[75rem]",
  ancho: "max-w-[90rem]",
};

/**
 * Ancho máximo y padding horizontal consistentes en todo el sitio.
 * El padding derecho crece en lg para dejar aire a la BarraLateralVertical.
 */
export default function Contenedor({
  children,
  as: Etiqueta = "div",
  ancho = "normal",
  className,
}: ContenedorProps) {
  return (
    <Etiqueta
      className={cn(
        "mx-auto w-full px-5 sm:px-8 lg:px-12 lg:pr-20",
        ANCHOS[ancho],
        className,
      )}
    >
      {children}
    </Etiqueta>
  );
}
