import { describe, expect, it } from "vitest";
import {
  ConfirmacionRegistro,
  NotificacionDocumento,
  RecuperacionAcceso,
  asuntos,
  renderizarCorreo,
} from "@/emails";
import type { ConfirmacionRegistroProps } from "@/emails";

/**
 * Test de humo de las plantillas de correo: comprueba que compilan, que se
 * renderizan a HTML y a texto plano, y que los datos por props aparecen en la
 * salida (cero hardcode). No hay servicio de correo vivo aquí: solo el render.
 */

const propsRegistro: ConfirmacionRegistroProps = {
  nombre: "Ana Torres",
  eventoNombre: "Congreso Nacional de Normalización 2026",
  eventoFecha: new Date("2026-09-24T17:00:00.000Z"),
  eventoSede: "Centro Citibanamex, Ciudad de México",
  eventoModalidad: "Presencial",
  qrDataUri:
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  folio: "abc-123",
  montoCentavos: 150000,
  urlEvento: "https://comenor.org.mx/eventos/congreso-2026",
};

describe("ConfirmacionRegistro", () => {
  it("renderiza HTML y texto plano con los datos por props", async () => {
    const { html, texto } = await renderizarCorreo(
      ConfirmacionRegistro,
      propsRegistro,
    );

    expect(html).toContain("<!DOCTYPE");
    expect(html).toContain("Ana Torres");
    expect(html).toContain("Congreso Nacional de Normalización 2026");
    // Monto formateado en MXN (Intl es-MX).
    expect(html).toContain("$1,500.00");
    // El QR va embebido como imagen.
    expect(html).toContain("data:image/gif;base64");

    expect(texto).toContain("Ana Torres");
    expect(texto).toContain("Congreso Nacional de Normalización 2026");
    expect(texto.length).toBeGreaterThan(0);
  });

  it("muestra 'Gratuito' cuando el monto es 0 o nulo", async () => {
    const { html } = await renderizarCorreo(ConfirmacionRegistro, {
      ...propsRegistro,
      montoCentavos: 0,
    });
    expect(html).toContain("Gratuito");
  });

  it("omite el bloque de QR cuando no se provee", async () => {
    const { html } = await renderizarCorreo(ConfirmacionRegistro, {
      ...propsRegistro,
      qrDataUri: undefined,
    });
    expect(html).not.toContain("data:image/gif;base64");
  });
});

describe("NotificacionDocumento", () => {
  it("renderiza con el periodo en español y el enlace de acceso", async () => {
    const { html, texto } = await renderizarCorreo(NotificacionDocumento, {
      documentoTitulo: "Acta de Sesión Ordinaria",
      documentoTipo: "Acta",
      mes: 7,
      anio: 2026,
      nivelAcceso: "consejo",
      urlAcceso: "https://miembros.comenor.org.mx/documentos/acta-julio",
    });

    expect(html).toContain("Acta de Sesión Ordinaria");
    expect(html).toContain("Julio de 2026");
    expect(html).toContain(
      "https://miembros.comenor.org.mx/documentos/acta-julio",
    );
    expect(texto).toContain("Acta de Sesión Ordinaria");
  });
});

describe("RecuperacionAcceso", () => {
  it("renderiza el enlace y la vigencia por defecto", async () => {
    const { html, texto } = await renderizarCorreo(RecuperacionAcceso, {
      nombre: "Luis",
      urlRecuperacion: "https://miembros.comenor.org.mx/recuperacion?token=xyz",
    });

    expect(html).toContain(
      "https://miembros.comenor.org.mx/recuperacion?token=xyz",
    );
    // React separa nodos de texto con marcadores <!-- -->, así que la vigencia
    // ("60") y su unidad no quedan contiguas en el HTML: se verifican por parte.
    expect(html).toContain(">60<");
    expect(html).toContain("minutos");
    expect(texto).toContain("Luis");
    expect(texto).toContain("60");
  });
});

describe("asuntos", () => {
  it("componen el asunto con los datos provistos", () => {
    expect(asuntos.confirmacionRegistro("Congreso 2026")).toBe(
      "Registro confirmado: Congreso 2026",
    );
    expect(asuntos.notificacionDocumento("Acta")).toBe(
      "Nuevo documento disponible: Acta",
    );
    expect(asuntos.recuperacionAcceso()).toContain("contraseña");
  });
});
