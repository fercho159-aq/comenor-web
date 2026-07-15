/**
 * Tipos y estado inicial del formulario de login.
 *
 * Vive fuera de `acciones.ts` porque ese archivo es `"use server"` y sólo puede
 * exportar funciones async; un `const` objeto o un `type` exportados ahí rompen
 * en runtime ("A 'use server' file can only export async functions").
 */

/** Errores por campo del formulario de login. */
export type ErroresLogin = Partial<Record<"correo" | "password", string[]>>;

/** Estado que la server action devuelve al formulario (useActionState). */
export type EstadoLogin = {
  ok: boolean;
  /** Mensaje general (credenciales inválidas, error de servicio). */
  mensaje?: string;
  /** Errores por campo (validación Zod del servidor). */
  errores?: ErroresLogin;
};

export const estadoLoginInicial: EstadoLogin = { ok: false };
