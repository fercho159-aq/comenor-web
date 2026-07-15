/**
 * Cliente de Gotenberg (VPS MAW) — conversión Word/Excel → PDF para el visor.
 *
 * CONTRATO (PLAN.md §1.1): el panel admin acepta .doc/.docx/.xls/.xlsx; antes
 * de mostrarlos en el visor (que solo renderiza PDF con marca de agua) el
 * servidor los convierte con la ruta LibreOffice de Gotenberg:
 *
 *   POST {GOTENBERG_URL}/forms/libreoffice/convert
 *   multipart/form-data con un campo "files" (el nombre de archivo DEBE llevar
 *   la extensión correcta: Gotenberg decide el conversor por extensión).
 *   → 200 con el PDF en el cuerpo; cualquier otro estatus es fallo.
 *
 * Autenticación: el Gotenberg del VPS vive detrás de Caddy y exige el token
 * secreto `GOTENBERG_TOKEN`, enviado como `Authorization: Bearer …`.
 *
 * ⚠️ SOLO SERVIDOR: GOTENBERG_URL/GOTENBERG_TOKEN jamás al cliente.
 * Este módulo NO está integrado aún en los handlers del visor; lo consume el
 * integrador donde haga falta (documento no-PDF → convertirAPdf → marca de
 * agua → visor).
 */

/** Tiempo máximo de conversión antes de abortar (LibreOffice puede tardar). */
const TIMEOUT_CONVERSION_MS = 120_000;

/** Extensiones que Gotenberg convierte en este proyecto. */
const EXTENSIONES_CONVERTIBLES = ["doc", "docx", "xls", "xlsx"] as const;

/** ¿El nombre de archivo tiene una extensión que sabemos convertir? */
export function esConvertible(nombre: string): boolean {
  const punto = nombre.lastIndexOf(".");
  if (punto < 0) return false;
  const ext = nombre.slice(punto + 1).toLowerCase();
  return (EXTENSIONES_CONVERTIBLES as readonly string[]).includes(ext);
}

/**
 * Convierte un archivo Word/Excel a PDF vía Gotenberg y devuelve los bytes del
 * PDF resultante.
 *
 * @param archivo Bytes del documento original (tal como está en MinIO).
 * @param nombre  Nombre de archivo CON extensión (p. ej. "acta-marzo.docx");
 *                Gotenberg elige el conversor por la extensión.
 */
export async function convertirAPdf(
  archivo: Uint8Array,
  nombre: string,
): Promise<Uint8Array> {
  const base = process.env.GOTENBERG_URL;
  const token = process.env.GOTENBERG_TOKEN;
  if (!base || !token) {
    throw new Error(
      "Faltan GOTENBERG_URL / GOTENBERG_TOKEN en el entorno (ver .env.example).",
    );
  }
  if (!esConvertible(nombre)) {
    throw new Error(
      `Formato no convertible a PDF: "${nombre}" (se aceptan doc, docx, xls, xlsx).`,
    );
  }

  const formulario = new FormData();
  formulario.append(
    "files",
    new Blob([new Uint8Array(archivo)], { type: "application/octet-stream" }),
    nombre,
  );

  const url = `${base.replace(/\/+$/, "")}/forms/libreoffice/convert`;
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formulario,
      signal: AbortSignal.timeout(TIMEOUT_CONVERSION_MS),
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "error de red";
    throw new Error(`No se pudo contactar a Gotenberg: ${mensaje}`);
  }

  if (!respuesta.ok) {
    throw new Error(
      `Gotenberg respondió ${respuesta.status} al convertir "${nombre}".`,
    );
  }

  return new Uint8Array(await respuesta.arrayBuffer());
}
