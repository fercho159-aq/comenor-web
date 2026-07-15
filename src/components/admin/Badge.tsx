import type { ReactNode } from "react";
import { cn } from "@/components/ui";

/**
 * Estados que el panel representa como badge. Cubre los del enum de pago
 * (`gratuito`/`pendiente`/`aprobado`/`rechazado`) y los de publicación de
 * eventos/galerías/documentos (`borrador`/`publicado`/`cancelado`).
 */
export type EstadoBadge =
  | "gratuito"
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "publicado"
  | "borrador"
  | "cancelado";

type BadgeProps = {
  estado: EstadoBadge;
  /** Texto a mostrar. Si se omite, se usa la etiqueta por defecto del estado. */
  children?: ReactNode;
  className?: string;
};

/** Etiqueta legible por defecto de cada estado (copy es-MX). */
const ETIQUETA: Record<EstadoBadge, string> = {
  gratuito: "Gratuito",
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
  publicado: "Publicado",
  borrador: "Borrador",
  cancelado: "Cancelado",
};

/**
 * Estilo por estado. Se usan tokens de marca (docs/BRAND.md). Los estados
 * "positivos" van sólidos en verde/verde-900, el rechazo/cancelación en vino,
 * y los neutrales (pendiente/borrador) con borde para no competir con la acción.
 */
const ESTILO: Record<EstadoBadge, string> = {
  gratuito: "bg-salvia text-verde-900",
  aprobado: "bg-verde text-blanco",
  publicado: "bg-verde-900 text-blanco",
  rechazado: "bg-vino text-blanco",
  cancelado: "bg-vino-900 text-blanco",
  pendiente: "border border-tinta-suave/50 text-tinta-suave bg-transparent",
  borrador: "border border-tinta-suave/40 text-tinta-suave bg-humo",
};

/**
 * Indicador de estado del panel admin. No interactivo; solo comunica el estado
 * de un registro, evento o documento con el color de marca correspondiente.
 */
export default function Badge({ estado, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        ESTILO[estado],
        className,
      )}
    >
      {children ?? ETIQUETA[estado]}
    </span>
  );
}
