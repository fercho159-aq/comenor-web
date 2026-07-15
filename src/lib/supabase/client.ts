/**
 * Cliente Supabase para componentes 'use client' (navegador).
 * Solo usa la anon key pública; los datos privados los protege RLS.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAnonKey, supabaseUrl } from "./env";

let clienteNavegador: SupabaseClient | undefined;

/**
 * Crea (o reutiliza) el cliente Supabase del navegador.
 * Singleton por pestaña: evita múltiples instancias de GoTrue.
 */
export function createClient(): SupabaseClient {
  clienteNavegador ??= createBrowserClient(supabaseUrl(), supabaseAnonKey());
  return clienteNavegador;
}
