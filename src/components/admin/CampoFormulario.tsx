"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/components/ui";

/** Props que el campo inyecta al control para dejar el ARIA bien cableado. */
export type PropsControl = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

type CampoFormularioBase = {
  /** Texto del `<label>`. Siempre visible (accesibilidad AA). */
  etiqueta: string;
  /** Mensaje de error del campo (de Zod o del servidor). Se anuncia aria-live. */
  error?: string;
  /** Texto de ayuda opcional bajo la etiqueta. */
  ayuda?: string;
  /** Marca el campo como obligatorio (asterisco visual + aria-required). */
  requerido?: boolean;
  className?: string;
  /**
   * Render-prop para controles no triviales (select, textarea, control de otra
   * librería). Recibe `id`/`aria-*` ya calculados. Si se omite, se renderiza un
   * `<input>` con los `inputProps` restantes.
   */
  children?: (control: PropsControl) => ReactNode;
};

type CampoFormularioProps = CampoFormularioBase &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "aria-invalid" | "aria-describedby" | "children" | "className"
  >;

const CLASES_INPUT =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70 focus-visible:border-verde";

/**
 * Campo de formulario del panel admin: `<label>` asociado, control, ayuda y
 * error anunciado con `aria-live`. Cablea `aria-invalid` y `aria-describedby`
 * para lectores de pantalla. Se usa con react-hook-form (spread de `register`
 * sobre el input) o con la server action del login (defaultValue + error).
 */
export default function CampoFormulario(props: CampoFormularioProps) {
  const {
    etiqueta,
    error,
    ayuda,
    requerido = false,
    className,
    children,
    ...inputProps
  } = props;

  const idBase = useId();
  const idControl = `${idBase}-control`;
  const idAyuda = ayuda ? `${idBase}-ayuda` : undefined;
  const idError = `${idBase}-error`;

  // El input siempre apunta al error (existe aunque esté vacío, para aria-live);
  // la ayuda solo se enlaza cuando hay texto de ayuda.
  const describedBy = [idAyuda, error ? idError : undefined]
    .filter(Boolean)
    .join(" ");

  const control: PropsControl = {
    id: idControl,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={idControl} className="font-bold text-verde">
        {etiqueta}
        {requerido ? (
          <span className="text-vino" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>

      {ayuda ? (
        <p id={idAyuda} className="text-sm text-tinta-suave">
          {ayuda}
        </p>
      ) : null}

      {children ? (
        children(control)
      ) : (
        <input
          {...inputProps}
          {...control}
          aria-required={requerido || undefined}
          className={cn(CLASES_INPUT, error && "border-vino")}
        />
      )}

      {/* Región viva: presente siempre para que el lector anuncie el cambio. */}
      <p id={idError} aria-live="polite" className="min-h-5 text-sm text-vino">
        {error}
      </p>
    </div>
  );
}
