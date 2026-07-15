"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { BotonAccion, CampoFormulario } from "@/components/admin";
import { cn } from "@/components/ui";
import { nivelesAcceso } from "@/lib/schemas/documento";
import {
  esFormatoPermitido,
  formatoDesdeNombre,
  metadatosDocumentoSchema,
} from "@/lib/documentos/almacenamiento";
import { MESES, aniosDisponibles, etiquetaNivel } from "./_formato";
import type { ErrorApi } from "./_tipos";

type Campos = z.infer<typeof metadatosDocumentoSchema>;

const CLASES_CONTROL =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70 focus-visible:border-verde";

const FORMATOS_ACEPTADOS = ".pdf,.doc,.docx,.xls,.xlsx";

/** Campos de metadatos válidos que puede devolver el servidor como error. */
const CAMPOS_META = ["titulo", "mes", "anio", "nivelAcceso", "tipo"] as const;
type CampoMeta = (typeof CAMPOS_META)[number];

function esCampoMeta(valor: string): valor is CampoMeta {
  return (CAMPOS_META as readonly string[]).includes(valor);
}

/**
 * Formulario de alta de un documento (rol `admin`). Sube por `multipart/form-data`
 * a POST /api/documentos con doble validación: Zod compartido en cliente y la
 * re-validación del route handler. El período (mes/año) y el nivel de acceso son
 * obligatorios; el archivo se valida por extensión antes de enviar.
 */
