/**
 * Handler HTTP de better-auth (login, logout, sesión, etc.).
 * Todas las rutas /api/auth/* las atiende la instancia de src/lib/auth/config.
 * Runtime Node: better-auth necesita la conexión Postgres (Neon).
 */
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/config";

export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth);
