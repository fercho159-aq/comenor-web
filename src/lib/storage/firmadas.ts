/**
 * URLs firmadas de Supabase Storage — PLAN.md §2.7.
 *
 * Regla: los documentos privados NUNCA tienen URL pública. El visor pide una
 * URL firmada de vida corta (60 s por defecto) justo antes de renderizar.
 *
 * SOLO SERVIDOR: usa `SUPABASE_SERVICE_ROLE_KEY`, que jamás debe llegar al
 * cliente. Importar este módulo desde un componente cliente es un error de
 * seguridad — el bundle expondría la service role key. Úsalo únicamente en
 * route handlers / server components, detrás del middleware de roles.
 */
import { createClient } from "@supabase/supabase-js";

/** Vida por defecto de una URL firmada (segundos) — PLAN §2.7. */
export const VIDA_URL_FIRMADA_SEGUNDOS = 60;

function crearClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno (ver .env.example).",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Genera una URL firmada de vida corta para un objeto de un bucket PRIVADO.
 *
 * @param bucket   Bucket privado (p. ej. "documentos", "memorias").
 * @param path     Ruta del objeto dentro del bucket (documents.storage_path).
 * @param segundos Vida de la URL; default 60 s. Se limita a máx. 300 s para
 *                 que nadie "alargue" documentos privados por accidente.
 */
export async function urlFirmada(
  bucket: string,
  path: string,
  segundos: number = VIDA_URL_FIRMADA_SEGUNDOS,
): Promise<string> {
  if (!bucket || !path) {
    throw new Error("urlFirmada requiere bucket y path no vacíos.");
  }
  const vida = Math.min(Math.max(Math.floor(segundos), 1), 300);

  const supabase = crearClienteAdmin();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, vida);

  if (error || !data?.signedUrl) {
    throw new Error(
      `No se pudo firmar la URL de ${bucket}/${path}: ${error?.message ?? "respuesta vacía"}`,
    );
  }

  return data.signedUrl;
}
