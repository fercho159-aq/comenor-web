/**
 * Helpers de almacenamiento del módulo documental.
 *
 * El bucket es PRIVADO: los objetos jamás tienen URL pública; el visor pide
 * una URL firmada de vida corta (ver src/lib/storage/firmadas.ts). Aquí se
 * centraliza el nombre del bucket, la derivación del formato y la construcción
 * de rutas de objeto deterministas y sin colisiones.
 */
import { documentoSchema } from "@/lib/schemas";

/** Bucket PRIVADO de documentos en Supabase Storage. */
export const BUCKET_DOCUMENTOS = "documentos";

/**
 * Extensiones/formatos aceptados para subida (el visor los convierte a PDF vía
 * Gotenberg cuando aplica; ver PLAN.md línea 35).
 */
const FORMATOS_PERMITIDOS = ["pdf", "doc", "docx", "xls", "xlsx"] as const;
export type FormatoPermitido = (typeof FORMATOS_PERMITIDOS)[number];

/** ¿El formato derivado está dentro de los permitidos? */
export function esFormatoPermitido(valor: string): valor is FormatoPermitido {
  return (FORMATOS_PERMITIDOS as readonly string[]).includes(valor);
}

/**
 * Deriva el formato (extensión en minúsculas) desde el nombre del archivo.
 * Devuelve null si no hay extensión reconocible.
 */
export function formatoDesdeNombre(nombre: string): string | null {
  const punto = nombre.lastIndexOf(".");
  if (punto < 0 || punto === nombre.length - 1) return null;
  return nombre.slice(punto + 1).toLowerCase();
}

/**
 * Esquema de METADATOS que envía el cliente (sin storagePath ni formato, que
 * los deriva el servidor tras subir el archivo). Se deriva del `documentoSchema`
 * existente con `.omit` para NO duplicar reglas.
 */
export const metadatosDocumentoSchema = documentoSchema.omit({
  storagePath: true,
  formato: true,
});

export type MetadatosDocumentoInput = ReturnType<
  typeof metadatosDocumentoSchema.parse
>;

/**
 * Construye una ruta de objeto determinista y única dentro del bucket:
 *   {anio}/{mm}/{uuid}.{formato}
 * Agrupar por año/mes facilita la administración y evita colisiones de nombre.
 */
export function construirStoragePath(params: {
  anio: number;
  mes: number;
  formato: string;
  id: string;
}): string {
  const mm = String(params.mes).padStart(2, "0");
  return `${params.anio}/${mm}/${params.id}.${params.formato}`;
}
