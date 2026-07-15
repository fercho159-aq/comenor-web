"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Boton, cn } from "@/components/ui";
import { CAMPO_HONEYPOT } from "@/lib/ratelimit";
import { registroEventoSchema, type RegistroEventoInput } from "@/lib/schemas";

/** Respuesta del route handler POST /api/eventos/[slug]/registro. */
type RespuestaRegistro = {
  mensaje?: string;
  estado?: "gratuito" | "pendiente";
  registrationId?: string;
  initPoint?: string;
  errores?: Partial<Record<keyof RegistroEventoInput, string[]>>;
};

type EstadoEnvio =
  | { tipo: "inactivo" }
  | { tipo: "redirigiendo" }
  | { tipo: "exito"; mensaje: string }
  | { tipo: "error"; mensaje: string };

const CLASES_CAMPO =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-3 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70";

type CampoDef = {
  campo: keyof RegistroEventoInput;
  etiqueta: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  anchoCompleto?: boolean;
};

const CAMPOS: CampoDef[] = [
  { campo: "nombre", etiqueta: "Nombre completo", autoComplete: "name" },
  { campo: "cargo", etiqueta: "Cargo", autoComplete: "organization-title" },
  {
    campo: "correo",
    etiqueta: "Correo electrónico",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
  },
  {
    campo: "celular",
    etiqueta: "Celular (10 dígitos)",
    type: "tel",
    autoComplete: "tel-national",
    inputMode: "numeric",
  },
  { campo: "organismo", etiqueta: "Organismo o empresa", autoComplete: "organization" },
  { campo: "solicitante", etiqueta: "Solicitante", anchoCompleto: true },
];

/**
 * Formulario de registro a un evento. Valida en el cliente con
 * `registroEventoSchema` (el mismo esquema que RE-VALIDA el servidor). Para
 * eventos de pago redirige al checkout de Mercado Pago (`initPoint`); para
 * gratuitos muestra la confirmación (el QR llega por correo).
 */
export default function FormularioRegistro({
  slug,
  esGratuito,
}: {
  slug: string;
  esGratuito: boolean;
}) {
  const idBase = useId();
  const [estado, setEstado] = useState<EstadoEnvio>({ tipo: "inactivo" });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistroEventoInput>({
    resolver: zodResolver(registroEventoSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: "",
      cargo: "",
      correo: "",
      celular: "",
      organismo: "",
      solicitante: "",
    },
  });

  const idDe = (campo: string) => `${idBase}-${campo}`;
  const idErrorDe = (campo: string) => `${idBase}-${campo}-error`;

  async function enviar(datos: RegistroEventoInput) {
    setEstado({ tipo: "inactivo" });

    try {
      const respuesta = await fetch(`/api/eventos/${slug}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // El honeypot viaja vacío desde un humano; los bots lo llenan.
        body: JSON.stringify({ ...datos, [CAMPO_HONEYPOT]: "" }),
      });

      const cuerpo: RespuestaRegistro = await respuesta.json();

      if (!respuesta.ok) {
        if (cuerpo.errores) {
          for (const [campo, mensajes] of Object.entries(cuerpo.errores)) {
            const primero = mensajes?.[0];
            if (primero) {
              setError(campo as keyof RegistroEventoInput, {
                type: "server",
                message: primero,
              });
            }
          }
        }
        setEstado({
          tipo: "error",
          mensaje: cuerpo.mensaje ?? "No pudimos procesar tu registro.",
        });
        return;
      }

      // Evento de pago: redirigir al checkout de Mercado Pago.
      if (cuerpo.estado === "pendiente" && cuerpo.initPoint) {
        setEstado({ tipo: "redirigiendo" });
        window.location.assign(cuerpo.initPoint);
        return;
      }

      // Evento gratuito: confirmación en pantalla; el QR llega por correo.
      setEstado({
        tipo: "exito",
        mensaje:
          cuerpo.mensaje ??
          "Registro confirmado. Te enviamos un correo con tu código QR de acceso.",
      });
      reset();
    } catch {
      setEstado({
        tipo: "error",
        mensaje:
          "No pudimos procesar tu registro. Revisa tu conexión e inténtalo de nuevo.",
      });
    }
  }

  const enviando = isSubmitting || estado.tipo === "redirigiendo";

  return (
    <form noValidate onSubmit={handleSubmit(enviar)} className="mt-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {CAMPOS.map(
          ({ campo, etiqueta, type, autoComplete, inputMode, anchoCompleto }) => (
            <div
              key={campo}
              className={cn(
                "flex flex-col gap-2",
                anchoCompleto && "sm:col-span-2",
              )}
            >
              <label htmlFor={idDe(campo)} className="font-bold text-verde">
                {etiqueta}
              </label>
              <input
                id={idDe(campo)}
                type={type ?? "text"}
                autoComplete={autoComplete}
                inputMode={inputMode}
                aria-invalid={errors[campo] ? true : undefined}
                aria-describedby={errors[campo] ? idErrorDe(campo) : undefined}
                className={cn(CLASES_CAMPO, errors[campo] && "border-vino")}
                {...register(campo)}
              />
              <p
                id={idErrorDe(campo)}
                aria-live="polite"
                className="text-sm text-vino"
              >
                {errors[campo]?.message}
              </p>
            </div>
          ),
        )}
      </div>

      {/*
        Honeypot: oculto para humanos (fuera de pantalla, sin tab, sin
        autocompletar). Si llega lleno el servidor lo descarta en silencio.
      */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <label htmlFor={idDe(CAMPO_HONEYPOT)}>No llenar este campo</label>
        <input
          id={idDe(CAMPO_HONEYPOT)}
          type="text"
          name={CAMPO_HONEYPOT}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Boton type="submit" tamano="lg" disabled={enviando}>
          {enviando
            ? "Procesando…"
            : esGratuito
              ? "Confirmar registro"
              : "Registrarme y pagar"}
        </Boton>

        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-cuerpo",
            estado.tipo === "error" ? "text-vino" : "text-verde",
          )}
        >
          {estado.tipo === "exito" || estado.tipo === "error"
            ? estado.mensaje
            : ""}
        </p>
      </div>
    </form>
  );
}
