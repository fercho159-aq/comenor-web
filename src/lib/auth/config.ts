/**
 * Instancia de better-auth sobre Neon Postgres (adaptador Drizzle).
 *
 * - Usuarios/sesiones/credenciales viven en las tablas user/session/account/
 *   verification de src/db/schema.ts (ids uuid generados por la BD).
 * - El ROL de la app vive en user.rol (consejo | asociados | admin) como
 *   additionalField de solo-servidor: `input: false` impide que un cliente lo
 *   fije al registrarse (anti-escalación); default 'asociados'.
 * - Secretos SIEMPRE por entorno: BETTER_AUTH_SECRET / BETTER_AUTH_URL.
 * - `nextCookies()` va AL FINAL de los plugins: permite que las server
 *   actions (login) escriban la cookie de sesión vía next/headers.
 *
 * SOLO SERVIDOR: importa la conexión a la BD. Jamás desde 'use client'.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";

/**
 * ¿Está configurado el backend de auth? Sin estas variables las rutas
 * protegidas fallan CERRADO (ver src/proxy.ts) y las públicas siguen vivas.
 */
export function authConfigurado(): boolean {
  return Boolean(process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL);
}

export const auth = betterAuth({
  // baseURL: en Vercel se define BETTER_AUTH_URL; en local, http://localhost:3000.
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // El alta de cuentas la hace el admin (no hay registro público abierto).
    disableSignUp: process.env.AUTH_PERMITIR_REGISTRO !== "true",
  },
  user: {
    additionalFields: {
      rol: {
        type: "string",
        required: false,
        defaultValue: "asociados",
        // Nunca asignable desde el cliente: solo el admin lo cambia en BD.
        input: false,
      },
    },
  },
  session: {
    // 7 días de vida, renovada si se usa pasado 1 día (defaults explícitos).
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    database: {
      // Los ids los genera Postgres (uuid defaultRandom) — no better-auth.
      generateId: false,
    },
  },
  plugins: [nextCookies()],
});

/** Sesión tipada tal como la devuelve auth.api.getSession (incluye user.rol). */
export type SesionAuth = typeof auth.$Infer.Session;
