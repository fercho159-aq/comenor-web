"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactoSchema, type ContactoInput } from "@/lib/schemas";
import { Boton, cn } from "@/components/ui";

type EstadoEnvio =
  | { tipo: "inactivo" }
  | { tipo: "exito"; mensaje: string }
  | { tipo: "error"; mensaje: string };

/** Respuesta del route handler POST /api/contacto. */
type RespuestaContacto = {
  mensaje?: string;
  errores?: Partial<Record<keyof ContactoInput, string[]>>;
};

const CLASES_CAMPO =
  "w-full border border-tinta-suave/40 bg-blanco px-4 py-3 text-cuerpo " +
  "text-tinta placeholder:text-tinta-suave/70";

/**
 * Formulario de contacto. Valida en el cliente con `contactoSchema` (el mismo
 * esquema Zod que re-valida el servidor en /api/contacto) y anuncia errores y
 * confirmaciones con regiones `aria-live`.
 */
export default function FormularioContacto() {
  const idBase = useId();
  const [estado, setEstado] = useState<EstadoEnvio>({ tipo: "inactivo" });
  // Honeypot: debe coincidir con CAMPO_HONEYPOT de @/lib/ratelimit ("sitio_web").
  // Se usa el literal para no arrastrar el módulo de rate-limit al bundle cliente.
  const [honeypot, setHoneypot] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactoInput>({
    resolver: zodResolver(contactoSchema),
    mode: "onBlur",
    defaultValues: {
      nombre: "",
      correo: "",
      telefono: "",
      asunto: "",
      mensaje: "",
    },
  });

  const idDe = (campo: keyof ContactoInput) => `${idBase}-${campo}`;
  const idErrorDe = (campo: keyof ContactoInput) => `${idBase}-${campo}-error`;

  async function enviar(datos: ContactoInput) {
    setEstado({ tipo: "inactivo" });

    try {
      const respuesta = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, sitio_web: honeypot }),
      });

      const cuerpo: RespuestaContacto = await respuesta.json();

      if (!respuesta.ok) {
        // El servidor re-validó y rechazó: repintamos los errores por campo.
        if (cuerpo.errores) {
          for (const [campo, mensajes] of Object.entries(cuerpo.errores)) {
            const primero = mensajes?.[0];
            if (primero) {
              setError(campo as keyof ContactoInput, {
                type: "server",
                message: primero,
              });
            }
          }
        }
        setEstado({
          tipo: "error",
          mensaje: cuerpo.mensaje ?? "No pudimos enviar tu mensaje.",
        });
        return;
      }

      setEstado({
        tipo: "exito",
        mensaje:
          cuerpo.mensaje ?? "Gracias por escribirnos. Te responderemos a la brevedad.",
      });
      reset();
    } catch {
      setEstado({
        tipo: "error",
        mensaje:
          "No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo de nuevo.",
      });
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(enviar)} className="mt-10">
      {/* Honeypot: invisible y fuera del tab order; solo un bot lo llena. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="sitio_web">No llenar este campo</label>
        <input
          type="text"
          id="sitio_web"
          name="sitio_web"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={idDe("nombre")} className="font-bold text-verde">
            Nombre
          </label>
          <input
            id={idDe("nombre")}
            type="text"
            autoComplete="name"
            aria-invalid={errors.nombre ? true : undefined}
            aria-describedby={errors.nombre ? idErrorDe("nombre") : undefined}
            className={cn(CLASES_CAMPO, errors.nombre && "border-vino")}
            {...register("nombre")}
          />
          <p
            id={idErrorDe("nombre")}
            aria-live="polite"
            className="text-sm text-vino"
          >
            {errors.nombre?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={idDe("correo")} className="font-bold text-verde">
            Correo electrónico
          </label>
          <input
            id={idDe("correo")}
            type="email"
            autoComplete="email"
            aria-invalid={errors.correo ? true : undefined}
            aria-describedby={errors.correo ? idErrorDe("correo") : undefined}
            className={cn(CLASES_CAMPO, errors.correo && "border-vino")}
            {...register("correo")}
          />
          <p
            id={idErrorDe("correo")}
            aria-live="polite"
            className="text-sm text-vino"
          >
            {errors.correo?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={idDe("telefono")} className="font-bold text-verde">
            Teléfono{" "}
            <span className="font-normal text-tinta-suave">(opcional)</span>
          </label>
          <input
            id={idDe("telefono")}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            aria-invalid={errors.telefono ? true : undefined}
            aria-describedby={
              errors.telefono ? idErrorDe("telefono") : undefined
            }
            className={cn(CLASES_CAMPO, errors.telefono && "border-vino")}
            {...register("telefono")}
          />
          <p
            id={idErrorDe("telefono")}
            aria-live="polite"
            className="text-sm text-vino"
          >
            {errors.telefono?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={idDe("asunto")} className="font-bold text-verde">
            Asunto
          </label>
          <input
            id={idDe("asunto")}
            type="text"
            aria-invalid={errors.asunto ? true : undefined}
            aria-describedby={errors.asunto ? idErrorDe("asunto") : undefined}
            className={cn(CLASES_CAMPO, errors.asunto && "border-vino")}
            {...register("asunto")}
          />
          <p
            id={idErrorDe("asunto")}
            aria-live="polite"
            className="text-sm text-vino"
          >
            {errors.asunto?.message}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <label htmlFor={idDe("mensaje")} className="font-bold text-verde">
            Mensaje
          </label>
          <textarea
            id={idDe("mensaje")}
            rows={6}
            aria-invalid={errors.mensaje ? true : undefined}
            aria-describedby={errors.mensaje ? idErrorDe("mensaje") : undefined}
            className={cn(CLASES_CAMPO, "resize-y", errors.mensaje && "border-vino")}
            {...register("mensaje")}
          />
          <p
            id={idErrorDe("mensaje")}
            aria-live="polite"
            className="text-sm text-vino"
          >
            {errors.mensaje?.message}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Boton type="submit" tamano="lg" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar mensaje"}
        </Boton>

        {/* Resultado del envío, anunciado por lectores de pantalla. */}
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-cuerpo",
            estado.tipo === "error" ? "text-vino" : "text-verde",
          )}
        >
          {estado.tipo === "inactivo" ? "" : estado.mensaje}
        </p>
      </div>
    </form>
  );
}
