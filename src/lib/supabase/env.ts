/**
 * Lectura estricta de variables de entorno de Supabase (contrato en .env.example).
 * Falla en tiempo de ejecución con un mensaje claro si falta una variable —
 * nunca valores por defecto inventados, nunca secretos hardcodeados.
 */

/** Devuelve el valor de una variable de entorno o lanza si está vacía. */
export function obtenerVariableEntorno(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Revisa .env.example y configura .env.local o el dashboard de Vercel.`,
    );
  }
  return valor;
}

/** URL pública del proyecto Supabase. */
export function supabaseUrl(): string {
  return obtenerVariableEntorno("NEXT_PUBLIC_SUPABASE_URL");
}

/** Anon key pública (RLS es la barrera; jamás alcanza datos privados). */
export function supabaseAnonKey(): string {
  return obtenerVariableEntorno("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}
