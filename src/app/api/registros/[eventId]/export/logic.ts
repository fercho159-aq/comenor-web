/**
 * Generación del .xlsx de registros de un evento (PLAN.md §A2).
 *
 * Puro: recibe los datos ya consultados y devuelve el buffer del libro.
 * exceljs serializa el XML en UTF-8, así que los acentos (Organismo,
 * Cargo, nombres) se preservan correctamente al abrir en Excel/Numbers.
 */
import ExcelJS from "exceljs";

import type { Registration } from "@/db/schema";

/** Valores del enum estado_pago (derivado del schema, sin redefinirlo). */
type EstadoPago = Registration["estadoPago"];

/** Fila de registro para exportar (subconjunto de `registrations`). */
export interface FilaRegistroExport {
  nombre: string;
  cargo: string;
  correo: string;
  celular: string;
  organismo: string;
  estadoPago: EstadoPago;
  checkedInAt: Date | null;
}

/** Encabezados en español, en el orden de las columnas. */
export const ENCABEZADOS = [
  "Nombre",
  "Cargo",
  "Correo",
  "Celular",
  "Organismo",
  "Estado de pago",
  "Check-in",
] as const;

/** Etiquetas legibles para el enum estado_pago. */
const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  gratuito: "Gratuito",
  pendiente: "Pendiente",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

const formateadorFecha = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Mexico_City",
});

function formatearCheckin(checkedInAt: Date | null): string {
  if (!checkedInAt) return "No";
  return formateadorFecha.format(checkedInAt);
}

/**
 * Construye el libro .xlsx con los registros de un evento y devuelve su buffer.
 */
export async function construirLibroRegistros(
  nombreEvento: string,
  registros: readonly FilaRegistroExport[],
): Promise<ArrayBuffer> {
  const libro = new ExcelJS.Workbook();
  libro.creator = "COMENOR";
  libro.created = new Date();

  const hoja = libro.addWorksheet("Registros");
  hoja.columns = [
    { header: ENCABEZADOS[0], key: "nombre", width: 28 },
    { header: ENCABEZADOS[1], key: "cargo", width: 24 },
    { header: ENCABEZADOS[2], key: "correo", width: 30 },
    { header: ENCABEZADOS[3], key: "celular", width: 16 },
    { header: ENCABEZADOS[4], key: "organismo", width: 30 },
    { header: ENCABEZADOS[5], key: "estadoPago", width: 16 },
    { header: ENCABEZADOS[6], key: "checkin", width: 22 },
  ];

  const filaEncabezado = hoja.getRow(1);
  filaEncabezado.font = { bold: true };
  filaEncabezado.commit();

  for (const registro of registros) {
    hoja.addRow({
      nombre: registro.nombre,
      cargo: registro.cargo,
      correo: registro.correo,
      celular: registro.celular,
      organismo: registro.organismo,
      estadoPago: ETIQUETA_ESTADO_PAGO[registro.estadoPago],
      checkin: formatearCheckin(registro.checkedInAt),
    });
  }

  // Nombre del evento como propiedad del libro (auditoría / trazabilidad).
  hoja.headerFooter.oddHeader = `&L${nombreEvento}`;

  const buffer = await libro.xlsx.writeBuffer();
  // Copia a un ArrayBuffer plano y exactamente dimensionado: es un BodyInit
  // válido (BufferSource) para NextResponse y evita el conflicto de tipos
  // Buffer<ArrayBufferLike> con lib.dom.
  return new Uint8Array(buffer).buffer;
}

/** Slug seguro para el nombre de archivo (sin acentos ni espacios). */
export function nombreArchivoRegistros(nombreEvento: string): string {
  const base = nombreEvento
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `registros-${base || "evento"}.xlsx`;
}
