import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { estamparMarcaAgua } from "@/lib/documentos/marca-agua";

/** Crea un PDF mínimo válido con `paginas` páginas para usar como entrada. */
async function pdfDePrueba(paginas = 2): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < paginas; i += 1) {
    const pagina = doc.addPage([595, 842]); // A4
    pagina.drawText("Documento COMENOR de prueba");
  }
  return doc.save();
}

describe("estamparMarcaAgua", () => {
  it("produce un PDF con MÁS bytes que el original (marca añadida)", async () => {
    const original = await pdfDePrueba();
    const marcado = await estamparMarcaAgua(original, {
      correo: "socio@comenor.org.mx",
      fecha: new Date("2026-07-14T10:00:00Z"),
    });
    expect(marcado.byteLength).toBeGreaterThan(original.byteLength);
  });

  it("el resultado sigue siendo un PDF válido con las mismas páginas", async () => {
    const original = await pdfDePrueba(3);
    const marcado = await estamparMarcaAgua(original, {
      correo: "consejo@comenor.org.mx",
    });
    // No debe romper: pdf-lib lo vuelve a cargar sin lanzar.
    const recargado = await PDFDocument.load(marcado);
    expect(recargado.getPageCount()).toBe(3);
  });

  it("no muta el buffer de entrada", async () => {
    const original = await pdfDePrueba(1);
    const copia = original.slice();
    await estamparMarcaAgua(original, { correo: "x@comenor.org.mx" });
    expect(Array.from(original)).toEqual(Array.from(copia));
  });

  it("lanza si el correo viene vacío", async () => {
    const original = await pdfDePrueba(1);
    await expect(
      estamparMarcaAgua(original, { correo: "   " }),
    ).rejects.toThrow(/correo/i);
  });

  it("lanza si los bytes no son un PDF", async () => {
    const basura = new Uint8Array([1, 2, 3, 4, 5]);
    await expect(
      estamparMarcaAgua(basura, { correo: "x@comenor.org.mx" }),
    ).rejects.toBeInstanceOf(Error);
  });
});
