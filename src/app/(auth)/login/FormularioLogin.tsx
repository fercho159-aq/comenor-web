"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { loginSchema } from "@/lib/schemas";
import { BotonAccion, CampoFormulario } from "@/components/admin";
import { estadoLoginInicial, iniciarSesion } from "./acciones";

type ErroresCliente = Partial<Record<"correo" | "password", string>>;

type FormularioLoginProps = {
  /** Destino tras iniciar sesión (ruta interna). Se pasa como campo oculto. */
  next?: string;
};

/**
 * Formulario de inicio de sesión (consejo / asociados / admin).
 *
 * Validación doble: valida en el cliente con `loginSchema` antes de enviar y la
 * server action `iniciarSesion` RE-VALIDA con el mismo esquema. Los errores por
 * campo se anuncian con `aria-live` (vía `CampoFormulario`) y el error general
 * en una región `role="alert"`.
 */
export default function FormularioLogin({ next }: FormularioLoginProps) {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    estadoLoginInicial,
  );
  const [erroresCliente, setErroresCliente] = useState<ErroresCliente>({});

  function validarEnCliente(evento: FormEvent<HTMLFormElement>) {
    const form = evento.currentTarget;
    const datos = {
      correo: (form.elements.namedItem("correo") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };
    const resultado = loginSchema.safeParse(datos);
    if (!resultado.success) {
      evento.preventDefault(); // frena el envío a la server action
      const campos = resultado.error.flatten().fieldErrors;
      setErroresCliente({
        correo: campos.correo?.[0],
        password: campos.password?.[0],
      });
      return;
    }
    setErroresCliente({});
  }

  // El error del cliente tiene prioridad; si no, el que devolvió el servidor.
  const errorDe = (campo: "correo" | "password") =>
    erroresCliente[campo] ?? estado.errores?.[campo]?.[0];

  return (
    <form action={accion} onSubmit={validarEnCliente} noValidate className="mt-8">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {/* Honeypot: fuera de pantalla (no display:none, que los bots modernos
          saltan) y fuera del tab order. Un humano nunca lo llena; un bot sí. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="sitio_web">No llenar este campo</label>
        <input
          type="text"
          id="sitio_web"
          name="sitio_web"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-4">
        <CampoFormulario
          etiqueta="Correo electrónico"
          name="correo"
          type="email"
          autoComplete="email"
          requerido
          error={errorDe("correo")}
        />
        <CampoFormulario
          etiqueta="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          requerido
          error={errorDe("password")}
        />
      </div>

      {/* Error general (credenciales inválidas / servicio). */}
      <p
        role="alert"
        aria-live="assertive"
        className="mt-2 min-h-5 text-sm font-bold text-vino"
      >
        {estado.errores ? undefined : estado.mensaje}
      </p>

      <BotonAccion type="submit" bloque cargando={pendiente} className="mt-4">
        {pendiente ? "Ingresando…" : "Iniciar sesión"}
      </BotonAccion>

      <p className="mt-6 text-center text-sm text-tinta-suave">
        <Link
          href="/recuperacion"
          className="font-bold text-verde underline underline-offset-2"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
