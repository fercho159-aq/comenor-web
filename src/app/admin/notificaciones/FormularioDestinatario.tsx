"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { BotonAccion, CampoFormulario } from "@/components/admin";

import { crearDestinatario } from "./actions";
import {
  destinatarioSchema,
  perfilesDestinatario,
  type DestinatarioFormValues,
  type DestinatarioInput,
} from "./schemas";

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

const ETIQUETA_PERFIL: Record<(typeof perfilesDestinatario)[number], string> = {
  consejo: "Consejo",
  asociados: "Asociados",
  admin: "Administrador",
};

/** Alta de un destinatario. Validación doble con `destinatarioSchema`. */
export default function FormularioDestinatario() {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<Aviso>(null);
  const [erroresServidor, setErroresServidor] = useState<
    Record<string, string[]>
  >({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DestinatarioFormValues, unknown, DestinatarioInput>({
    resolver: zodResolver(destinatarioSchema),
    defaultValues: { correo: "", perfil: "asociados", activo: true },
  });

  const onSubmit = handleSubmit((valores) => {
    setAviso(null);
    setErroresServidor({});

    const fd = new FormData();
    fd.set("correo", valores.correo);
    fd.set("perfil", valores.perfil);
    fd.set("activo", valores.activo ? "true" : "false");

    iniciar(async () => {
      const r = await crearDestinatario(fd);
      if (r.ok) {
        setAviso({ tipo: "ok", texto: r.mensaje });
        reset({ correo: "", perfil: "asociados", activo: true });
        router.refresh();
      } else {
        setErroresServidor(r.errores ?? {});
        setAviso({ tipo: "error", texto: r.mensaje });
      }
    });
  });

  const err = (campo: keyof DestinatarioInput) =>
    errors[campo]?.message ?? erroresServidor[campo]?.[0];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-4 border border-tinta-suave/20 bg-blanco p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          etiqueta="Correo"
          requerido
          type="email"
          inputMode="email"
          autoComplete="off"
          error={err("correo")}
          placeholder="persona@organismo.mx"
          {...register("correo")}
        />

        <CampoFormulario etiqueta="Perfil" requerido error={err("perfil")}>
          {(control) => (
            <select
              {...control}
              {...register("perfil")}
              aria-required
              className="w-full border border-tinta-suave/40 bg-blanco px-4 py-2.5 text-cuerpo text-tinta focus-visible:border-verde"
            >
              {perfilesDestinatario.map((p) => (
                <option key={p} value={p}>
                  {ETIQUETA_PERFIL[p]}
                </option>
              ))}
            </select>
          )}
        </CampoFormulario>
      </div>

      <label className="flex items-center gap-3 text-cuerpo text-tinta">
        <input
          type="checkbox"
          {...register("activo")}
          className="h-5 w-5 accent-[var(--color-verde)]"
        />
        Activo (recibe notificaciones)
      </label>

      <div className="flex items-center gap-4">
        <BotonAccion type="submit" cargando={pendiente}>
          Agregar destinatario
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
