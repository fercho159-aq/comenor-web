/**
 * Procesamiento de la portada de un evento con sharp (SOLO SERVIDOR).
 *
 * Se separa de `acciones.ts` porque ese archivo es `"use server"` (cada export
 * es una Server Action); aquí viven helpers normales, testeables con vitest
 * (sharp corre en Node, sin servicios externos).
 */
import sharp from "sharp";

/** Dimensiones objetivo de la portada (16:9, suficiente para tarjeta y OG). */
export const ANCHO_PORTADA = 1200;
export const ALTO_PORTADA = 675;

/**
 * Normaliza la imagen subida: corrige orientación EXIF, recorta a 16:9 y la
 * recomprime a WebP. Devuelve los bytes listos para subir al bucket.
 *
 * No confía en el tipo declarado por el cliente: sharp re-decodifica y lanza si
 * el archivo no es una imagen válida.
 */
export async function procesarImagenEvento(
  bytes: Uint8Array,
): Promise<Uint8Array> {
  if (bytes.byteLength === 0) {
    throw new Error("La imagen está vacía.");
  }
  const salida = await sharp(bytes)
    .rotate() // aplica la orientación EXIF y la descarta
    .resize(ANCHO_PORTADA, ALTO_PORTADA, { fit: "cover", position: "centre" })
    .webp({ quality: 80 })
    .toBuffer();
  return new Uint8Array(salida);
}
