/**
 * Procesamiento de la portada de un evento con sharp (SOLO SERVIDOR).
 *
 * Se separa de `acciones.ts` porque ese archivo es `"use server"` (cada export
 * es una Server Action); aquí viven helpers normales, testeables con vitest
 * (sharp corre en Node, sin servicios externos).
 */
import sharp from "sharp";

/**
 * Lado máximo de la portada. La imagen se ajusta DENTRO de este cuadro
 * conservando su proporción — nunca se recorta. Los carteles verticales (mucho
 * texto) mantienen todo su contenido; la tarjeta pública los enmarca con un
 * fondo difuminado. 1600 px da resolución de sobra para tarjeta y OpenGraph.
 */
export const LADO_MAX_PORTADA = 1600;

/**
 * Normaliza la imagen subida: corrige orientación EXIF, la ajusta dentro de un
 * cuadro máximo SIN recortar (preserva la proporción original) y la recomprime
 * a WebP. Devuelve los bytes listos para subir al bucket.
 *
 * Recortar a 16:9 cortaba el texto de los carteles; con `fit: "inside"` la foto
 * se ve completa siempre, sea vertical u horizontal.
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
    .resize(LADO_MAX_PORTADA, LADO_MAX_PORTADA, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();
  return new Uint8Array(salida);
}
