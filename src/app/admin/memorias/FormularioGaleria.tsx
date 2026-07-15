"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { BotonAccion, CampoFormulario } from "@/components/admin";

import { actualizarGaleria, crearGaleria } from "./actions";
import {
  galeriaSchema,
  type GaleriaFormValues,
  type GaleriaInput,
} from "./schemas";
import type { OpcionEvento } from "./tipos";

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

type Props = {
  opcionesEvento: OpcionEvento[];
  /** Si se pasa, el formulario edita esa galería en vez de crear una nueva. */
  galeria?: {
    id: string;
    titulo: string;
    anio: number;
    eventoId: string | null;
    publicada: boolean;
  };
};

const anioActual = new Date().getFullYear();

/**
 * Formulario de alta/edición de galería. Valida en cliente con el MISMO esquema
 * Zod que re-valida la server action (validación doble). Envía FormData a la
 * acción correspondiente.
 */
export default function FormularioGaleria({ opcionesEvento, galeria }: Props) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<Aviso>(null);
  const [erroresServidor, setErroresServidor] = useState<
    Record<string, string[]>
  >({});

  const esEdicion = Boolean(galeria);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GaleriaFormValues, unknown, GaleriaInput>({
    resolver: zodResolver(galeriaSchema),
    defaultValues: {
      titulo: galeria?.titulo ?? "",
      anio: galeria?.anio ?? anioActual,
      eventoId: galeria?.eventoId ?? null,
      publicada: galeria?.publicada ?? false,
    },
  });

  const onSubmit = handleSubmit((valores) => {
    setAviso(null);
    setErroresServidor({});

    const fd = new FormData();
    fd.set("titulo", valores.titulo);
    fd.set("anio", String(valores.anio));
    if (valores.eventoId) fd.set("eventoId", valores.eventoId);
    fd.set("publicada", valores.publicada ? "true" : "false");

    iniciar(async () => {
      const resultado = galeria
        ? await actualizarGaleria(galeria.id, fd)
        : await crearGaleria(fd);

      if (resultado.ok) {
        setAviso({ tipo: "ok", texto: resultado.mensaje });
        if (!esEdicion) {
          reset({
            titulo: "",
            anio: anioActual,
            eventoId: null,
            publicada: false,
          });
        }
        router.refresh();
      } else {
        setErroresServidor(resultado.errores ?? {});
        setAviso({ tipo: "error", texto: resultado.mensaje });
      }
    });
  });

  const err = (campo: keyof GaleriaInput) =>
    errors[campo]?.message ?? erroresServidor[campo]?.[0];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 border border-tinta-suave/20 bg-blanco p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          etiqueta="Título"
          requerido
          error={err("titulo")}
          placeholder="Congreso Nacional 2026"
          {...register("titulo")}
        />
        <CampoFormulario
          etiqueta="Año"
          requerido
          type="number"
          inputMode="numeric"
          error={err("anio")}
          {...register("anio")}
        />
      </div>

      <CampoFormulario etiqueta="Evento asociado" error={err("eventoId")}>
        {(control) => (
          <select
            {...control}
            {...register("eventoId", {
              setValueAs: (v: string) => (v === "" ? null : v),
            })}
            className="w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo text-tinta focus-visible:border-verde"
          >
            <option value="">Sin evento</option>
            {opcionesEvento.map((op) => (
              <option key={op.id} value={op.id}>
                {op.etiqueta}
              </option>
            ))}
          </select>
        )}
      </CampoFormulario>

      <label className="flex items-center gap-3 text-cuerpo text-tinta">
        <input
          type="checkbox"
          {...register("publicada")}
          className="h-5 w-5 accent-[var(--color-verde)]"
        />
        Publicar galería en el sitio
      </label>

      <div className="flex items-center gap-4">
        <BotonAccion type="submit" cargando={pendiente}>
          {esEdicion ? "Guardar cambios" : "Crear galería"}
        </BotonAccion>
        {aviso ? (
          <p
            role="status"
            aria-live="polite"
            className={
              aviso.tipo === "ok"
                ? "text-sm font-bold text-verde"
                : "text-sm font-bold text-vino"
            }
          >
            {aviso.texto}
          </p>
        ) : null}
      </div>
    </form>
  );
}
