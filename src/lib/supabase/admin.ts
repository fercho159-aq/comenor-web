/**
 * ⚠️ SOLO SERVIDOR — cliente Supabase con SERVICE ROLE KEY.
 *
 * Este cliente SALTA RLS por completo. Úsalo únicamente en route handlers,
 * server actions o jobs (webhooks de Mercado Pago, envío de correos, export
 * Excel, marca de agua de documentos). PROHIBIDO importarlo desde cualquier
 * archivo con 'use client' o pasar su resultado al cliente: la service role
 * key jamás debe llegar al navegador.
 *
 * Antes de usarlo, la autorización ya debe estar resuelta con requireRol()
 * (src/lib/auth/roles.ts) — este cliente NO valida permisos.
 */
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { obtenerVariableEntorno, supabaseUrl } from "./env";

/**
 * Crea un cliente admin (service role) sin persistencia de sesión.
 * Crear por operación; no guarda estado de usuario.
 */
export function createAdminClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() es solo de servidor: nunca en el navegador.",
    );
  }

  return createSupabaseClient(
    supabaseUrl(),
    obtenerVariableEntorno("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
}
