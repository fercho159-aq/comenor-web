/**
 * URLs firmadas de MinIO/S3 — PLAN.md §2.7.
 *
 * Regla: los documentos privados NUNCA tienen URL pública. El visor pide una
 * URL firmada (presigned GET) de vida corta (60 s por defecto) justo antes de
 * renderizar.
 *
 * ⚠️ SOLO SERVIDOR: firma con las credenciales S3 del servicio, que jamás
 * deben llegar al cliente. Importar este módulo desde un componente cliente es
 * un error de seguridad. Úsalo únicamente en route handlers / server
 * components, detrás del middleware de roles.
 *
 * La firma pública de este módulo NO cambió al migrar de Supabase a MinIO:
 * `urlFirmada(bucket, path, segundos)` sigue igual; el "bucket" lógico ahora
 * es un prefijo dentro del bucket físico único (ver ./s3.ts).
 */
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { bucketS3, claveObjeto, clienteS3 } from "./s3";

/** Vida por defecto de una URL firmada (segundos) — PLAN §2.7. */
export const VIDA_URL_FIRMADA_SEGUNDOS = 60;

/**
 * Genera una URL firmada de vida corta para un objeto PRIVADO en MinIO.
 *
 * @param bucket   Bucket lógico (p. ej. "documentos", "memorias").
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

  const comando = new GetObjectCommand({
    Bucket: bucketS3(),
    Key: claveObjeto(bucket, path),
  });

  try {
    return await getSignedUrl(clienteS3(), comando, { expiresIn: vida });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "error desconocido";
    throw new Error(`No se pudo firmar la URL de ${bucket}/${path}: ${mensaje}`);
  }
}