export default function CargaDocumento({
  onCreado,
}: {
  onCreado: () => void;
}) {
  const anioActual = new Date().getFullYear();
  const [archivo, setArchivo] = useState<File | null>(null);
  // Cambiar la key remonta el <input type=file> para limpiarlo tras subir,
  // sin necesidad de acceder a un ref durante el render.
  const [keyArchivo, setKeyArchivo] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState<string | undefined>();
  const [errorGeneral, setErrorGeneral] = useState<string | undefined>();
  const [exito, setExito] = useState<string | undefined>();
  const idArchivo = useId();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({
    resolver: zodResolver(metadatosDocumentoSchema),
    defaultValues: {
      titulo: "",
      tipo: "",
      mes: new Date().getMonth() + 1,
      anio: anioActual,
      nivelAcceso: "asociados",
    },
  });

  function validarArchivo(): File | null {
    if (!archivo) {
      setErrorArchivo("El archivo es obligatorio.");
      return null;
    }
    const formato = formatoDesdeNombre(archivo.name);
    if (!formato || !esFormatoPermitido(formato)) {
      setErrorArchivo("Formato no permitido (PDF, Word o Excel).");
      return null;
    }
    setErrorArchivo(undefined);
    return archivo;
  }

  async function enviar(datos: Campos) {
    setErrorGeneral(undefined);
    setExito(undefined);
    const archivoValido = validarArchivo();
    if (!archivoValido) return;

    const cuerpo = new FormData();
    cuerpo.set("titulo", datos.titulo);
    cuerpo.set("tipo", datos.tipo);
    cuerpo.set("mes", String(datos.mes));
    cuerpo.set("anio", String(datos.anio));
    cuerpo.set("nivelAcceso", datos.nivelAcceso);
    cuerpo.set("archivo", archivoValido);

    let respuesta: Response;
    try {
      respuesta = await fetch("/api/documentos", {
        method: "POST",
        body: cuerpo,
      });
    } catch {
      setErrorGeneral("No se pudo conectar con el servidor. Intenta de nuevo.");
      return;
    }

    if (respuesta.status === 201) {
      reset();
      setArchivo(null);
      setKeyArchivo((k) => k + 1);
      setExito(`Documento “${datos.titulo}” cargado correctamente.`);
      onCreado();
      return;
    }

    let datosError: ErrorApi = {};
    try {
      datosError = (await respuesta.json()) as ErrorApi;
    } catch {
      /* respuesta sin cuerpo JSON */
    }

    if (respuesta.status === 400 && datosError.errores) {
      for (const [campo, mensajes] of Object.entries(datosError.errores)) {
        const mensaje = mensajes?.[0];
        if (!mensaje) continue;
        if (campo === "archivo") setErrorArchivo(mensaje);
        else if (esCampoMeta(campo)) setError(campo, { message: mensaje });
      }
      return;
    }

    setErrorGeneral(
      datosError.mensaje ?? "No se pudo cargar el documento. Intenta de nuevo.",
    );
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      className="border border-tinta-suave/20 bg-blanco p-6"
      aria-labelledby="titulo-carga"
    >
      <h2 id="titulo-carga" className="mb-4 text-titulo font-bold text-verde">
        Cargar documento
      </h2>

      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <CampoFormulario etiqueta="Título" requerido error={errors.titulo?.message}>
          {(control) => (
            <input
              {...control}
              {...register("titulo")}
              type="text"
              placeholder="Acta de la sesión ordinaria"
              aria-required="true"
              className={cn(CLASES_CONTROL, errors.titulo && "border-vino")}
            />
          )}
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Tipo de documento"
          requerido
          error={errors.tipo?.message}
          ayuda="Ej. Acta, Minuta, Norma, Boletín."
        >
          {(control) => (
            <input
              {...control}
              {...register("tipo")}
              type="text"
              placeholder="Acta"
              aria-required="true"
              className={cn(CLASES_CONTROL, errors.tipo && "border-vino")}
            />
          )}
        </CampoFormulario>

        <CampoFormulario etiqueta="Mes" requerido error={errors.mes?.message}>
          {(control) => (
            <select
              {...control}
              {...register("mes", { valueAsNumber: true })}
              className={cn(CLASES_CONTROL, errors.mes && "border-vino")}
            >
              {MESES.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.nombre}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>

        <CampoFormulario etiqueta="Año" requerido error={errors.anio?.message}>
          {(control) => (
            <select
              {...control}
              {...register("anio", { valueAsNumber: true })}
              className={cn(CLASES_CONTROL, errors.anio && "border-vino")}
            >
              {aniosDisponibles(anioActual).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>

        <CampoFormulario
          etiqueta="Nivel de acceso"
          requerido
          error={errors.nivelAcceso?.message}
          ayuda="Quién podrá consultar el documento."
        >
          {(control) => (
            <select
              {...control}
              {...register("nivelAcceso")}
              className={cn(CLASES_CONTROL, errors.nivelAcceso && "border-vino")}
            >
              {nivelesAcceso.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {etiquetaNivel(nivel)}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={idArchivo} className="font-bold text-verde">
            Archivo
            <span className="text-vino" aria-hidden="true">
              {" "}
              *
            </span>
          </label>
          <p className="text-sm text-tinta-suave">PDF, Word o Excel.</p>
          <input
            key={keyArchivo}
            id={idArchivo}
            type="file"
            accept={FORMATOS_ACEPTADOS}
            aria-required="true"
            aria-invalid={errorArchivo ? true : undefined}
            aria-describedby={errorArchivo ? `${idArchivo}-error` : undefined}
            onChange={(e) => {
              setArchivo(e.target.files?.[0] ?? null);
              setErrorArchivo(undefined);
            }}
            className={cn(
              "w-full border border-tinta-suave/40 bg-blanco px-4 py-2 text-cuerpo text-tinta",
              "file:mr-4 file:rounded-full file:border-0 file:bg-verde file:px-4 file:py-1.5 file:font-bold file:text-blanco",
              errorArchivo && "border-vino",
            )}
          />
          {archivo ? (
            <p className="text-sm text-tinta-suave">
              Seleccionado: {archivo.name}
            </p>
          ) : null}
          <p
            id={`${idArchivo}-error`}
            aria-live="polite"
            className="min-h-5 text-sm text-vino"
          >
            {errorArchivo}
          </p>
        </div>
      </div>

      {errorGeneral ? (
        <p role="alert" className="mb-3 text-sm font-bold text-vino">
          {errorGeneral}
        </p>
      ) : null}
      {exito ? (
        <p role="status" className="mb-3 text-sm font-bold text-verde">
          {exito}
        </p>
      ) : null}

      <div className="mt-2 flex justify-end">
        <BotonAccion type="submit" cargando={isSubmitting}>
          {isSubmitting ? "Cargando…" : "Cargar documento"}
        </BotonAccion>
      </div>
    </form>
  );
}
