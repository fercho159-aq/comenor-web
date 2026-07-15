/**
 * Marca de agua para el visor de documentos (PLAN.md §2.7 y línea 21).
 *
 * El visor NUNCA descarga el PDF original: se estampa una marca de agua
 * diagonal, repetida, con el correo del usuario + fecha, de modo que cualquier
 * captura de pantalla quede trazada a quien la tomó. Se usa pdf-lib en el
 * servidor (serverless), detrás de la autorización por rol.
 *
 * SOLO SERVIDOR: se ejecuta en route handlers tras `requireRol`.
 */
import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

/** Datos de trazabilidad que se estampan en cada página. */
export interface DatosMarcaAgua {
  /** Correo del usuario autenticado que abre el documento. */
  correo: string;
  /** Momento de apertura; por defecto `new Date()`. */
  fecha?: Date;
}

/** Formatea la fecha en es-MX (día, mes, año, hora) para la marca. */
function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  }).format(fecha);
}

/** Estampa el texto en mosaico diagonal sobre una página. */
function estamparPagina(
  pagina: PDFPage,
  fuente: PDFFont,
  texto: string,
): void {
  const { width, height } = pagina.getSize();
  const tamano = 12;
  const anchoTexto = fuente.widthOfTextAtSize(texto, tamano);
  const pasoX = anchoTexto + 120;
  const pasoY = 130;

  // Cubre toda la página en diagonal con desbordamiento controlado.
  for (let y = -pasoY; y < height + pasoY; y += pasoY) {
    for (let x = -pasoX; x < width + pasoX; x += pasoX) {
      pagina.drawText(texto, {
        x,
        y,
        size: tamano,
        font: fuente,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.18,
        rotate: degrees(35),
      });
    }
  }
}

/**
 * Devuelve una copia del PDF con la marca de agua estampada en TODAS las
 * páginas. No muta el buffer de entrada.
 *
 * @param pdfOriginal Bytes del PDF original (de MinIO/S3).
 * @param datos       Correo del usuario + fecha de apertura.
 * @returns Bytes del PDF con marca de agua.
 * @throws Si el PDF no se puede cargar (bytes corruptos / no es PDF).
 */
export async function estamparMarcaAgua(
  pdfOriginal: Uint8Array,
  datos: DatosMarcaAgua,
): Promise<Uint8Array> {
  const correo = datos.correo?.trim();
  if (!correo) {
    throw new Error("estamparMarcaAgua requiere el correo del usuario.");
  }

  const fecha = datos.fecha ?? new Date();
  const texto = `${correo} · ${formatearFecha(fecha)} · COMENOR`;

  const pdf = await PDFDocument.load(pdfOriginal);
  const fuente = await pdf.embedFont(StandardFonts.Helvetica);

  for (const pagina of pdf.getPages()) {
    estamparPagina(pagina, fuente, texto);
  }

  return pdf.save();
}
