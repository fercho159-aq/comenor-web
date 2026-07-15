"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { loginSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth/config";
import { ipConfiable } from "@/lib/net/ip";
import { CAMPO_HONEYPOT, esHoneypotDisparado, limitar } from "@/lib/ratelimit";
import type { EstadoLogin } from "./estado";

/**
 * Sanitiza el destino post-login: solo rutas internas relativas, para evitar
 * open redirects (`//evil.com`, `https://…`). Si no es válido, cae a `/admin`.
 */
function destinoSeguro(valor: FormDataEntryValue | null): string {
  if (typeof valor !== "string") return "/admin";
  if (!valor.startsWith("/") || valor.startsWith("//")) return "/admin";
  return valor;
}

/**
 * Inicia sesión con correo/contraseña vía better-auth (signInEmail).
 * El plugin nextCookies() de src/lib/auth/config.ts escribe la cookie de
 * sesión desde esta server action.
 *
 * Validación doble (PLAN.md §2.1): el cliente ya validó con `loginSchema`; aquí
 * se RE-VALIDA con el mismo esquema antes de tocar el servicio. Campo inválido =
 * error por campo. Nunca se revela si el correo existe: credenciales incorrectas
 * devuelven un único mensaje genérico.
 */
export async function iniciarSesion(
  _estadoPrevio: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  // Honeypot: campo oculto que solo un bot rellena. Mensaje genérico, sin
  // revelar la trampa ni tocar el servicio de auth.
  if (esHoneypotDisparado(formData.get(CAMPO_HONEYPOT))) {
    return { ok: false, mensaje: "Correo o contraseña incorrectos." };
  }

  const resultado = loginSchema.safeParse({
    correo: formData.get("correo"),
    password: formData.get("password"),
  });

  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los campos marcados.",
      errores: resultado.error.flatten().fieldErrors,
    };
  }

  // Rate limit contra fuerza bruta (PLAN §2.5): por IP de confianza + correo.
  // La clave incluye el correo para no dejar que un atacante bloquee a terceros
  // agotando solo la cubeta por IP, y acota los intentos por cuenta.
  const ip = ipConfiable(await headers());
  const limite = await limitar(
    `login:${ip}:${resultado.data.correo.toLowerCase()}`,
    { limite: 5, ventanaSegundos: 60 },
  );
  if (!limite.permitido) {
    return {
      ok: false,
      mensaje: "Demasiados intentos. Espera un momento antes de volver a intentarlo.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: resultado.data.correo,
        password: resultado.data.password,
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      // Mensaje genérico: no distinguir "no existe" de "contraseña incorrecta".
      return { ok: false, mensaje: "Correo o contraseña incorrectos." };
    }
    // Falla de servicio (BD caída, mala configuración): también genérico,
    // sin filtrar detalles internos al cliente.
    return {
      ok: false,
      mensaje: "No se pudo iniciar sesión. Intenta de nuevo en un momento.",
    };
  }

  // `redirect` lanza internamente: debe ir fuera de cualquier try/catch y al
  // final del flujo exitoso.
  redirect(destinoSeguro(formData.get("next")));
}
