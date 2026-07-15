import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { EmailRecipient } from "@/db/schema";
import {
  enviarConfirmacionRegistro,
  enviarNotificacionDocumento,
  seleccionarDestinatarios,
} from "@/lib/notificaciones/enviar";

/** Fabrica un destinatario para las pruebas. */
function destinatario(
  correo: string,
  perfil: EmailRecipient["perfil"],
  activo = true,
): EmailRecipient {
  return { id: `id-${correo}`, correo, perfil, activo };
}

describe("seleccionarDestinatarios (match perfil ↔ nivel_acceso)", () => {
  const lista: EmailRecipient[] = [
    destinatario("consejo1@comenor.mx", "consejo"),
    destinatario("consejo2@comenor.mx", "consejo", false), // inactivo
    destinatario("asociado1@comenor.mx", "asociados"),
    destinatario("admin1@comenor.mx", "admin"),
  ];

  it("nivel 'consejo' selecciona solo perfiles 'consejo' activos", () => {
    const seleccion = seleccionarDestinatarios(lista, "consejo");
    expect(seleccion.map((d) => d.correo)).toEqual(["consejo1@comenor.mx"]);
  });

  it("nivel 'asociados' selecciona solo perfiles 'asociados' activos", () => {
    const seleccion = seleccionarDestinatarios(lista, "asociados");
    expect(seleccion.map((d) => d.correo)).toEqual(["asociado1@comenor.mx"]);
  });

  it("nivel 'publico' no tiene perfil equivalente: no selecciona a nadie", () => {
    expect(seleccionarDestinatarios(lista, "publico")).toEqual([]);
  });

  it("excluye destinatarios inactivos aunque el perfil coincida", () => {
    const soloInactivo = [destinatario("x@comenor.mx", "consejo", false)];
    expect(seleccionarDestinatarios(soloInactivo, "consejo")).toEqual([]);
  });
});

describe("envío sin RESEND_API_KEY (modo simulado)", () => {
  const original = process.env.RESEND_API_KEY;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = original;
  });

  it("enviarConfirmacionRegistro devuelve { simulado: true } y no lanza", async () => {
    const resultado = await enviarConfirmacionRegistro({
      correo: "persona@ejemplo.mx",
      nombre: "María López",
      eventoNombre: "Foro IC 2026",
      eventoFecha: new Date("2026-09-24T17:00:00.000Z"),
      eventoSede: "Centro Citibanamex",
      eventoModalidad: "Presencial",
      montoCentavos: 150000,
      folio: "abc-123",
    });
    expect(resultado).toEqual({ simulado: true });
  });

  it("enviarConfirmacionRegistro también simula un registro gratuito", async () => {
    const resultado = await enviarConfirmacionRegistro({
      correo: "gratis@ejemplo.mx",
      nombre: "Juan Pérez",
      eventoNombre: "Webinar abierto",
      eventoFecha: new Date("2026-10-01T16:00:00.000Z"),
      eventoSede: "Virtual",
      eventoModalidad: "Virtual",
      montoCentavos: 0,
    });
    expect(resultado).toEqual({ simulado: true });
  });

  it("enviarNotificacionDocumento simula un correo por destinatario del perfil", async () => {
    const lista: EmailRecipient[] = [
      destinatario("consejo1@comenor.mx", "consejo"),
      destinatario("asociado1@comenor.mx", "asociados"),
      destinatario("admin1@comenor.mx", "admin"),
    ];

    const resultado = await enviarNotificacionDocumento(lista, {
      documentoTitulo: "Acta de sesión",
      documentoTipo: "Acta",
      mes: 7,
      anio: 2026,
      nivelAcceso: "consejo",
      urlAcceso: "https://comenor.org.mx/miembros/documentos/doc-1",
    });

    // Solo el perfil 'consejo' fue notificado.
    expect(resultado.enviados).toBe(1);
    expect(resultado.resultados).toEqual([{ simulado: true }]);
  });
});
