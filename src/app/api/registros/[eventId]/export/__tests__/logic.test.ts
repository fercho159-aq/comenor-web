import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import {
  construirLibroRegistros,
  ENCABEZADOS,
  nombreArchivoRegistros,
  type FilaRegistroExport,
} from "../logic";

const REGISTROS: FilaRegistroExport[] = [
  {
    nombre: "María Fernández Ñáñez",
    cargo: "Directora de Acreditación",
    correo: "maria@organismo.mx",
    celular: "5544332211",
    organismo: "Organismo de Certificación Ñandú",
    estadoPago: "aprobado",
    checkedInAt: new Date("2026-07-14T18:00:00.000Z"),
  },
  {
    nombre: "José Ramírez",
    cargo: "Evaluador",
    correo: "jose@lab.mx",
    celular: "5599887766",
    organismo: "Laboratorio Análisis Técnico",
    estadoPago: "pendiente",
    checkedInAt: null,
  },
];

async function cargarLibro(datos: ArrayBuffer): Promise<ExcelJS.Workbook> {
  const libro = new ExcelJS.Workbook();
  // jszip acepta ArrayBuffer en runtime; el tipo de exceljs pide Buffer.
  await libro.xlsx.load(datos as Parameters<typeof libro.xlsx.load>[0]);
  return libro;
}

describe("construirLibroRegistros (.xlsx)", () => {
  it("genera un libro que abre y tiene los encabezados en español", async () => {
    const buffer = await construirLibroRegistros("Foro COMENOR 2026", REGISTROS);
    expect(buffer.byteLength).toBeGreaterThan(0);

    const libro = await cargarLibro(buffer);
    const hoja = libro.getWorksheet("Registros");
    expect(hoja).toBeDefined();

    const encabezados = ENCABEZADOS.map((_, i) =>
      hoja!.getRow(1).getCell(i + 1).text,
    );
    expect(encabezados).toEqual([...ENCABEZADOS]);
    // Encabezados con contenido esperado en español.
    expect(encabezados).toContain("Organismo");
    expect(encabezados).toContain("Estado de pago");
    expect(encabezados).toContain("Check-in");
  });

  it("preserva los acentos y caracteres especiales (UTF-8)", async () => {
    const buffer = await construirLibroRegistros("Evento", REGISTROS);
    const libro = await cargarLibro(buffer);
    const hoja = libro.getWorksheet("Registros")!;

    expect(hoja.getRow(2).getCell(1).text).toBe("María Fernández Ñáñez");
    expect(hoja.getRow(2).getCell(5).text).toBe(
      "Organismo de Certificación Ñandú",
    );
    expect(hoja.getRow(3).getCell(1).text).toBe("José Ramírez");
  });

  it("traduce estado_pago y formatea el check-in", async () => {
    const buffer = await construirLibroRegistros("Evento", REGISTROS);
    const libro = await cargarLibro(buffer);
    const hoja = libro.getWorksheet("Registros")!;

    // Columna 6 = Estado de pago, columna 7 = Check-in.
    expect(hoja.getRow(2).getCell(6).text).toBe("Aprobado");
    expect(hoja.getRow(3).getCell(6).text).toBe("Pendiente");
    // Fila 2 tiene check-in (fecha formateada, no "No"); fila 3 no.
    expect(hoja.getRow(2).getCell(7).text).not.toBe("No");
    expect(hoja.getRow(2).getCell(7).text.length).toBeGreaterThan(0);
    expect(hoja.getRow(3).getCell(7).text).toBe("No");
  });

  it("nombreArchivoRegistros produce un slug seguro sin acentos", () => {
    expect(nombreArchivoRegistros("Foro COMENOR 2026")).toBe(
      "registros-foro-comenor-2026.xlsx",
    );
    expect(nombreArchivoRegistros("Acreditación Ñandú")).toBe(
      "registros-acreditacion-nandu.xlsx",
    );
    expect(nombreArchivoRegistros("!!!")).toBe("registros-evento.xlsx");
  });
});
