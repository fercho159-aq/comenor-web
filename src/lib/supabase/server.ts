/**
 * Cliente Supabase para Server Components y Route Handlers (Next 16, App Router).
 * Usa las cookies de la petición para hidratar la sesión del usuario.
 * La sesión se refresca en src/proxy.ts; aquí solo se lee/escribe cuando se puede.
 */
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Crea un cliente Supabase ligado a las cookies de la petición actual.
 * Llamar por petición (nunca cachear en módulo): cada request tiene su sesión.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component: no se pueden escribir cookies.
          // No es un error — el refresco de sesión lo hace src/proxy.ts.
        }
      },
    },
  });
}
