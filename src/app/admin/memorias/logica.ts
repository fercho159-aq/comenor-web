/**
 * Lógica PURA del módulo Memorias (galerías + fotos).
 * Sin dependencias de Next/DB/sharp: reglas testeables con vitest.
 */

/** Bucket privado de Supabase Storage para las fotos de memorias. */
export const BUCKET_MEMORIAS = "memorias";

/** Tipos MIME de imagen aceptados al subir fotos. */
export const MIME_IMAGEN_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Tamaño máximo por archivo subido (8 MB antes de comprimir). */
export const TAMANO_MAX_FOTO_BYTES = 8 * 1024 * 1024;

/** Ancho máximo de la imagen comprimida (px). */
export const ANCHO_MAX_FOTO = 1600;

/** Calidad JPEG de la imagen comprimida. */
export const CALIDAD_JPEG = 80;

/** ¿El MIME está en la lista blanca de imágenes? */
export function esImagenPermitida(mime: string | null | undefined): boolean {
  if (!mime) return false;
  return (MIME_IMAGEN_PERMITIDOS as readonly string[]).includes(mime);
}

/**
 * Ruta de almacenamiento de una foto dentro del bucket privado.
 * Formato: `{anio}/{galeriaId}/{id}.jpg` (siempre JPEG tras comprimir con sharp).
 */
export function construirRutaFoto(params: {
  anio: number;
  galeriaId: string;
  id: string;
}): string {
  const { anio, galeriaId, id } = params;
  if (!Number.isInteger(anio) || anio < 1900 || anio > 2200) {
    throw new Error("Año inválido para la ruta de la foto.");
  }
  if (!galeriaId || !id) {
    throw new Error("construirRutaFoto requiere galeriaId e id.");
  }
  return `${anio}/${galeriaId}/${id}.jpg`;
}

/**
 * Siguiente número de orden para una foto nueva: `max(ordenes) + 1`, o 0 si la
 * galería está vacía. Determinista para poder testearse.
 */
export function siguienteOrden(ordenes: ReadonlyArray<number>): number {
  if (ordenes.length === 0) return 0;
  return Math.max(...ordenes) + 1;
}

/**
 * Normaliza una lista de ids en un reordenamiento consecutivo desde 0.
 * Se usa al arrastrar/mover fotos: la posición en el arreglo define el `orden`.
 * Ignora ids duplicados (conserva la primera aparición).
 */
export function normalizarReordenamiento(
  idsEnOrden: ReadonlyArray<string>,
): Array<{ id: string; orden: number }> {
  const vistos = new Set<string>();
  const resultado: Array<{ id: string; orden: number }> = [];
  for (const id of idsEnOrden) {
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    resultado.push({ id, orden: resultado.length });
  }
  return resultado;
}

/**
 * Mueve un elemento dentro de un arreglo de ids (una posición arriba o abajo)
 * y devuelve el nuevo orden normalizado. Pensado para los botones "Subir/Bajar"
 * de la rejilla de fotos (accesibles por teclado, sin drag-and-drop).
 */
export function moverEnLista(
  ids: ReadonlyArray<string>,
  id: string,
  direccion: "arriba" | "abajo",
): string[] {
  const indice = ids.indexOf(id);
  if (indice === -1) return [...ids];
  const destino = direccion === "arriba" ? indice - 1 : indice + 1;
  if (destino < 0 || destino >= ids.length) return [...ids];
  const copia = [...ids];
  const [elemento] = copia.splice(indice, 1);
  copia.splice(destino, 0, elemento);
  return copia;
}
