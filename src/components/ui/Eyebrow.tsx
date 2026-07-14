import type { ReactNode } from "react";
import { cn } from "./cn";

type EyebrowProps = {
  children: ReactNode;
  /** `sobre-oscuro` lo aclara para fondos verde/vino (slide 14). */
  variante?: "normal" | "sobre-oscuro";
  className?: string;
};

/**
 * Etiqueta en versalitas sobre el titular. Slides 02/04/06/07/11/14:
 * "NUESTRA INSTITUCIÓN", "NUESTRO ECOSISTEMA", "EJE TEMÁTICO 3",
 * "CONECTA CON NOSOTROS". Montserrat Regular, 14px, tracking 0.08em.
 *
 * El texto se pasa tal cual; la mayúscula la aplica `uppercase`.
 */
export default function Eyebrow({
  children,
  variante = "normal",
  className,
}: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-eyebrow tracking-eyebrow uppercase",
        variante === "sobre-oscuro" ? "text-salvia" : "text-tinta-suave",
        className,
      )}
    >
      {children}
    </p>
  );
}
