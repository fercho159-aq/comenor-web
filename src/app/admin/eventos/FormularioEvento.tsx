"use client";

import { useActionState, useState } from "react";

import { BotonAccion, CampoFormulario } from "@/components/admin";
import { cn } from "@/components/ui";
import {
  estadosEvento,
  modalidadesEvento,
  type EventoInput,
} from "@/lib/schemas";

import type { EstadoFormularioEvento } from "./acciones";
import { etiquetaEstado, etiquetaModalidad } from "./_formato";
import { generarSlug } from "./logica";

/** Firma de una Server Action de formulario (crear o actualizar ya vinculada). */
type AccionEvento = (
  prev: EstadoFormularioEvento,
  formData: FormData,
) => Promise<EstadoFormularioEvento>;

/** Valores para prellenar el formulario en modo edición. */
export interface ValoresEvento {
  nombre: string;
  slug: string;
  /** Formato `YYYY-MM-DDTHH:mm` para `<input type="datetime-local">`. */
  fecha: string;
  sede: string;
  modalidad: EventoInput["modalidad"];
  /** Costo en PESOS (no centavos) para mostrar al operador. */
  costoPesos: string;
  cupo: string;
  estado: EventoInput["estado"];
  descripcion: string;
  publicado: boolean;
  registroAbierto: boolean;
}

interface FormularioEventoProps {
  accion: AccionEvento;
  /** Valores iniciales (edición). Si se omite, el formulario nace vacío. */
  valores?: ValoresEvento;
  /** URL de la portada actual (edición), para previsualizarla. */
  imagenActual?: string | null;
  /** Texto del botón de envío. */
  textoEnvio: string;
}

const ESTADO_INICIAL: EstadoFormularioEvento = { ok: false };

const CLASES_CONTROL =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70 focus-visible:border-verde";

/**
 * Formulario de alta/edición de eventos del panel admin.
 *
 * Valida en el servidor (Server Action) con el mismo `eventoSchema`; los
 * errores por campo se pintan junto a cada control con `aria-live` (AA). El
 * slug puede autogenerarse desde el nombre, pero sigue siendo editable.
 */
export default function FormularioEvento({
  accion,
  valores,
  imagenActual,
  textoEnvio,
}: FormularioEventoProps) {
  const [estado, formAction, pendiente] = useActionState(
    accion,
    ESTADO_INICIAL,
  );

  const [nombre, setNombre] = useState(valores?.nombre ?? "");
  const [slug, setSlug] = useState(valores?.slug ?? "");

  const err = (campo: string): string | undefined =>
    estado.errores?.[campo]?.[0];

  return (
    <form action={formAction} noValidate className="max-w-2xl">
      {/* Aviso general (p. ej. la portada no pudo subirse). */}
      <p
        aria-live="polite"
        className={cn(
          "min-h-6 text-sm font-bold",
          estado.ok ? "text-verde" : "text-vino",
        )}
      >
        {estado.mensaje}
      </p>

      <div className="flex flex-col gap-4">
        <CampoFormulario
          etiqueta="Nombre del evento"
          name="nombre"
          requerido
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          error={err("nombre")}
          autoComplete="off"
        />

        <div className="flex flex-col gap-1.5">
          <CampoFormulario
            etiqueta="Slug (URL pública)"
            name="slug"
            requerido
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            ayuda="Sólo minúsculas, números y guiones. Ej. congreso-2026."
            error={err("slug")}
            autoComplete="off"
          />
          <div>
            <BotonAccion
              variante="secundario"
              tamano="sm"
              onClick={() => setSlug(generarSlug(nombre))}
              disabled={nombre.trim().length === 0}
            >
              Generar desde el nombre
            </BotonAccion>
          </div>
        </div>

        <CampoFormulario
          etiqueta="Fecha y hora (CDMX)"
          name="fecha"
          type="datetime-local"
          requerido
          defaultValue={valores?.fecha}
          error={err("fecha")}
        />

        <CampoFormulario
          etiqueta="Sede"
          name="sede"
          requerido
          defaultValue={valores?.sede}
          ayuda="Lugar físico o plataforma (ej. Auditorio Nacional / Zoom)."
          error={err("sede")}
        />

        <CampoFormulario
          etiqueta="Modalidad"
          requerido
          error={err("modalidad")}
        >
          {(control) => (
            <select
              {...control}
              name="modalidad"
              defaultValue={valores?.modalidad ?? ""}
              className={CLASES_CONTROL}
            >
              <option value="" disabled>
                Selecciona una modalidad
              </option>
              {modalidadesEvento.map((m) => (
                <option key={m} value={m}>
                  {etiquetaModalidad(m)}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Costo (MXN)"
          name="costoPesos"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          defaultValue={valores?.costoPesos ?? "0"}
          ayuda="Déjalo en 0 para un evento gratuito."
          error={err("costoCentavos")}
        />

        <CampoFormulario
          etiqueta="Cupo"
          name="cupo"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          defaultValue={valores?.cupo}
          ayuda="Déjalo vacío si el cupo es ilimitado."
          error={err("cupo")}
        />

        <CampoFormulario etiqueta="Estado" requerido error={err("estado")}>
          {(control) => (
            <select
              {...control}
              name="estado"
              defaultValue={valores?.estado ?? "borrador"}
              className={CLASES_CONTROL}
            >
              {estadosEvento.map((e) => (
                <option key={e} value={e}>
                  {etiquetaEstado(e)}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Descripción"
          requerido
          error={err("descripcion")}
        >
          {(control) => (
            <textarea
              {...control}
              name="descripcion"
              rows={6}
              defaultValue={valores?.descripcion}
              className={cn(CLASES_CONTROL, "resize-y")}
            />
          )}
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Portada"
          name="imagen"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ayuda="JPG, PNG o WebP (máx. 5 MB). Se recorta a 16:9 automáticamente."
          error={err("imagen")}
        />

        {imagenActual ? (
          <figure className="flex flex-col gap-1">
            <figcaption className="text-sm text-tinta-suave">
              Portada actual (se conserva si no subes una nueva):
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa del panel, no LCP público */}
            <img
              src={imagenActual}
              alt="Portada actual del evento"
              className="max-w-xs border border-tinta-suave/20"
            />
          </figure>
        ) : null}

        <fieldset className="flex flex-col gap-3 border border-tinta-suave/20 bg-blanco p-4">
          <legend className="px-2 text-sm font-bold text-verde">
            Publicación
          </legend>
          <label className="flex items-center gap-3 text-tinta">
            <input
              type="checkbox"
              name="publicado"
              value="true"
              defaultChecked={valores?.publicado ?? false}
              className="h-5 w-5 accent-verde"
            />
            Publicar en el calendario público
          </label>
          <label className="flex items-center gap-3 text-tinta">
            <input
              type="checkbox"
              name="registroAbierto"
              value="true"
              defaultChecked={valores?.registroAbierto ?? false}
              className="h-5 w-5 accent-verde"
            />
            Registro abierto (permitir inscripciones)
          </label>
        </fieldset>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <BotonAccion type="submit" cargando={pendiente}>
          {textoEnvio}
        </BotonAccion>
        <BotonAccion href="/admin/eventos" variante="sutil">
          Cancelar
        </BotonAccion>
      </div>
    </form>
  );
}
