// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { procesarImagenEvento } from "../imagen";
import {
  centavosAPesos,
  construirImagenPathEvento,
  esBanderaEvento,
  generarSlug,
  leerCamposEvento,
  normalizarFechaLocalCDMX,
  pesosACentavos,
  validarArchivoImagen,
  validarEvento,
  type CamposCrudosEvento,
} from "../logica";

/** Campos válidos base para no repetir en cada caso de validación. */
const CAMPOS_VALIDOS: CamposCrudosEvento = {
  nombre: "Congreso Anual de Normalización",
  slug: "congreso-2026",
  fecha: "2026-09-24T11:00:00-06:00",
  sede: "Auditorio Nacional",
  modalidad: "presencial",
  costoPesos: "150.50",
  cupo: "200",
  estado: "programado",
  descripcion: "Sesión plenaria del consejo con ponencias y talleres.",
  publicado: true,
  registroAbierto: true,
};

describe("pesosACentavos", () => {
  it("cadena vacía es evento gratuito (0)", () => {
    expect(pesosACentavos("")).toBe(0);
    expect(pesosACentavos("   ")).toBe(0);
  });

  it("redondea al centavo sin basura de punto flotante", () => {
    expect(pesosACentavos("150.50")).toBe(15050);
    expect(pesosACentavos("12.1")).toBe(1210);
    expect(pesosACentavos("100")).toBe(10000);
  });

  it("no numérico devuelve NaN para que Zod lo marque", () => {
    expect(Number.isNaN(pesosACentavos("abc"))).toBe(true);
  });

  it("acepta número directo", () => {
    expect(pesosACentavos(5)).toBe(500);
  });
});

describe("centavosAPesos", () => {
  it("invierte la conversión", () => {
    expect(centavosAPesos(15050)).toBe(150.5);
    expect(centavosAPesos(0)).toBe(0);
  });
});

describe("generarSlug", () => {
  it("normaliza acentos y espacios a guiones", () => {
    expect(generarSlug("Reunión Técnica 2026")).toBe("reunion-tecnica-2026");
    expect(generarSlug("Congreso   Anual!!")).toBe("congreso-anual");
    expect(generarSlug("  Hola  ")).toBe("hola");
  });
});

describe("construirImagenPathEvento", () => {
  it("es determinista dado id y versión", () => {
    expect(construirImagenPathEvento("abc-123", 999)).toBe(
      "abc-123/portada-999.webp",
    );
  });
});

describe("esBanderaEvento", () => {
  it("solo acepta publicado / registroAbierto", () => {
    expect(esBanderaEvento("publicado")).toBe(true);
    expect(esBanderaEvento("registroAbierto")).toBe(true);
    expect(esBanderaEvento("estado")).toBe(false);
    expect(esBanderaEvento(null)).toBe(false);
  });
});

describe("normalizarFechaLocalCDMX", () => {
  it("añade el offset de CDMX a un datetime-local sin zona", () => {
    expect(normalizarFechaLocalCDMX("2026-09-24T11:00")).toBe(
      "2026-09-24T11:00:00-06:00",
    );
  });

  it("no toca un valor que ya trae zona o está vacío", () => {
    expect(normalizarFechaLocalCDMX("2026-09-24T11:00:00-06:00")).toBe(
      "2026-09-24T11:00:00-06:00",
    );
    expect(normalizarFechaLocalCDMX("")).toBe("");
  });
});

describe("validarArchivoImagen", () => {
  it("rechaza archivo vacío", () => {
    const f = new File([], "x.png", { type: "image/png" });
    expect(validarArchivoImagen(f)).toMatch(/vac/i);
  });

  it("rechaza formato no permitido", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.gif", {
      type: "image/gif",
    });
    expect(validarArchivoImagen(f)).toMatch(/formato/i);
  });

  it("rechaza imágenes mayores a 5 MB", () => {
    const f = new File([new Uint8Array([1])], "x.png", { type: "image/png" });
    Object.defineProperty(f, "size", { value: 6 * 1024 * 1024 });
    expect(validarArchivoImagen(f)).toMatch(/5 MB/);
  });

  it("acepta JPG/PNG/WebP de tamaño válido", () => {
    const f = new File([new Uint8Array([1, 2, 3])], "x.webp", {
      type: "image/webp",
    });
    expect(validarArchivoImagen(f)).toBeNull();
  });
});

describe("leerCamposEvento", () => {
  it("interpreta checkboxes como boolean", () => {
    const form = new FormData();
    form.set("nombre", "Evento");
    form.set("publicado", "on");
    // registroAbierto ausente = desmarcado
    const campos = leerCamposEvento(form);
    expect(campos.nombre).toBe("Evento");
    expect(campos.publicado).toBe(true);
    expect(campos.registroAbierto).toBe(false);
  });
});

describe("validarEvento", () => {
  it("convierte pesos a centavos y cupo a número en el caso válido", () => {
    const res = validarEvento(CAMPOS_VALIDOS, null);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.datos.costoCentavos).toBe(15050);
      expect(res.datos.cupo).toBe(200);
      expect(res.datos.fecha).toBeInstanceOf(Date);
      expect(res.datos.imagenPath).toBeNull();
    }
  });

  it("cupo vacío se valida como ilimitado (null)", () => {
    const res = validarEvento({ ...CAMPOS_VALIDOS, cupo: "" }, null);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.datos.cupo).toBeNull();
  });

  it("campo obligatorio faltante produce error POR CAMPO", () => {
    const res = validarEvento({ ...CAMPOS_VALIDOS, nombre: "" }, null);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errores.nombre).toBeDefined();
      expect(res.errores.nombre?.length).toBeGreaterThan(0);
    }
  });

  it("slug inválido es rechazado con error de campo", () => {
    const res = validarEvento(
      { ...CAMPOS_VALIDOS, slug: "Con Espacios" },
      null,
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errores.slug).toBeDefined();
  });

  it("costo no numérico es rechazado", () => {
    const res = validarEvento({ ...CAMPOS_VALIDOS, costoPesos: "gratis" }, null);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errores.costoCentavos).toBeDefined();
  });

  it("conserva la imagen inyectada en el caso de edición", () => {
    const res = validarEvento(CAMPOS_VALIDOS, "https://cdn/x.webp");
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.datos.imagenPath).toBe("https://cdn/x.webp");
  });
});

describe("procesarImagenEvento (sharp)", () => {
  it("ajusta dentro del cuadro máximo SIN recortar y recomprime a WebP", async () => {
    // Cartel vertical: debe conservar su proporción (sin corte), limitado por el
    // lado mayor (alto) a 1600 px.
    const origen = await sharp({
      create: {
        width: 2000,
        height: 2800,
        channels: 3,
        background: { r: 180, g: 36, b: 56 },
      },
    })
      .png()
      .toBuffer();

    const salida = await procesarImagenEvento(new Uint8Array(origen));
    const meta = await sharp(Buffer.from(salida)).metadata();

    expect(meta.format).toBe("webp");
    // Proporción original 2000:2800 preservada (sin recorte a 16:9); el lado
    // mayor (alto) se limita a 1600 y el ancho escala en proporción.
    expect(meta.width).toBe(1143);
    expect(meta.height).toBe(1600);
  });

  it("lanza si los bytes están vacíos", async () => {
    await expect(procesarImagenEvento(new Uint8Array())).rejects.toThrow();
  });
});
