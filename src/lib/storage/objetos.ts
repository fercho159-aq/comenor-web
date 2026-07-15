/**
 * Operaciones sobre objetos en MinIO/S3 — reemplazo directo de las llamadas
 * `supabase.storage.from(bucket).upload/download/remove/getPublicUrl` que
 * quedaban regadas en el panel admin y los route handlers.
 *
 * ⚠️ SOLO SERVIDOR (ver ./s3.ts): las credenciales S3 jamás al cliente.
 *
 * Los "buckets" lógicos (documentos | memorias | eventos) son prefijos dentro
 * del bucket físico único de MinIO; los `storage_path` guardados en la BD no
 * cambian.
 */
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { bucketS3, claveObjeto, clienteS3 } from "./s3";

export interface OpcionesSubida {
  /** MIME del objeto (p. ej. "application/pdf", "image/webp"). */
  contentType?: string;
  /**
   * `false` (default) = NO sobrescribir si ya existe (equivalente a
   * `upsert: false` de Supabase; se implementa con `If-None-Match: *`,
   * soportado por MinIO). `true` = sobrescribir.
   */
  sobrescribir?: boolean;
}

/**
 * Sube un objeto PRIVADO a MinIO. Nunca hay URL pública implícita: para leerlo
 * se usa `urlFirmada` (visor) u `obtenerObjeto` (servidor).
 */
export async function subirObjeto(
  bucket: string,
  path: string,
  cuerpo: Uint8Array,
  opciones: OpcionesSubida = {},
): Promise<void> {
  const comando = new PutObjectCommand({
    Bucket: bucketS3(),
    Key: claveObjeto(bucket, path),
    Body: cuerpo,
    ContentType: opciones.contentType ?? "application/octet-stream",
    ...(opciones.sobrescribir ? {} : { IfNoneMatch: "*" }),
  });
  try {
    await clienteS3().send(comando);
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "error desconocido";
    throw new Error(`No se pudo subir ${bucket}/${path}: ${mensaje}`);
  }
}

/** Descarga un objeto completo a memoria (para conversión, marca de agua, etc.). */
export async function obtenerObjeto(
  bucket: string,
  path: string,
): Promise<Uint8Array> {
  const comando = new GetObjectCommand({
    Bucket: bucketS3(),
    Key: claveObjeto(bucket, path),
  });
  const respuesta = await clienteS3().send(comando);
  if (!respuesta.Body) {
    throw new Error(`Objeto vacío o inexistente: ${bucket}/${path}.`);
  }
  return await respuesta.Body.transformToByteArray();
}

/** Borra uno o varios objetos del bucket lógico dado. No falla si no existen. */
export async function eliminarObjetos(
  bucket: string,
  paths: readonly string[],
): Promise<void> {
  if (paths.length === 0) return;
  const comando = new DeleteObjectsCommand({
    Bucket: bucketS3(),
    Delete: {
      Objects: paths.map((path) => ({ Key: claveObjeto(bucket, path) })),
      Quiet: true,
    },
  });
  await clienteS3().send(comando);
}

/**
 * URL pública (sin firma) de un objeto de contenido PÚBLICO — hoy solo las
 * portadas de eventos (`eventos/…`), que el calendario público muestra con
 * `next/image` y necesitan URL estable/cacheable.
 *
 * Requiere que el prefijo correspondiente tenga política de solo-lectura
 * anónima en MinIO (o que Caddy lo sirva). Base configurable con
 * `S3_PUBLIC_URL`; fallback `{S3_ENDPOINT}/{S3_BUCKET}`.
 *
 * JAMÁS usar para documentos ni memorias: esos van SIEMPRE por `urlFirmada`.
 */
export function urlPublica(bucket: string, path: string): string {
  const base =
    process.env.S3_PUBLIC_URL ||
    (process.env.S3_ENDPOINT
      ? `${process.env.S3_ENDPOINT.replace(/\/+$/, "")}/${bucketS3()}`
      : null);
  if (!base) {
    throw new Error(
      "Falta S3_PUBLIC_URL o S3_ENDPOINT en el entorno (ver .env.example).",
    );
  }
  return `${base.replace(/\/+$/, "")}/${claveObjeto(bucket, path)}`;
}
